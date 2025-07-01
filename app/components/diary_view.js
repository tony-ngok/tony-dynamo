"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

export default function DiaryView({ pk }) {
  const [disabled, setDisabled] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [userPk, setUserPk] = useState(undefined)
  const [diarys, setDiarys] = useState(undefined)
  const [isDesc, setIsDesc] = useState(false)

  useEffect(() => {
    async function getUser() {
      const res = await fetch(`/api/user?email=${pk}`)
      if (res.ok) {
        const res_json = await res.json()
        setUserPk(res_json.data)
      } else if (res.status === 404) {
        setUserPk(null)
      } else {
        setHasError(true)
      }
    }
    getUser()
  }, [])

  useEffect(() => {
    async function getDiarys() {
      const sort = isDesc ? 'descending' : 'ascending'
      const res = await fetch(`/api/diarys?email=${pk}&sort=${sort}`)
      if (res.ok) {
        const res_json = await res.json()
        setDiarys(res_json.data)
        setDisabled(false)
      } else {
        setHasError(true)
      }
    }
    if (userPk) {
      getDiarys()
    }
  }, [userPk, isDesc])

  if (hasError) {
    return (
      <>
        <div>出错了，刷新一下吧</div>
        <Link href="/">返回首页</Link>
      </>
    )
  }

  if (userPk === null) {
    return (
      <>
        <div>Email {decodeURIComponent(pk)} 找不到角色</div>
        <Link href="/">返回首页</Link>
      </>
    )
  }

  if (userPk === undefined) return <div>载入中...</div>

  // 待完成：列出日记
  return (
    <>
      <div>当前角色：<strong>{userPk.name}（{decodeURIComponent(pk)}）</strong></div>
      <Link href="/">返回首页</Link>

      <h2>日记列表</h2>
      <nav>
        {/* <button type="button" onClick={createNewUser} disabled={disabled}>写日记</button> */}
        <label>
          <input type="checkbox" checked={isDesc} onChange={() => setIsDesc(!isDesc)} disabled={disabled} />
          降序排列
        </label>
      </nav>

      <table>
        <thead>
          <tr>
            <th>标题</th>
            <th>改名</th>
            <th>删除</th>
          </tr>
        </thead>
        <tbody>
          {diarys && Boolean(diarys.length) && diarys.map((diary) =>
            <tr key={diary.sk.split('#')[1]}>
              <td><Link href={`/${pk}/${diary.sk.split('#')[1]}`}>{diary.title}</Link></td>
              <td><button type="button" onClick={() => updateUser(diary.email, diary.name)}>改名</button></td>
              <td><button type="button" onClick={() => deleteUser(diary.email)}>删除</button></td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  )
}
