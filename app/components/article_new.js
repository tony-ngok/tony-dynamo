"use client"

import Link from "next/link"
import { redirect } from "next/navigation"
import { useState } from "react"
import Editor from "../lexical_editor/editor"

export default function ArticleNew({ pk, dirId }) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [htmlContent, setHtmlContent] = useState("")
  const [createError, setCreateError] = useState(false)
  const [disabled, setDisabled] = useState(false)

  const handelSubmit = async (e) => {
    e.preventDefault()
    setCreateError(false)
    setDisabled(true)

    const res = await fetch('/api/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: decodeURIComponent(pk),
        title: title,
        content: content,
        htmlContent: htmlContent,
        dir: dirId
      })
    })
    if (res.ok) {
      redirect(dirId ? `/${pk}/dir/${dirId}` : `/${pk}`)
    } else {
      setCreateError(true)
      setDisabled(false)
    }
  }

  if (!pk) return <div>载入中...</div>

  return (
    <>
      <h1>创建日记</h1>
      <div>当前 Email：<strong>{decodeURIComponent(pk)}</strong></div>
      {dirId && <div>收藏 ID：${dirId}</div>}
      {createError && <div style={{ color: "red" }}>出错，请再试</div>}

      <form onSubmit={handelSubmit}>
        <div>
          <label>题目</label>
          <input onChange={(e) => setTitle(e.target.value)} disabled={disabled} required />
        </div>

        <div>
          <Editor setContent={setContent} setHtmlContent={setHtmlContent} isError={createError} />
        </div>

        <button type="submit" disabled={disabled}>提交</button>
      </form>

      <Link href={dirId ? `/${pk}/dir/${dirId}` : `/${pk}`}>返回</Link>
    </>
  )
}
