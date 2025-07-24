"use client"

import { useEffect, useRef, useState } from "react"

export function UpdateDirDialogue({ id, dirName, onClose, onUpdate, hasError, disabled }) {
  const [newDirName, setNewDirName] = useState(dirName)
  const inputRef = useRef(null)

  useEffect(() => {
    setNewDirName(dirName)
    if (id) {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }
  }, [id])

  const handelSubmit = async (e) => {
    e.preventDefault()
    await onUpdate({ id: id, newDirName: newDirName })
  }

  if (!(id && dirName)) return null

  return (
    <>
      <div className="dialogue-backdrop" />
      <dialog className="dialog fixed center-align">
        <div>当前目录名称：{dirName}</div>
        <div>请输入新的目录名称：</div>
        {hasError && <p style={{ color: "red" }}>出错了，请再试</p>}
        <form onSubmit={handelSubmit}>
          <input value={newDirName} onChange={(e) => setNewDirName(e.target.value)} ref={inputRef} required />
          <div className="btns">
            <button type="submit" className="btn" disabled={disabled}>改名</button>
            <button type="button" onClick={onClose} className="btn" disabled={disabled}>取消</button>
          </div>
        </form>
      </dialog>
    </>
  )
}
