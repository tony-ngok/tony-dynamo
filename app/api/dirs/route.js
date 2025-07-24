import ArticleModel from "@/app/models/ArticleModel"
import DirModel from "@/app/models/DirModel"
import RelationModel from "@/app/models/RelationModel"
import { apiString } from "@/app/string_utils"
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
    const id = nanoid()
    const dir = await DirModel.get({ pk: `DIR#${id}`, sk: `DIR#${id}` })
    if (dir) {
      return Response.json({ error: "ID conflict, please try again" }, { status: 409 })
    }

    const rel = await RelationModel.query().where('sk').eq(`DIRNAME#${dirName}`).exec()
    // console.log(rel)
    if (rel.count) {
      return Response.json({ error: "DirName already exists" }, { status: 409 })
    }
    await RelationModel.create({ pk: `DIR#${id}`, sk: `DIRNAME#${dirName}` })

    const res = await DirModel.create({
      pk: `DIR#${id}`,
      sk: `DIR#${id}`,
      GSI1PK: "DIR",
      GSI1SK: (new Date()).getTime(),
      dirName: dirName
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
    const rel = await RelationModel.query().where('sk').eq(`DIRNAME#${newDirName}`).exec()
    // console.log(rel)
    if (rel.count) {
      return Response.json({ error: "DirName already exists" }, { status: 409 })
    }

    const oldDir = await DirModel.get({ pk: `DIR#${id}`, sk: `DIR#${id}` })
    if (!oldDir) {
      return Response.json({ error: "Dir not found" }, { status: 404 })
    } else if (oldDir.dirName === newDirName) {
      return Response.json({ message: "DirName not changed" }, { status: 200 })
    }

    await RelationModel.delete({ pk: `DIR#${id}`, sk: `DIRNAME#${oldDir.dirName}` })
    await RelationModel.create({ pk: `DIR#${id}`, sk: `DIRNAME#${newDirName}` })

    const res = await DirModel.update({ pk: `DIR#${id}`, sk: `DIR#${id}` }, {
      dirName: newDirName, GSI1SK: (new Date()).getTime()
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
    const oldDir = await DirModel.get({ pk: `DIR#${id}`, sk: `DIR#${id}` })
    if (!oldDir) {
      return Response.json({ error: "Dir not found" }, { status: 404 })
    }

    // 待完成：先删干净关联的项目
    const articles = await ArticleModel.query().where('GSI1PK').eq(`DIR#${id}`).exec()
    // console.log(articles)
    if (articles.count) {
      const articles_pksks = articles.map(i => ({
        pk: i.pk,
        sk: i.sk
      }))
      // console.log(articles_pksks)
      await ArticleModel.batchDelete(articles_pksks)
    }

    await RelationModel.delete({ pk: `DIR#${id}`, sk: `DIRNAME#${oldDir.dirName}` })
    await DirModel.delete({ pk: `DIR#${id}`, sk: `DIR#${id}` })
    return Response.json({ message: "Delete complete" }, { status: 200 })
  } catch (err) {
    console.log(err)
    return Response.json({ error: err.toString() }, { status: 500 })
  }
}
