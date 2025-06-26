"use client"

import { useEffect, useState } from "react"

export default function App() {
  const [users, setUsers] = useState(undefined)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    async function getUsers() {
      const res = await fetch("/api/users")
      if (res.ok) {
        setUsers((await res.json()).data)
      } else {
        setHasError(true)
      }
    }
    getUsers()
  }, [])

  if (hasError) return <div>出错了，刷新一下吧</div>

  return (
    <>
      {users && users.length && users.map((user) =>
        <div key={user.pk}>{user.name} ({user.email})</div>
      )}
    </>
  )
}
