"use client"

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useEffect, useState } from 'react'
import { mergeRegister } from '@lexical/utils'
import {
  $getSelection, $isRangeSelection,
  FORMAT_TEXT_COMMAND, CAN_UNDO_COMMAND, UNDO_COMMAND, CAN_REDO_COMMAND, REDO_COMMAND
} from 'lexical'
import BlockSelect from './block_select'
import LinkEditor from './link_editor'

export default function EditorBar() {
  const [editor] = useLexicalComposerContext()
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  useEffect(() => {
    function updateToolbar() {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) return

      // 获得文字格式
      setIsBold(selection.hasFormat("bold"))
      setIsItalic(selection.hasFormat("italic"))
    }

    return mergeRegister(
      // registerUpdateListener：每当编辑器状态改变时触发
      // 获得选中文字的状态
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => { updateToolbar() })
      }),

      // registerCommand：每当收到指令时触发
      // 获得当前是否能够撤消的状态（当历史改变时，即发送指令）
      editor.registerCommand(CAN_UNDO_COMMAND, (payload) => {
        setCanUndo(payload)
        return false
      }, 1),

      // 获得当前是否能够重做的状态（当历史改变时，即发送指令）
      editor.registerCommand(CAN_REDO_COMMAND, (payload) => {
        setCanRedo(payload)
        return false
      }, 1)
    ) // 此处执行所有操作
  }, [editor])

  return (
    <>
      <nav>
        <button type="button" className={isBold ? 'button-true' : 'button-false'}
          onClick={() => { editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold') }}
        >
          <strong>加粗</strong>
        </button>
        <button type="button" className={isItalic ? 'button-true' : 'button-false'}
          onClick={() => { editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic') }}
        >
          <em>倾斜</em>
        </button>
        <button type="button" disabled={!canUndo} onClick={() => editor.dispatchCommand(UNDO_COMMAND)}>
          撤消
        </button>
        <button type="button" disabled={!canRedo} onClick={() => editor.dispatchCommand(REDO_COMMAND)}>
          重做
        </button>
        <LinkEditor editor={editor} />
      </nav>
      <BlockSelect editor={editor} />
    </>
  )
}
