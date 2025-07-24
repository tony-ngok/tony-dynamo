"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

export default function ArticleView({ pk, dirId }) {
  const [disabled, setDisabled] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [userPk, setUserPk] = useState(undefined)
  const [dirs, setDirs] = useState(undefined)
  const [articles, setArticles] = useState(undefined)
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
    async function getArticles() {
      const sort = isDesc ? 'descending' : 'ascending'

      if (!dirId) {
        const res0 = await fetch(`/api/dirs?email=${pk}&sort=${sort}`)
        if (res0.ok) {
          const res0_json = await res0.json()
          setDirs(res0_json.data)
        } else {
          setHasError(true)
          return
        }
      }

      let articleUrl = `/api/articles?email=${pk}&sort=${sort}`
      if (dirId) articleUrl += `&dir=${dirId}`
      const res1 = await fetch(articleUrl)
      if (res1.ok) {
        const res1_json = await res1.json()
        setArticles(res1_json.data)
        setDisabled(false)
      } else {
        setHasError(true)
      }
    }

    if (userPk) { getArticles() }
  }, [userPk, isDesc])

  const deleteArticle = async (article) => {
    if (!confirm(`删除日记：${article.title}？`)) return

    setDisabled(true)
    const res = await fetch("/api/articles", {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: article.sk.split('#')[1] })
    })
    if (res.ok) {
      if (actual && (actual.sk === article.sk)) { setActual(null) }
      setArticles(articles.filter(d => d.sk !== article.sk))
    } else {
      alert("删除日记失败")
    }
    setDisabled(false)
  }

  const newDir = async () => {
    let dirName = ""
    while (dirName === "") {
      dirName = prompt('请输入收藏名：')
      if (dirName === null) return
      dirName = dirName.trim()
    }

    setDisabled(true)
    const res = await fetch('/api/dirs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: decodeURIComponent(pk), dirName: dirName })
    })
    if (res.ok) {
      const newDir = (await res.json()).data
      setDirs(dirs => [...dirs, newDir])
    } else {
      alert("创建收藏失败")
    }
    setDisabled(false)
  }

  const renameDir = async (dirId, actualDirName) => {
    let newDirName = ""
    while (newDirName === "" || newDirName === actualDirName) {
      newDirName = prompt('请输入新收藏名：', actualDirName)
      if (newDirName === null) return
      newDirName = newDirName.trim()
    }

    setDisabled(true)
    const res = await fetch('/api/dirs', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: dirId, dirName: newDirName })
    })
    if (res.ok) {
      const newDir = (await res.json()).data
      setDirs(prevs =>
        prevs.map(prev => (prev.pk === newDir.pk ? newDir : prev))
      )
    } else {
      alert("收藏改名失败")
    }
    setDisabled(false)
  }

  const deleteDir = async (dir) => {
    if (!confirm(`删除收藏：${dir.dirName}？`)) return

    setDisabled(true)
    const res = await fetch("/api/dirs", {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: decodeURIComponent(pk), id: dir.pk.split('#')[1] })
    })
    if (res.ok) {
      setDirs(dirs.filter(d => d.pk !== dir.pk))
    } else {
      alert("删除收藏失败")
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

      <h1>日记列表</h1>
      {dirId && <div>收藏 ID：${dirId}</div>}
      <nav>
        <Link href={(dirId ? `/${pk}/dir/${dirId}` : `/${pk}`) + '/new'}>写日记</Link>
        {dirId ? <Link href={`/${pk}`}>后退</Link> : <button type="button" onClick={newDir}>建立收藏</button>}
        { }
        {articles && Boolean(articles.length) &&
          <label>
            <input type="checkbox" checked={isDesc} onChange={() => setIsDesc(!isDesc)} disabled={disabled} />
            名称降序排列
          </label>
        }
      </nav>

      <div>点击一个日记题目（名称）以查看日记：</div>
      <table>
        <thead>
          <tr>
            <th>标题</th>
            {!dirId && <th>类型</th>}
            <th>修改</th>
            <th>删除</th>
          </tr>
        </thead>
        <tbody>
          {!dirId && dirs && Boolean(dirs.length) && dirs.map((dir) =>
            <tr key={dir.pk.split('#')[1]}>
              <td><Link href={`/${pk}/dir/${dir.pk.split('#')[1]}`}>{dir.dirName}</Link></td>
              <td>收藏</td>
              <td>
                <button type="button" onClick={() => renameDir(dir.pk.split('#')[1], dir.dirName)}>改名</button>
              </td>
              <td><button type="button" onClick={() => deleteDir(dir)}>删除</button></td>
            </tr>
          )}

          {articles && Boolean(articles.length) && articles.map((article) =>
            <tr key={article.sk.split('#')[1]}>
              <td>
                <Link href=""
                  onClick={(e) => {
                    e.preventDefault()
                    setActual(article)
                  }}>
                  {article.title}
                </Link>
              </td>
              {!dirId && <td>日记</td>}
              <td>
                <Link href={(dirId ? `/${pk}/dir/${dirId}` : `/${pk}`) + `/${article.sk.split('#')[1]}/edit`}>
                  修改
                </Link>
              </td>
              <td><button type="button" onClick={() => deleteArticle(article)}>删除</button></td>
            </tr>
          )}
        </tbody>
      </table>

      {actual &&
        <>
          <h2>{actual.title}</h2>
          <div dangerouslySetInnerHTML={{ __html: actual.htmlContent }} />
        </>
      }
    </>
  )
}
