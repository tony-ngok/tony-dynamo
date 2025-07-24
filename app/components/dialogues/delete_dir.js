"use client"

export function DeleteDirDialogue({ id, dirName, onClose, onDelete, hasError, disabled }) {
  const handelDelete = async () => {
    await onDelete({ id: id })
  }

  if (!(id && dirName)) return null

  return (
    <>
      <div className="dialogue-backdrop" />
      <dialog className="dialog fixed center-align">
        <div>当前目录名称：{dirName}</div>
        <div>确定删除本目录？</div>
        {hasError && <p style={{ color: "red" }}>出错了，请再试</p>}
        <div className="btns">
          <button type="button" onClick={handelDelete} className="btn" disabled={disabled}>删除</button>
          <button type="button" onClick={onClose} className="btn" disabled={disabled}>取消</button>
        </div>
      </dialog>
    </>
  )
}
