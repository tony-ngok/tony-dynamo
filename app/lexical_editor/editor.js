"use client"

import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { editorTheme, editorNodes } from './utils'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { $generateHtmlFromNodes } from '@lexical/html'

export default function Editor({ initContent, setContent, setHtmlContent, editable = true, isError = false }) {
  const initConfig = {
    namespace: 'editor',
    editorState: initContent || '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""}],"direction":null,"format":"","indent":0,"type":"root","version":1}}',
    editable: editable,
    theme: editorTheme,
    nodes: editorNodes,
    onError: (err) => { throw err }
  }

  const placeholderStyle = {
    color: "#999",
    overflow: "hidden",
    position: "absolute",
    top: isError ? "160px" : "140px",
    left: "10px",
    textOverflow: "ellipsis",
    userSelect: "none",
    whiteSpace: "nowrap",
    display: "inline-block",
    pointerEvents: "none"
  }

  function onChange(editorState, editor) {
    editorState.read(() => {
      setContent(JSON.stringify(editorState))

      const htmlContent = $generateHtmlFromNodes(editor)
      setHtmlContent(htmlContent)
    })
  }

  return (
    <LexicalComposer initialConfig={initConfig}>
      <RichTextPlugin
        contentEditable={
          <ContentEditable
            style={{ width: "500px", height: "300px", border: "1px solid", padding: "0 2px" }}
          /> // 改变编辑器外观、大小等
        }
        ErrorBoundary={LexicalErrorBoundary}
        placeholder={<div style={placeholderStyle}>在此写日记...</div>}
      />
      <LinkPlugin />
      <ListPlugin />
      <HistoryPlugin />
      <OnChangePlugin onChange={onChange} />
    </LexicalComposer>
  )
}
