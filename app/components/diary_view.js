"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

export default function DiaryView({ pk }) {
  const [diarys, setDiarys] = useState(undefined)

  // 待完成：获得日记
  useEffect(() => {

  }, [])

  if (diarys === undefined) return <div>载入中...</div>
  if (diarys === null) {
    return (
      <>
        <div>Email {decodeURIComponent(pk)} 找不到角色</div>
        <Link href="/">返回首页</Link>
      </>
    )
  }

  // 待完成：列出日记
}
