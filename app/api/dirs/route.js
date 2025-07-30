import ArticleModel from "@/app/models/ArticleModel"
import CommentModel from "@/app/models/CommentModel"
import DirModel from "@/app/models/DirModel"
import RelationModel from "@/app/models/RelationModel"
import { gsiQueryAll, sliceBatchDelete } from "@/app/utils/db_utils"
import { apiString } from "@/app/utils/string_utils"
import { nanoid } from "nanoid"

export async function GET(request) {
  const url = new URL(request.url)
  const sort = url.searchParams.get('sort') || 'descending'
  if (sort !== 'ascending' && sort !== 'descending') {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }

  try {
    const res = await DirModel.query().where('GSI1PK').eq('DIR').using('SortIndex').sort(sort).exec()
    // console.log(res)
    return Response.json({ data: res }, { status: 200 })
  } catch (err) {
    // console.log(err)
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

  const dirName = apiString(data.dirName)
  if (!dirName) {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }

  try {
    const dirPk = `DIR#${nanoid()}`
    const dir = await DirModel.get({ pk: dirPk, sk: dirPk })
    if (dir) {
      return Response.json({ error: "ID conflict, please try again" }, { status: 409 })
    }

    const rel = await RelationModel.query().where('GSI1PK').eq('DIRNAME')
      .where('GSI1SK').eq(dirName).exec()
    // console.log(rel)
    if (rel.count) {
      return Response.json({ error: "DirName already exists" }, { status: 409 })
    }
    await RelationModel.create({ pk: dirPk, sk: 'DIRNAME', GSI1PK: 'DIRNAME', GSI1SK: dirName })

    const createTimestamp = (new Date()).getTime()
    const res = await DirModel.create({
      pk: dirPk,
      sk: dirPk,
      dirName: dirName,
      GSI1PK: "DIR",
      GSI1SK: createTimestamp.toString().padStart(13, '0'),
      createTimestamp: createTimestamp,
      updateTimestamp: createTimestamp
    })
    // console.log(res)
    return Response.json({ data: res }, { status: 201 })
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
  const newDirName = apiString(data.newDirName)
  if (!(id && newDirName)) {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }

  try {
    const dirPk = `DIR#${id}`
    const oldDir = await DirModel.get({ pk: dirPk, sk: dirPk })
    if (!oldDir) {
      return Response.json({ error: "Dir not found" }, { status: 404 })
    } else if (oldDir.dirName === newDirName) {
      return Response.json({ message: "DirName not changed" }, { status: 200 })
    }

    const rel = await RelationModel.query().where('GSI1PK').eq('DIRNAME')
      .where('GSI1SK').eq(newDirName).exec()
    // console.log(rel)
    if (rel.count) {
      return Response.json({ error: "DirName already exists" }, { status: 409 })
    }
    await RelationModel.update({ pk: dirPk, sk: 'DIRNAME' }, { GSI1PK: 'DIRNAME', GSI1SK: newDirName })

    const updateTimestamp = (new Date()).getTime()
    const res = await DirModel.update({ pk: dirPk, sk: dirPk }, {
      dirName: newDirName,
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

  const id = apiString(data.id)
  if (!id) {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }

  try {
    const dirPk = `DIR#${id}`
    const dir = await DirModel.get({ pk: dirPk, sk: dirPk })
    if (!dir) {
      return Response.json({ message: "Dir not found" }, { status: 404 })
    }

    // 清除留言、文章与目录间的关系
    const rels_query = await gsiQueryAll(RelationModel, 'RELATION', dirPk, false)
    // console.log(rels_query)

    // 清除相关的留言、文章
    let comms_pksks = []
    let articles_pksks = []
    for (const rel of rels_query) {
      if (rel.pk.startsWith("COMMENT#")) {
        comms_pksks.push({ pk: rel.pk, sk: rel.pk })
      } else if (rel.pk.startsWith("ARTICLE#")) {
        articles_pksks.push({ pk: rel.pk, sk: rel.pk })
      }
    }
    // console.log(comms_pksks)
    // console.log(articles_pksks)

    await sliceBatchDelete(RelationModel, rels_query)
    await sliceBatchDelete(CommentModel, comms_pksks, false)
    await sliceBatchDelete(ArticleModel, articles_pksks, false)

    await RelationModel.delete({ pk: dirPk, sk: 'DIRNAME' })
    await dir.delete()
    return Response.json({ message: "Delete complete" }, { status: 200 })
  } catch (err) {
    // console.log(err)
    return Response.json({ error: err.toString() }, { status: 500 })
  }
}
