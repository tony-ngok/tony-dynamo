"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

export default function DiaryView({ pk }) {
  const [hasError, setHasError] = useState(false)
  const [userPk, setUserPk] = useState(undefined)
  const [diarys, setDiarys] = useState(undefined)

  useEffect(() => {
    async function getUser() {
      const res = await fetch(`/api/user?email=${pk}`)
      if (res.ok) {
        const res_data = await res.json()
        setUserPk(res_data.data)
      } else if (res.status === 404) {
        setUserPk(null)
      } else {
        setHasError(true)
      }
    }
    getUser()
  }, [])

  // 待完成：获得日记
  useEffect(() => {
    if (userPk) {

    }
  }, [userPk])

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
      <div>当前角色：{userPk.name}（{decodeURIComponent(pk)}）</div>
      <Link href="/">返回首页</Link>
    </>
  )
}
