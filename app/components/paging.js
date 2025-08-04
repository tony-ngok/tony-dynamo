"use client"

import { usePageStore } from "../zustand/zustand"

export default function Paging({ turn, disabled }) {
  const p = usePageStore.use.page()
  const prevKey = usePageStore.use.prevKey()
  const nextKey = usePageStore.use.nextKey()

  return (
    <nav>
      <span>第</span>
      {prevKey !== undefined && p > 1 &&
        <button type="button" disabled={disabled} onClick={() => turn(prevKey, p - 1)}>
          {p - 1}
        </button>
      }
      <span><strong>{p}</strong></span>
      {nextKey &&
        <button type="button" disabled={disabled} onClick={() => turn(nextKey, p + 1)}>
          {p + 1}
        </button>
      }
      <span>頁</span>
    </nav>
  )
}
