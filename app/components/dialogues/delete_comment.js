export default function DeleteCommentDialogue({ id, createTime, onClose, onDelete, disabled }) {
  const handelDelete = async () => {
    await onDelete({ id: id })
  }

  if (!(id && createTime)) return null

  return (
    <>
      <div className="dialogue-backdrop" />
      <dialog className="dialog fixed center-align">
        <div>留言时间：{createTime}</div>
        <div>确定删除本留言？</div>

        <div className="btns">
          <button type="button" onClick={handelDelete} className="btn" disabled={disabled}>删除</button>
          <button type="button" onClick={onClose} className="btn" disabled={disabled}>取消</button>
        </div>
      </dialog>
    </>
  )
}
