"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { getId, toLocaleDateTime } from "../utils/string_utils"
import ButtonLink from "./button_link"
import DeleteArticleDialogue from "./dialogues/delete_article"

export default function DirView({ dirId }) {
  const [disabled, setDisabled] = useState(true)
  const [dirName, setDirName] = useState("")
  const [articles, setArticles] = useState(undefined)
  const [articleLk, setArticleLk] = useState(undefined)
  const [isAsc, setIsAsc] = useState(false)
  const [readError, setReadError] = useState(0)
  const [deleteArticleId, setDeleteArticleId] = useState(null)
  const [deleteArticleTitle, setDeleteArticleTitle] = useState("")
  const [deleteArticleUpdateTime, setDeleteArticleUpdateTime] = useState(null)
  const [hasDeleteError, setHasDeleteError] = useState(false)

  useEffect(() => {
    async function loadDir() {
      const res_dir = await fetch(`/api/dir?id=${dirId}`)
      if (res_dir.ok) {
        setDirName((await res_dir.json()).data.dirName)
      } else if (res_dir.status === 404) {
        setReadError(2)
      } else {
        setReadError(1)
      }
    }
    if (dirId) { loadDir() }
  }, [dirId])

  useEffect(() => {
    if (!readError && dirName) {
      setArticles(undefined)
      setArticleLk(undefined)
    }
  }, [isAsc, dirName])

  useEffect(() => {
    if (articles === undefined) {
      getArticles()
    }
  }, [articles])

  const getArticles = async () => {
    setDisabled(true)

    let fetchUrl = `/api/articles?dirId=${dirId}&sort=${isAsc ? 'ascending' : 'descending'}`
    if (articleLk) {
      fetchUrl += `&lastKey=${encodeURIComponent(JSON.stringify(articleLk))}`
    }

    const res = await fetch(fetchUrl)
    if (res.ok) {
      const res_art = await res.json()
      setArticles(articles === undefined ? res_art.data : [...articles, ...res_art.data])
      setArticleLk(res_art.lastKey)
      setDisabled(false)
    } else {
      setReadError(1)
    }
  }

  const openDeleteArticle = (articleId, articleName, articleUpdateTime) => {
    setHasDeleteError(false)
    setDeleteArticleId(articleId)
    setDeleteArticleTitle(articleName)
    setDeleteArticleUpdateTime(articleUpdateTime)
  }

  const closeDeleteArticle = () => {
    setDeleteArticleId(null)
    setDeleteArticleTitle("")
    setDeleteArticleUpdateTime(null)
  }

  const handelDelete = async (data) => {
    setHasDeleteError(false)
    setDisabled(true)

    if (data) {
      const res = await fetch("/api/articles", {
        method: 'DELETE',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
      if (res.ok) {
        if (deleteArticleId) {
          setArticles(articles.filter(article => (article.pk !== `ARTICLE#${deleteArticleId}`)))
        }
        closeDeleteArticle()
      } else {
        setHasDeleteError(true)
      }
    }

    setDisabled(false)
  }

  if (!dirId) return null
  if (readError === 1) return <div style={{ color: "red" }}>出错了，刷新一下吧</div>

  if (readError === 2) {
    return (
      <>
        <div>目录不存在</div>
        <Link href="/">返回</Link>
      </>
    )
  }

  return (
    <>
      <Link href="/">返回首页</Link>
      <h1>目录：{dirName}</h1>

      {articles !== undefined &&
        <>
          <nav className="navbar">
            <ButtonLink href={`/${dirId}/new`} disabled={disabled} text={"写文章"} />
            <label>
              <input type="checkbox" checked={isAsc} onChange={() => setIsAsc(!isAsc)} disabled={disabled} />
              按更新时间升序排列
            </label>
          </nav>

          <table>
            <thead>
              <tr>
                <th>题目</th>
                <th>更新时间</th>
                <th>修改</th>
                <th>删除</th>
              </tr>
            </thead>
            <tbody>
              {articles && Boolean(articles.length) && articles.map((article) =>
                <tr key={article.pk}>
                  <td><Link href={`/${dirId}/${getId(article.pk)}`}>{article.title}</Link></td>
                  <td>{toLocaleDateTime(article.updateTimestamp)}</td>
                  <td>
                    <ButtonLink href={`/${dirId}/${getId(article.pk)}/edit`}
                      disabled={disabled} text="修改"
                    />
                  </td>
                  <td>
                    <button type="button" disabled={disabled}
                      onClick={() => openDeleteArticle(getId(article.pk), article.title, toLocaleDateTime(article.updateTimestamp))}
                    >
                      删除
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {articleLk && <button type="button" onClick={getArticles} disabled={disabled}>更多</button>}

          <DeleteArticleDialogue id={deleteArticleId} dirId={dirId}
            title={deleteArticleTitle} updateTime={deleteArticleUpdateTime}
            onClose={closeDeleteArticle} onDelete={handelDelete}
            hasError={hasDeleteError} disabled={disabled}
          />
        </>
      }
    </>
  )
}
