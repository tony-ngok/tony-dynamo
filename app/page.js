"use client"

import { useEffect, useState } from "react"
import { emailValidate } from "./utils"
import Link from "next/link"

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
      newUsername = prompt(`Email：${newEmail}\n请输入角色名：`)
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
      alert("创建角色失败")
    }
    setDisabled(false)
  }

  const updateUser = async (email) => {
    // 待完成：修改用户名
  }

  const deleteUser = async (email) => {
    if (!confirm(`删除 Email ${email} 所对应的角色？`)) return

    setDisabled(true)
    const res = await fetch("/api/users", {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email })
    })
    if (res.ok) {
      setUsers(users.filter(user => user.pk !== `EMAIL#${email}`))
    } else {
      alert("删除角色失败")
    }
    setDisabled(false)
  }

  if (hasError) return <div>出错了，刷新一下吧</div>

  return (
    <>
      <h1>全部角色</h1>

      <nav>
        <button type="button" onClick={createNewUser} disabled={disabled}>新建角色</button>
        <label>
          <input type="checkbox" checked={isDesc} onChange={() => setIsDesc(!isDesc)} disabled={disabled} />
          降序排列
        </label>
      </nav>

      <table>
        <thead>
          <tr>
            <th>角色名</th>
            <th>Email</th>
            <th>改名</th>
            <th>删除</th>
          </tr>
        </thead>
        <tbody>
          {users && users.length && users.map((user) =>
            <tr key={user.pk}>
              <td><Link href={`/${encodeURIComponent(user.email)}`}>{user.name}</Link></td>
              <td><Link href={`/${encodeURIComponent(user.email)}`}>{user.email}</Link></td>
              <td><button type="button" onClick={() => updateUser(user.email)}>改名</button></td>
              <td><button type="button" onClick={() => deleteUser(user.email)}>删除</button></td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  )
}
