"use client"

import Link from "next/link"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
import Editor from "../lexical_editor/editor"

export default function ArticleEdit({ pk, dirId, id }) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState(undefined)
  const [htmlContent, setHtmlContent] = useState(undefined)
  const [hasError, setHasError] = useState(0)
  const [disabled, setDisabled] = useState(false)

  useEffect(() => {
    async function getArticle() {
      const res_article = await fetch(`/api/article?id=${id}`)
      if (res_article.ok) {
        const res_data = (await res_article.json()).data
        setTitle(res_data.title)
        setContent(res_data.content)
        setHtmlContent(res_data.htmlContent)
      } else {
        setHasError(1)
      }
    }
    getArticle()
  }, [])

  const handelSubmit = async (e) => {
    e.preventDefault()
    setHasError(0)
    setDisabled(true)

    const res = await fetch('/api/articles', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: id,
        title: title,
        content: content,
        htmlContent: htmlContent,
        dir: dirId
      })
    })
    if (res.ok) {
      redirect(dirId ? `/${pk}/dir/${dirId}` : `/${pk}`)
    } else {
      setHasError(2)
      setDisabled(false)
    }
  }

  if (content === undefined) return <div>载入中...</div>
  if (hasError === 1) return <div style={{ color: "red" }}>出错，请刷新</div>

  return (
    <>
      <h1>修改日记</h1>
      <div>当前 Email：<strong>{decodeURIComponent(pk)}</strong></div>
      {dirId && <div>收藏 ID：${dirId}</div>}
      {hasError === 2 && <div style={{ color: "red" }}>出错，请再试</div>}

      <form onSubmit={handelSubmit}>
        <div>
          <label>题目</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} disabled={disabled} required />
        </div>

        <div>
          <Editor initContent={content} setContent={setContent} setHtmlContent={setHtmlContent}
            editable={!disabled} isError={Boolean(hasError)}
          />
        </div>

        <button type="submit" disabled={disabled}>提交</button>
      </form>

      <Link href={dirId ? `/${pk}/dir/${dirId}` : `/${pk}`}>返回</Link>
    </>
  )
}
