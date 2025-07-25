"use client"

import { useState } from "react"

export default function CommentForm({ articleId, disabled, onCreate }) {
  const [text, setText] = useState("")

  const handelSubmit = async (e) => {
    e.preventDefault()
    await onCreate({ articleId: articleId, text: text })
  }

  return (
    <>
      <h2>发表留言</h2>
      <div>人人皆可发表，一次一行字，不想看就删。</div>

      <form onSubmit={handelSubmit}>
        <input value={text} style={{ width: "90vw" }}
          onChange={(e) => setText(e.target.value)} disabled={disabled}
        />
        <button type="submit">发布</button>
      </form>
    </>
  )
}
