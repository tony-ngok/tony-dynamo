"use client"

import { useEffect, useState } from "react"

export default function App() {
  const [users, setUsers] = useState(undefined)
  const [hasError, setHasError] = useState(false)
  const [isDesc, setIsDesc] = useState(false)

  useEffect(() => {
    const sort = isDesc ? 'descending' : 'ascending'

    async function getUsers() {
      const res = await fetch(`/api/users?sort=${sort}`)
      if (res.ok) {
        setUsers((await res.json()).data)
      } else {
        setHasError(true)
      }
    }
    getUsers()
  }, [isDesc])

  if (hasError) return <div>出错了，刷新一下吧</div>

  return (
    <>
      <h1>全部用户</h1>

      <label>
        <input type="checkbox" checked={isDesc} onChange={() => setIsDesc(!isDesc)} disabled={users === undefined} />
        降序排列
      </label>

      {users && users.length && users.map((user) =>
        <div key={user.pk}>{user.name} ({user.email})</div>
      )}
    </>
  )
}
