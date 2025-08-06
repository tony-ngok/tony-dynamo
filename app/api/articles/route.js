import { QUERY_LIMIT } from "@/app/models/_dynamooseConfig"
import ArticleModel from "@/app/models/ArticleModel"
import CommentModel from "@/app/models/CommentModel"
import DirModel from "@/app/models/DirModel"
import RelationModel from "@/app/models/RelationModel"
import { getKey, gsiQueryAll, pagingQuery, sliceBatchDelete } from "@/app/utils/db_utils"
import { apiNatNum, apiString, getId, htmlText } from "@/app/utils/string_utils"
import { nanoid } from "nanoid"

export async function GET(request) {
  const url = new URL(request.url)
  const dirId = url.searchParams.get('dirId')
  const sort = url.searchParams.get('sort') || 'ascending'
  if (!dirId || (sort !== 'ascending' && sort !== 'descending')) {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }

  let lastKey
  try {
    const lastKeyParam = url.searchParams.get('lastKey')
    if (lastKeyParam) {
      lastKey = JSON.parse(decodeURIComponent(lastKeyParam))
      // console.log(lastKey)
    }
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }

  try {
    let p = apiNatNum(url.searchParams.get('p'))
    if (p === 1 && lastKey) { // 第一页查询不应有索引键
      return Response.json({ error: "Bad request" }, { status: 400 })
    } else if (p !== 1 && !lastKey) {
      p = 1
    }

    const total = await gsiQueryAll(ArticleModel, `DIR#${dirId}`, undefined, true, true)
    const totalPages = Math.ceil(total / QUERY_LIMIT)
    if (p > totalPages) { // 非法状态：翻过页了
      return Response.json({ error: "Page not found" }, { status: 404 })
    }

    const baseQuery = ArticleModel.query().where('GSI1PK').eq(`DIR#${dirId}`).using('SortIndex')
    let res // 向后查询
    let firstKey
    let res1 // 向前查询
    const unsort = sort === 'ascending' ? 'descending' : 'ascending'
    let keys // 可以翻到的页数

    if (p === 1) { // 第一頁：需要能够看到第2、3、4页
      res = await pagingQuery(baseQuery, null, QUERY_LIMIT * 3, sort)
      keys = {
        2: totalPages >= 2 ? getKey(res.data[QUERY_LIMIT - 1]) : undefined,
        3: totalPages >= 3 ? getKey(res.data[QUERY_LIMIT * 2 - 1]) : undefined,
        4: res.nextKey
      }
    } else if (p === 2) {
      res = await pagingQuery(baseQuery, lastKey, QUERY_LIMIT * 2, sort)

      // 此处 null 专指第一页不需要查询起始键（即强行回到第一页）
      keys = {
        1: null,
        3: totalPages >= 3 ? getKey(res.data[QUERY_LIMIT - 1]) : undefined,
        4: res.nextKey
      }
    } else if (p === 3 && totalPages <= 4) { // 第三页：总页数为3或4时为第三个按纽
      res = await pagingQuery(baseQuery, lastKey, QUERY_LIMIT, sort)
      res1 = await pagingQuery(baseQuery, null, QUERY_LIMIT, sort)
      keys = { 1: null, 2: res1.nextKey, 4: res.nextKey }
    } else {
      if (p === totalPages) { // 最后一页：第四个按纽
        res = await pagingQuery(baseQuery, lastKey, QUERY_LIMIT, sort)
        if (res.data.length) {
          firstKey = getKey(res.data[0])
          res1 = await pagingQuery(baseQuery, firstKey, QUERY_LIMIT * 3, unsort)

          keys = {}
          keys[p - 3] = res1.nextStart || null
          keys[p - 2] = getKey(res1.data[QUERY_LIMIT * 2]) || null
          keys[p - 1] = getKey(res1.data[QUERY_LIMIT]) || null
        } else {
          return Response.json({ error: "Page not found" }, { status: 404 })
        }
      } else if (p === totalPages - 1) { // 倒数第二页：第三个按纽
        res = await pagingQuery(baseQuery, lastKey, QUERY_LIMIT, sort)
        if (res.data.length) {
          firstKey = getKey(res.data[0])
          res1 = await pagingQuery(baseQuery, firstKey, QUERY_LIMIT * 2, unsort)

          keys = {}
          keys[p - 2] = res1.nextStart || null
          keys[p - 1] = getKey(res1.data[QUERY_LIMIT]) || null
          keys[p + 1] = res.nextKey
        } else {
          return Response.json({ error: "Page not found" }, { status: 404 })
        }
      } else { // 第二个按钮
        res = await pagingQuery(baseQuery, lastKey, QUERY_LIMIT * 2, sort)
        if (res.data.length) {
          firstKey = getKey(res.data[0])
          res1 = await pagingQuery(baseQuery, firstKey, QUERY_LIMIT, unsort)

          keys = {}
          keys[p - 1] = res1.nextStart || null
          keys[p + 1] = getKey(res.data[QUERY_LIMIT - 1])
          keys[p + 2] = res.nextKey
        } else {
          return Response.json({ error: "Page not found" }, { status: 404 })
        }
      }
    }

    console.log({
      data: res?.data.slice(0, QUERY_LIMIT) || [], totalPages: totalPages, keys: keys
    })
    return Response.json({
      data: res?.data.slice(0, QUERY_LIMIT) || [], totalPages: totalPages, keys: keys
    }, { status: 200 })
  } catch (err) {
    console.log(err)
    return Response.json({ error: err.toString() }, { status: 500 })
  }
}

export async function POST(request) {
  let data
  try {
    data = await request.json()
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }

  const dirId = apiString(data.dirId)
  const title = apiString(data.title)
  const content = apiString(data.content)
  const htmlContent = apiString(data.htmlContent)
  if (!(dirId && title && content && htmlText(htmlContent))) {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }

  try {
    const articlePk = `ARTICLE#${nanoid()}`
    const article = await ArticleModel.get({ pk: articlePk, sk: articlePk })
    if (article) {
      return Response.json({ error: "ID conflict, please try again" }, { status: 409 })
    }

    const dir = await DirModel.get({ pk: `DIR#${dirId}`, sk: `DIR#${dirId}` })
    if (!dir) {
      return Response.json({ error: "Dir not found" }, { status: 404 })
    }
    await RelationModel.create({
      pk: articlePk,
      sk: 'RELATION',
      GSI1PK: 'RELATION',
      GSI1SK: `DIR#${dirId}#ARTICLE`
    })

    const createTimestamp = (new Date()).getTime()
    const res = await ArticleModel.create({
      pk: articlePk,
      sk: articlePk,
      GSI1PK: `DIR#${dirId}`,
      GSI1SK: createTimestamp.toString().padStart(13, '0'),
      title: title,
      content: content,
      htmlContent: htmlContent,
      createTimestamp: createTimestamp,
      updateTimestamp: createTimestamp
    })
    // console.log(res)
    return Response.json({ data: res }, { status: 200 })
  } catch (err) {
    // console.log(err)
    return Response.json({ error: err.toString() }, { status: 500 })
  }
}

export async function PATCH(request) {
  let data
  try {
    data = await request.json()
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }

  const id = apiString(data.id)
  const title = apiString(data.title)
  const content = apiString(data.content)
  const htmlContent = apiString(data.htmlContent)
  if (!(id && title && content && htmlText(htmlContent))) {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }

  try {
    const articlePk = `ARTICLE#${id}`
    const article = await ArticleModel.get({ pk: articlePk, sk: articlePk })
    if (!article) {
      return Response.json({ error: "Article not found" }, { status: 404 })
    }

    const updateTimestamp = (new Date()).getTime()
    const res = await ArticleModel.update({ pk: articlePk, sk: articlePk }, {
      content: content,
      htmlContent: htmlContent,
      title: title,
      GSI1SK: updateTimestamp.toString().padStart(13, '0'),
      updateTimestamp: updateTimestamp
    })
    // console.log(res)
    return Response.json({ data: res }, { status: 200 })
  } catch (err) {
    // console.log(err)
    return Response.json({ error: err.toString() }, { status: 500 })
  }
}

export async function DELETE(request) {
  let data
  try {
    data = await request.json()
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }

  const dirId = apiString(data.dirId)
  const id = apiString(data.id)
  if (!(dirId && id)) {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }

  try {
    const articlePk = `ARTICLE#${id}`
    const article = await ArticleModel.get({ pk: articlePk, sk: articlePk })
    if (!(article && getId(article.GSI1PK) === dirId)) {
      return Response.json({ message: "Article not found" }, { status: 404 })
    }

    // 清除留言与目录间的关系
    const comms_rels_query = await gsiQueryAll(RelationModel, 'RELATION',
      `DIR#${dirId}#${articlePk}#COMMENT`
    )
    // console.log(comms_rels_query)

    // 清除相关的留言
    let comms_pksks = []
    for (const rel of comms_rels_query) {
      if (rel.pk.startsWith("COMMENT#")) {
        comms_pksks.push({ pk: rel.pk, sk: rel.pk })
      }
    }
    // console.log(comms_pksks)

    await sliceBatchDelete(RelationModel, comms_rels_query)
    await sliceBatchDelete(CommentModel, comms_pksks, false)

    await RelationModel.delete({ pk: articlePk, sk: 'RELATION' })
    await article.delete()
    return Response.json({ message: "Delete complete" }, { status: 200 })
  } catch (err) {
    // console.log(err)
    return Response.json({ error: err.toString() }, { status: 500 })
  }
}
