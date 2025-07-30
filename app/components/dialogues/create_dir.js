"use client"

import { useEffect, useRef, useState } from "react"

export default function CreateDirDialogue({ isOpen, onClose, onCreate, hasError, disabled }) {
  const [dirName, setDirName] = useState("")
  const inputRef = useRef(null)

  useEffect(() => {
    setDirName("")
    if (isOpen) {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }
  }, [isOpen])

  const handelSubmit = async (e) => {
    e.preventDefault()
    await onCreate({ dirName: dirName })
  }

  if (!isOpen) return null

  return (
    <>
      <div className="dialogue-backdrop" />
      <dialog className="dialog fixed center-align">
        <div>请输入目录名称：</div>
        {hasError && <p style={{ color: "red" }}>出错了，请再试</p>}

        <form onSubmit={handelSubmit}>
          <input value={dirName} onChange={(e) => setDirName(e.target.value)} ref={inputRef} required />
          <div className="btns">
            <button type="submit" className="btn" disabled={disabled}>新建目录</button>
            <button type="button" onClick={onClose} className="btn" disabled={disabled}>取消</button>
          </div>
        </form>
      </dialog>
    </>
  )
}
