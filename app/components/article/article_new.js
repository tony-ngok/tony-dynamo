"use client"

import Link from "next/link"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
import Editor from "../../lexical_editor/editor"

export default function ArticleNew({ dirId }) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [htmlContent, setHtmlContent] = useState("")
  const [createError, setCreateError] = useState(false)
  const [disabled, setDisabled] = useState(false)
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

  const handelSubmit = async (e) => {
    e.preventDefault()
    setCreateError(false)
    setDisabled(true)

    const res = await fetch('/api/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dirId: dirId,
        title: title,
        content: content,
        htmlContent: htmlContent
      })
    })
    if (res.ok) {
      redirect(`/${dirId}`)
    } else {
      setCreateError(true)
      setDisabled(false)
    }
  }

  if (!dirId) return null
  if (readError === 1) return <div style={{ color: "red" }}>出错了，刷新一下吧</div>

  if (readError === 2) {
    return (
      <>
        <div>目录不存在</div>
        <Link href="/">返回首页</Link>
      </>
    )
  }

  if (!dirName) return <div>载入中...</div>

  return (
    <>
      <h1>创建日记</h1>
      <h2>目录：{dirName}</h2>
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

      <Link href={`/${dirId}`}>返回</Link>
    </>
  )
}
