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
    const dir = await DirModel.get({ pk: `DIR#${id}`, sk: "DIR" })
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
      sk: `DIR`,
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
  const dirName = apiString(data.dirName)
  const newDirName = apiString(data.newDirName)
  if (!(id && dirName && newDirName)) {
    return Response.json({ error: "Bad request" }, { status: 400 })
  } else if (dirName === newDirName) {
    return Response.json({ message: "DirName not changed" }, { status: 200 })
  }

  try {
    const rel = await RelationModel.query().where('sk').eq(`DIRNAME#${newDirName}`).exec()
    console.log(rel)
    if (rel.count) {
      return Response.json({ error: "DirName already exists" }, { status: 409 })
    }
    await RelationModel.delete({ pk: `DIR#${id}`, sk: `DIRNAME#${dirName}` })
    await RelationModel.create({ pk: `DIR#${id}`, sk: `DIRNAME#${newDirName}` })

    const res = await DirModel.update({ pk: `DIR#${id}`, sk: "DIR" }, {
      dirName: newDirName, GSI1SK: (new Date()).getTime()
    })
    console.log(res)
    return Response.json({ data: res }, { status: 200 })
  } catch (err) {
    console.log(err)
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
  const dirName = apiString(data.dirName)
  if (!(id && dirName)) {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }

  try {
    // 待完成：先删干净关联的项目
    // const res_pk = await ArticleModel.query().where('GSI1PK').eq(dir_gsi1pk).exec()
    // // console.log(res_pk)
    // if (res_pk.count) {
    //   const pksks = res_pk.map(i => ({
    //     pk: i.pk,
    //     sk: i.sk
    //   }))
    //   // console.log(pksks)
    //   await ArticleModel.batchDelete(pksks)
    // }

    await RelationModel.delete({ pk: `DIR#${id}`, sk: `DIRNAME#${dirName}` })
    await DirModel.delete({ pk: `DIR#${id}`, sk: "DIR" })
    return Response.json({ message: "Delete complete" }, { status: 200 })
  } catch (err) {
    console.log(err)
    return Response.json({ error: err.toString() }, { status: 500 })
  }
}
