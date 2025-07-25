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
import HistoryBar from './plugins/history_bar'
import { useState } from 'react'
import FloatLinkEditorPlugin from './plugins/float_link_editor'
import FloatFormatBarPlugin from './plugins/float_format_bar'

export default function Editor({ initContent, setContent, setHtmlContent, editable = true }) {
  const [floatAnchorElem, setFloatAnchorElem] = useState(null)

  const initConfig = {
    namespace: 'editor',
    editorState: initContent || '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""}],"direction":null,"format":"","indent":0,"type":"root","version":1}}',
    editable: editable,
    theme: editorTheme,
    nodes: editorNodes,
    onError: (err) => { throw err }
  }

  // https://zh-hans.react.dev/reference/react-dom/components/common#ref-callback
  // ref 回调函数：当使用该函数的节点加载时，该函数被触发
  const onRef = (floatAnchorNode) => {
    if (floatAnchorNode !== null) { setFloatAnchorElem(floatAnchorNode) }
  }

  const onChange = (editorState, editor) => {
    editorState.read(() => {
      setContent(JSON.stringify(editorState))

      const htmlContent = $generateHtmlFromNodes(editor)
      setHtmlContent(htmlContent)
    })
  }

  return (
    <LexicalComposer initialConfig={initConfig}>
      <HistoryBar />
      <RichTextPlugin
        contentEditable={
          <div ref={onRef}>
            <ContentEditable
              // 改变编辑器外观、大小等
              style={{ border: "1px solid", padding: "0 2px" }}
            />
          </div>
        }
        ErrorBoundary={LexicalErrorBoundary}
      />
      <LinkPlugin />
      <ListPlugin />
      <HistoryPlugin />
      <OnChangePlugin onChange={onChange} />
      {floatAnchorElem &&
        <>
          <FloatLinkEditorPlugin anchorElem={floatAnchorElem} />
          <FloatFormatBarPlugin anchorElem={floatAnchorElem} />
        </>
      }
    </LexicalComposer>
  )
}
