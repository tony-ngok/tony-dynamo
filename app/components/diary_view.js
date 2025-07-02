"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

export default function DiaryView({ pk }) {
  const [disabled, setDisabled] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [userPk, setUserPk] = useState(undefined)
  const [diarys, setDiarys] = useState(undefined)
  const [isDesc, setIsDesc] = useState(false)
  const [actual, setActual] = useState(null)

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

  const deleteDiary = async (diary) => {
    if (!confirm(`删除日记：${diary.title}？`)) return

    setDisabled(true)
    const res = await fetch("/api/diarys", {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: decodeURIComponent(pk), id: diary.sk.split('#')[1] })
    })
    if (res.ok) {
      if (actual.sk === diary.sk) { setActual(null) }
      setDiarys(diarys.filter(d => d.sk !== diary.sk))
    } else {
      alert("删除角色失败")
    }
    setDisabled(false)
  }

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

  return (
    <>
      <div>当前角色：<strong>{userPk.name}（{decodeURIComponent(pk)}）</strong></div>
      <Link href="/">返回首页</Link>

      <h2>日记列表</h2>
      <nav>
        <Link href={`/${pk}/new`}>写日记</Link>
        {diarys && Boolean(diarys.length) &&
          <label>
            <input type="checkbox" checked={isDesc} onChange={() => setIsDesc(!isDesc)} disabled={disabled} />
            降序排列
          </label>
        }
      </nav>

      <div>点击一个标题以查看日记：</div>
      <table>
        <thead>
          <tr>
            <th>标题</th>
            <th>修改</th>
            <th>删除</th>
          </tr>
        </thead>
        <tbody>
          {diarys && Boolean(diarys.length) && diarys.map((diary) =>
            <tr key={diary.sk.split('#')[1]}>
              <td>
                <Link href=""
                  onClick={(e) => {
                    e.preventDefault()
                    setActual(diary)
                  }}>
                  {diary.title}
                </Link>
              </td>
              <td><Link href={`/${pk}/${diary.sk.split('#')[1]}/edit`}>修改</Link></td>
              <td><button type="button" onClick={() => deleteDiary(diary)}>删除</button></td>
            </tr>
          )}
        </tbody>
      </table>

      {actual &&
        <>
          <h3>{actual.title}</h3>
          <textarea value={actual.content} style={{ width: "400px", height: "200px" }} readOnly />
        </>
      }
    </>
  )
}
