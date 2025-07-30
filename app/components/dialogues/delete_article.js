"use client"

export default function DeleteArticleDialogue({
  id, dirId, title, updateTime, onClose, onDelete, hasError, disabled
}) {
  const handelDelete = async () => {
    await onDelete({ id: id, dirId: dirId })
  }

  if (!(id && dirId && title && updateTime)) return null

  return (
    <>
      <div className="dialogue-backdrop" />
      <dialog className="dialog fixed center-align">
        <div>文章标题：{title}</div>
        <div>更新时间：{updateTime}</div>
        <div>确定删除文章？</div>
        {hasError && <p style={{ color: "red" }}>出错了，请再试</p>}

        <div className="btns">
          <button type="button" onClick={handelDelete} className="btn" disabled={disabled}>删除</button>
          <button type="button" onClick={onClose} className="btn" disabled={disabled}>取消</button>
        </div>
      </dialog>
    </>
  )
}
