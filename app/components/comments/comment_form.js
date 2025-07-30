"use client"

import { useState } from "react"

export default function CommentForm({ dirId, articleId, disabled, onCreate }) {
  const [text, setText] = useState("")

  const handelSubmit = async (e) => {
    e.preventDefault()

    const text_copy = text
    setText("")
    await onCreate({ dirId: dirId, articleId: articleId, text: text_copy })
  }

  return (
    <>
      <h2>发表留言</h2>
      <div>人人皆可发表，一次一行字，不想看就删。</div>

      <form onSubmit={handelSubmit}>
        <input value={text} style={{ width: "90vw" }}
          onChange={(e) => setText(e.target.value)} disabled={disabled}
        />
        <button type="submit" disabled={disabled}>发布</button>
      </form>
    </>
  )
}
