"use client"

import { toLocaleDateTime } from "@/app/utils/string_utils"
import Link from "next/link"
import { useEffect, useState } from "react"
import CommentTable from "../comments/comment_table"

export default function ArticleView({ dirId, id }) {
  const [article, setArticle] = useState(undefined)
  const [dirName, setDirName] = useState("")
  const [readError, setReadError] = useState(0)

  useEffect(() => {
    async function loadDir() {
      const res_dir = await fetch(`/api/dir?id=${dirId}`)
      if (res_dir.ok) {
        setDirName((await res_dir.json()).data.dirName)
      } else if (res_dir.status === 404) {
        setReadError(2)
      } else {
        setReadError(1)
      }
    }
    if (dirId) { loadDir() }
  }, [dirId])

  useEffect(() => {
    async function getArticle() {
      const res_article = await fetch(`/api/article?id=${id}`)
      if (res_article.ok) {
        const res_data = (await res_article.json()).data
        if (res_data.GSI1PK !== `DIR#${dirId}`) {
          setReadError(3)
          return
        }

        setArticle(res_data)
      } else if (res_article.status === 404) {
        setReadError(3)
      } else {
        setReadError(1)
      }
    }
    if (!readError && dirName && id) { getArticle() }
  }, [dirName, id])

  if (!(dirId && id)) return null
  if (readError === 1) return <div style={{ color: "red" }}>出错了，刷新一下吧</div>

  if (readError === 2) {
    return (
      <>
        <div>目录不存在</div>
        <Link href="/">返回首页</Link>
      </>
    )
  }

  if (readError === 3) {
    return (
      <>
        <div>文章不存在</div>
        <Link href={`/${dirId}`}>返回上级目录</Link>
      </>
    )
  }

  if (article === undefined) return <div>载入中...</div>

  return (
    <>
      <Link href={`/${dirId}`}>返回上级目录</Link>
      <h1>{article.title}</h1>
      <div>最终更新时间：{toLocaleDateTime(article.updateTimestamp)}</div>
      <div dangerouslySetInnerHTML={{ __html: article.htmlContent }} />
      <hr />
      {!readError && article && <CommentTable dirId={dirId} articleId={id} setReadError={setReadError} />}
    </>
  )
}
