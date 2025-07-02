"use client"

import Link from "next/link"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"

export default function NewDiary() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [createError, setCreateError] = useState(false)
  const [pk, setPk] = useState(null)
  const [disabled, setDisabled] = useState(false)

  useEffect(() => {
    setPk(window.location.href.split("/").at(-2))
  }, [])

  const handelSubmit = async (e) => {
    e.preventDefault()
    setCreateError(false)
    setDisabled(true)

    const res = await fetch('/api/diarys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: decodeURIComponent(pk), title: title, content: content })
    })
    if (res.ok) {
      redirect(`/${pk}`)
    } else {
      setCreateError(true)
      setDisabled(false)
    }
  }

  if (!pk) return <div>载入中...</div>

  return (
    <>
      <h2>创建日记</h2>
      <div>当前 Email：<strong>{decodeURIComponent(pk)}</strong></div>
      {createError && <div style={{ color: "red" }}>出错，请再试</div>}

      <form onSubmit={handelSubmit}>
        <div>
          <label>题目</label>
          <input onChange={(e) => setTitle(e.target.value)} disabled={disabled} required />
        </div>

        <div>
          <label>内容</label>
          <textarea onChange={(e) => setContent(e.target.value)}
            disabled={disabled}
            style={{ width: "400px", height: "200px" }}
            required
          />
        </div>

        <button type="submit" disabled={disabled}>提交</button>
      </form>

      <Link href={`/${pk}`}>返回</Link>
    </>
  )
}
