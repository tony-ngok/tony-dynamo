import { QUERY_LIMIT } from "../models/_dynamooseConfig"

export function getKey(object) {
  if (object) {
    const { pk, sk, GSI1PK, GSI1SK, ..._ } = object
    return { pk, sk, GSI1PK, GSI1SK }
  }
}

export async function pagingQuery(baseQuery, startKey, limit, sort) {
  let q = baseQuery.sort(sort).limit(limit + 1)
  if (startKey) q = q.startAt(startKey)

  const res = await q.exec()
  const items = res.toJSON()
  const data = items.slice(0, limit)

  let nextKey
  let nextStart
  if (items.length > limit) {
    nextKey = getKey(items[limit - 1])
    nextStart = getKey(items[limit])
  }

  return { data: data, nextKey: nextKey, nextStart: nextStart }
}

export async function gsiQueryAll(model, gsi1pk, gsi1sk, eq = true, count = false) {
  let queryAll = []
  let queryAllCount = 0

  let query = model.query().where('GSI1PK').eq(gsi1pk)
  if (gsi1sk) {
    query = query.where('GSI1SK')
    query = eq ? query.eq(gsi1sk) : query.beginsWith(gsi1sk)
  }
  if (count) { query = query.count() }
  query = await query.exec()

  if (query.count) {
    while (true) {
      let lastKey = query.lastKey

      if (count) {
        queryAllCount += query.count
      } else {
        queryAll = [...queryAll, ...query]
      }
      if (!lastKey) break

      query = model.query().where('GSI1PK').eq(gsi1pk).where('GSI1SK')
      query = (eq ? query.eq(gsi1sk) : query.beginsWith(gsi1sk)).startAt(lastKey)
      if (count) { query = query.count() }
      query = await query.exec()
    }
  }

  return count ? queryAllCount : queryAll
}

export async function sliceBatchDelete(model, queryItems, map = true) {
  if (queryItems.length) {
    let query_pksks
    if (map) {
      query_pksks = queryItems.map(i => ({
        pk: i.pk,
        sk: i.sk
      }))
    } else {
      query_pksks = [...queryItems]
    }

    let err = false
    if (query_pksks.length <= 25) {
      const batch_del = await model.batchDelete(query_pksks)
      if (batch_del.unprocessedItems.length) {
        err = true
      }
    } else {
      const total = Math.ceil(query_pksks.count / 25)
      for (let i = 0; i < total; i++) {
        const slice = query_pksks.slice(i * 25, (i + 1) * 25)
        const batch_del = await model.batchDelete(slice)
        if (batch_del.unprocessedItems.length && !err) {
          err = true
        }
      }
    }

    if (err) throw new Error("BatchDelete error: has unprocessedItems")
  }
}
