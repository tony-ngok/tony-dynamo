import { QUERY_LIMIT } from "../models/_dynamooseConfig"

export async function gsiQueryAll(model, gsi1pk, gsi1sk, eq = true) {
  let queryAll = []

  let query = model.query().where('GSI1PK').eq(gsi1pk).where('GSI1SK')
  query = await (eq ? query.eq(gsi1sk) : query.beginsWith(gsi1sk)).limit(QUERY_LIMIT).exec()

  if (query.count) {
    while (true) {
      let lastKey = query.lastKey

      queryAll = [...queryAll, ...query]
      if (!lastKey) break

      query = model.query().where('GSI1PK').eq(gsi1pk).where('GSI1SK')
      query = await (eq ? query.eq(gsi1sk) : query.beginsWith(gsi1sk)).limit(QUERY_LIMIT)
        .startAt(lastKey).exec()
    }
  }

  return queryAll
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
