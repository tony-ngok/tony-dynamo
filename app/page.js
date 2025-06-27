"use client"

import { useEffect, useState } from "react"
import { emailValidate } from "./utils"

export default function App() {
  const [disabled, setDisabled] = useState(true)
  const [users, setUsers] = useState(undefined)
  const [hasError, setHasError] = useState(false)
  const [isDesc, setIsDesc] = useState(false)

  useEffect(() => {
    const sort = isDesc ? 'descending' : 'ascending'

    async function getUsers() {
      const res = await fetch(`/api/users?sort=${sort}`)
      if (res.ok) {
        setUsers((await res.json()).data)
        setDisabled(false)
      } else {
        setHasError(true)
      }
    }
    getUsers()
  }, [isDesc])

  const createNewUser = async () => {
    let newEmail = ""
    while (newEmail === "") {
      newEmail = prompt("请输入 Email：")
      if (newEmail === null) return
      newEmail = newEmail.trim()
      if (!emailValidate(newEmail)) newEmail = ""
    }

    let newUsername = ""
    while (newUsername === "") {
      newUsername = prompt(`Email：${newEmail}\n请输入用户名：`)
      if (newUsername === null) return
      newUsername = newUsername.trim()
    }

    setDisabled(true)
    const res = await fetch("/api/users", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: newEmail,
        name: newUsername
      })
    })
    if (res.ok) {
      const newUser = (await res.json()).data
      setUsers(users => [...users, newUser])
    } else {
      alert("创建用户失败")
    }
    setDisabled(false)
  }

  if (hasError) return <div>出错了，刷新一下吧</div>

  return (
    <>
      <h1>全部用户</h1>

      <nav>
        <button type="button" onClick={createNewUser} disabled={disabled}>新建用户</button>
        <label>
          <input type="checkbox" checked={isDesc} onChange={() => setIsDesc(!isDesc)} disabled={disabled} />
          降序排列
        </label>
      </nav>

      {users && users.length && users.map((user) =>
        <div key={user.pk}>{user.name} ({user.email})</div>
      )}
    </>
  )
}
