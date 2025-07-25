"use client"

import Link from "next/link"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
import Editor from "../../lexical_editor/editor"

export default function ArticleEdit({ dirId, id }) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState(undefined)
  const [htmlContent, setHtmlContent] = useState(undefined)
  const [updateError, setUpdateError] = useState(false)
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

  useEffect(() => {
    async function getArticle() {
      const res_article = await fetch(`/api/article?id=${id}`)
      if (res_article.ok) {
        const res_data = (await res_article.json()).data
        if (res_data.GSI1PK !== `DIR#${dirId}`) {
          setReadError(3)
          return
        }

        setTitle(res_data.title)
        setContent(res_data.content)
        setHtmlContent(res_data.htmlContent)
      } else if (res_article.status === 404) {
        setReadError(3)
      } else {
        setReadError(1)
      }
    }
    if (!readError && dirName) { getArticle() }
  }, [id, dirName])

  const handelSubmit = async (e) => {
    e.preventDefault()
    setUpdateError(false)
    setDisabled(true)

    const res = await fetch('/api/articles', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: id,
        title: title,
        content: content,
        htmlContent: htmlContent
      })
    })
    if (res.ok) {
      redirect(`/${dirId}`)
    } else {
      setUpdateError(true)
      setDisabled(false)
    }
  }

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

  if (!dirName || content === undefined || htmlContent === undefined) return <div>载入中...</div>

  return (
    <>
      <h1>修改日记</h1>
      <h2>目录：{dirName}</h2>
      {updateError && <div style={{ color: "red" }}>出错，请再试</div>}

      <form onSubmit={handelSubmit}>
        <div>
          <label>题目</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} disabled={disabled} required />
        </div>

        <div>
          <Editor initContent={content} setContent={setContent} setHtmlContent={setHtmlContent}
            editable={!disabled}
          />
        </div>

        <button type="submit" disabled={disabled}>提交</button>
      </form>

      <Link href={`/${dirId}`}>返回</Link>
    </>
  )
}
