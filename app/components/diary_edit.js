"use client"

import Link from "next/link"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"

export default function DiaryEdit({ pk, id }) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [hasError, setHasError] = useState(0)
  const [disabled, setDisabled] = useState(true)
  const [preTitle, setPreTitle] = useState("")
  const [preContent, setPreContent] = useState("")

  useEffect(() => {
    async function getDiary() {
      const res_diary = await fetch(`/api/diary?id=${id}`)
      if (res_diary.ok) {
        const res_data = (await res_diary.json()).data
        setTitle(res_data.title)
        setPreTitle(res_data.title)
        setContent(res_data.content)
        setPreContent(res_data.content)
        setDisabled(false)
      } else {
        setHasError(1)
      }
    }
    getDiary()
  }, [])

  const handelSubmit = async (e) => {
    e.preventDefault()
    setHasError(0)
    setDisabled(true)

    const res = await fetch('/api/diarys', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: id, title: title, content: content })
    })
    if (res.ok) {
      redirect(`/${pk}`)
    } else {
      setHasError(2)
      setDisabled(false)
    }
  }

  return (
    <>
      <h2>修改日记</h2>
      <div>当前 Email：<strong>{decodeURIComponent(pk)}</strong></div>
      {hasError === 1 && <div style={{ color: "red" }}>出错，请刷新</div>}
      {hasError === 2 && <div style={{ color: "red" }}>出错，请再试</div>}

      <form onSubmit={handelSubmit}>
        <div>
          <label>题目</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} disabled={disabled} required />
        </div>

        <div>
          <label>内容</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)}
            disabled={disabled}
            style={{ width: "400px", height: "200px" }}
            required
          />
        </div>

        <button type="submit" disabled={disabled || (content === preContent && title === preTitle)}>提交</button>
      </form>

      <Link href={`/${pk}`}>返回</Link>
    </>
  )
}
