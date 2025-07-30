"use client"

import { getId, toLocaleDateTime } from "@/app/utils/string_utils"
import DeleteCommentDialogue from "../dialogues/delete_comment"
import { useEffect, useState } from "react"
import CommentForm from "./comment_form"

export default function CommentTable({ dirId, articleId, setReadError }) {
  const [disabled, setDisabled] = useState(true)
  const [deleteId, setDeleteId] = useState(false)
  const [deleteCreateTime, setDeleteCreateTime] = useState(null)
  const [comments, setComments] = useState(undefined)
  const [commentLk, setCommentLk] = useState(undefined)

  useEffect(() => {
    if (dirId && articleId) {
      setComments(undefined)
      setCommentLk(undefined)
    }
  }, [dirId, articleId])

  useEffect(() => {
    if (comments === undefined) {
      getComments()
    }
  }, [comments])

  const getComments = async () => {
    setDisabled(true)

    let fetchUrl = `/api/comments?articleId=${articleId}`
    if (commentLk) {
      fetchUrl += `&lastKey=${encodeURIComponent(JSON.stringify(commentLk))}`
    }

    const res = await fetch(fetchUrl)
    if (res.ok) {
      const res_comm = await res.json()
      setComments(comments === undefined ? res_comm.data : [...comments, ...res_comm.data])
      setCommentLk(res_comm.lastKey)
      setDisabled(false)
    } else {
      setReadError(1)
    }
  }

  const openDelete = (id, createTime) => {
    setDeleteId(id)
    setDeleteCreateTime(createTime)
  }

  const closeDelete = () => {
    setDeleteId(null)
    setDeleteCreateTime(null)
  }

  const handelComment = async (data) => {
    setDisabled(true)

    if (data) {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
      if (res.ok) {
        const newComm = (await res.json()).data
        setComments([newComm, ...comments])
      } else {
        alert("发表留言出错，请再试")
      }
    }

    setDisabled(false)
  }

  const handelDelete = async (data) => {
    setDisabled(true)

    if (data) {
      const res = await fetch('/api/comments', {
        method: 'DELETE',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
      if (res.ok) {
        if (deleteId) {
          setComments(comments.filter(comm => (comm.pk !== `COMMENT#${deleteId}`)))
          closeDelete()
        }
      } else {
        alert("删除留言出错，请再试")
      }
    }

    setDisabled(false)
  }

  return (
    <>
      <CommentForm dirId={dirId} articleId={articleId} disabled={disabled} onCreate={handelComment} />

      <h2>留言表</h2>
      <button type="button"
        onClick={() => {
          setComments(undefined)
          setCommentLk(undefined)
        }}
        disabled={disabled}
      >刷新</button>

      <table>
        <thead>
          <tr>
            <th>内容</th>
            <th>发表时间</th>
            <th>删除</th>
          </tr>
        </thead>
        <tbody>
          {comments && Boolean(comments.length) && comments.map((comm) =>
            <tr key={comm.pk}>
              <td>{comm.text}</td>
              <td>{toLocaleDateTime(comm.createTimestamp)}</td>
              <td>
                <button type="button"
                  onClick={() => openDelete(getId(comm.pk), toLocaleDateTime(comm.createTimestamp))}
                  disabled={disabled}
                >
                  删除
                </button>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {commentLk && <button type="button" onClick={getComments} disabled={disabled}>更多留言</button>}

      <DeleteCommentDialogue id={deleteId} createTime={deleteCreateTime}
        onClose={closeDelete} onDelete={handelDelete} disabled={disabled}
      />
    </>
  )
}
