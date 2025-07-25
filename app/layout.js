import '@/styles/main.css'
import '@/styles/editor.css'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div>
          这是一个<u>人人皆可写文章，人人皆可评论，人人皆可增删改查</u>的平台。
          <br />
          <span style={{ color: "red" }}>
            <strong>注意：此平台没有认证保护，所以千万不要在此发布敏感资料。</strong>
          </span>
        </div>
        {children}
      </body>
    </html>
  )
}
