"use client"

import { getId, toLocaleDateTime } from "@/app/string_utils"
import DeleteCommentDialogue from "../dialogues/delete_comment"
import { useState } from "react"

export default function CommentTable({ comments, disabled, onDelete }) {
  const [deleteId, setDeleteId] = useState(null)
  const [deleteCreateTime, setDeleteCreateTime] = useState(null)

  const openDelete = (id, createTime) => {
    setHasDeleteError(false)
    setDeleteId(id)
    setDeleteCreateTime(createTime)
  }

  const closeDelete = () => {
    setDeleteId(null)
    setDeleteCreateTime(null)
  }

  const handelDelete = async () => {
    await onDelete({ id: deleteId })
  }

  return (
    <>
      <h2>留言（{comments?.length || 0}个）</h2>

      <table>
        <thead>
          <tr>
            <th>内容</th>
            <th>发表时间</th>
            <th>删除</th>
          </tr>
        </thead>
        <tbody>
          {comments && comments.length && comments.map((comment) =>
            <tr key={comment.pk}>
              <td>{comment.text}</td>
              <td>{toLocaleDateTime(comment.createTimestamp)}</td>
              <td>
                <button type="button"
                  onClick={() => openDelete(getId(comment.pk), toLocaleDateTime(comment.createTimestamp))}
                  disabled={disabled}
                >
                  删除
                </button>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <DeleteCommentDialogue id={deleteId} createTime={deleteCreateTime}
        onClose={closeDelete} onDelete={handelDelete} disabled={disabled}
      />
    </>
  )
}
