"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getId, toLocaleDateTime } from "./utils/string_utils"
import CreateDirDialogue from "./components/dialogues/create_dir"
import UpdateDirDialogue from "./components/dialogues/update_dir"
import DeleteDirDialogue from "./components/dialogues/delete_dir"

export default function App() {
  const [disabled, setDisabled] = useState(true)
  const [dirs, setDirs] = useState(undefined)
  const [hasReadError, setHasReadError] = useState(false)
  const [isAsc, setIsAsc] = useState(false)
  const [isCreateDir, setIsCreateDir] = useState(false)
  const [updateDirId, setUpdateDirId] = useState(null)
  const [updateDirName, setUpdateDirName] = useState("")
  const [deleteDirId, setDeleteDirId] = useState(null)
  const [deleteDirName, setDeleteDirName] = useState("")
  const [hasWriteError, setHasWriteError] = useState(false)

  useEffect(() => {
    async function getDirs() {
      setDisabled(true)

      const sort = isAsc ? 'ascending' : 'descending'
      const res = await fetch(`/api/dirs?sort=${sort}`)
      if (res.ok) {
        setDirs((await res.json()).data)
        setDisabled(false)
      } else {
        setHasReadError(true)
      }
    }
    getDirs()
  }, [isAsc])

  const openCreateDir = () => {
    setHasWriteError(false)
    setIsCreateDir(true)
  }

  const openUpdateDir = (dirId, dirName) => {
    setHasWriteError(false)
    setUpdateDirId(dirId)
    setUpdateDirName(dirName)
  }

  const closeUpdateDir = () => {
    setUpdateDirId(null)
    setUpdateDirName("")
  }

  const openDeleteDir = (dirId, dirName) => {
    setHasWriteError(false)
    setDeleteDirId(dirId)
    setDeleteDirName(dirName)
  }

  const closeDeleteDir = () => {
    setDeleteDirId(null)
    setDeleteDirName("")
  }

  const handelCreate = async (data) => {
    setHasWriteError(false)
    setDisabled(true)

    if (data) {
      const res = await fetch("/api/dirs", {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
      if (res.ok) {
        const newDir = (await res.json()).data
        setDirs([newDir, ...dirs])
        setIsCreateDir(false)
      } else {
        setHasWriteError(true)
      }
    }

    setDisabled(false)
  }

  const handelUpdate = async (data) => {
    setHasWriteError(false)
    setDisabled(true)

    if (data) {
      const res = await fetch("/api/dirs", {
        method: 'PATCH',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
      if (res.ok) {
        const newDir = (await res.json()).data
        if (newDir) {
          setDirs(dirs.map(dir => (dir.pk === newDir.pk ? newDir : dir)))
        }
        closeUpdateDir()
      } else {
        setHasWriteError(true)
      }
    }

    setDisabled(false)
  }

  const handelDelete = async (data) => {
    setHasWriteError(false)
    setDisabled(true)

    if (data) {
      const res = await fetch("/api/dirs", {
        method: 'DELETE',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
      if (res.ok) {
        if (deleteDirId) {
          setDirs(dirs.filter(dir => (dir.pk !== `DIR#${deleteDirId}`)))
        }
        closeDeleteDir()
      } else {
        setHasWriteError(true)
      }
    }

    setDisabled(false)
  }

  if (hasReadError) return <div style={{ color: "red" }}>出错了，刷新一下吧</div>

  return (
    <>
      <h1>全部目录</h1>
      <div>
        写文章前，请先创建并进入一个目录；也可以直接进入一个已有的目录写文章。
        <br />
        <strong>注意：如果删了一个目录，里面的文章就全都没了。</strong>
      </div>

      <nav className="navbar">
        <button type="button" onClick={openCreateDir} disabled={disabled}>新建目录</button>
        <label>
          <input type="checkbox" checked={isAsc} onChange={() => setIsAsc(!isAsc)} disabled={disabled} />
          按更新时间升序排列
        </label>
      </nav>

      <table>
        <thead>
          <tr>
            <th>目录名</th>
            <th>更新时间</th>
            <th>改名</th>
            <th>删除</th>
          </tr>
        </thead>
        <tbody>
          {dirs && Boolean(dirs.length) && dirs.map((dir) =>
            <tr key={dir.pk}>
              <td><Link href={`/${getId(dir.pk)}`}>{dir.dirName}</Link></td>
              <td>{toLocaleDateTime(dir.updateTimestamp)}</td>
              <td>
                <button type="button" disabled={disabled}
                  onClick={() => openUpdateDir(getId(dir.pk), dir.dirName)}
                >
                  改名
                </button>
              </td>
              <td>
                <button type="button" disabled={disabled}
                  onClick={() => openDeleteDir(getId(dir.pk), dir.dirName)}
                >
                  删除
                </button>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <CreateDirDialogue isOpen={isCreateDir} onClose={() => setIsCreateDir(false)}
        onCreate={handelCreate} hasError={hasWriteError} disabled={disabled}
      />
      <UpdateDirDialogue id={updateDirId} dirName={updateDirName} onClose={closeUpdateDir}
        onUpdate={handelUpdate} hasError={hasWriteError} disabled={disabled}
      />
      <DeleteDirDialogue id={deleteDirId} dirName={deleteDirName} onClose={closeDeleteDir}
        onDelete={handelDelete} hasError={hasWriteError} disabled={disabled}
      />
    </>
  )
}
