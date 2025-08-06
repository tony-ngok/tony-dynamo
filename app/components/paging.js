"use client"

import { useAppSelector } from "../paging_redux/hooks"

export default function Paging({ turn, disabled }) {
  const p = useAppSelector(state => state.paging.page)
  const totalP = useAppSelector(state => state.paging.totalPages)
  const keys = useAppSelector(state => state.paging.keys)

  let pages = Object.keys(keys).filter(i => keys[i] !== undefined).map(i => parseInt(i))
  pages.push(p)
  pages = pages.sort((a, b) => a - b)

  return (
    <nav>
      <button type="button" disabled={disabled || p === 1}
        onClick={() => turn(keys[p - 1], p - 1)}
      >
        &larr;
      </button>
      <span>第</span>
      {pages && pages.map((i) => i === p ? <span key={`p${p}`}><strong>{p}</strong></span> : (
        <button key={`p${i}`} type="button" disabled={disabled} onClick={() => turn(keys[i], i)}>
          {i}
        </button>
      ))}
      <span>頁，共{totalP}頁</span>
      <button type="button" disabled={disabled || p === totalP}
        onClick={() => turn(keys[p + 1], p + 1)}
      >
        &rarr;
      </button>
    </nav>
  )
}
