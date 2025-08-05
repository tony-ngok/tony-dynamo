"use client"

import { useAppSelector } from "../paging_redux/hooks"

export default function Paging({ turn, disabled }) {
  const p = useAppSelector(state => state.paging.page)
  const totalP = useAppSelector(state => state.paging.totalPages)
  const prevKey = useAppSelector(state => state.paging.prevKey)
  const nextKey = useAppSelector(state => state.paging.nextKey)

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
      <span>頁，共{totalP}頁</span>
    </nav>
  )
}
