"use client"

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useEffect, useState } from 'react'
import { mergeRegister } from '@lexical/utils'
import {
  CAN_UNDO_COMMAND, UNDO_COMMAND, CAN_REDO_COMMAND, REDO_COMMAND
} from 'lexical'

export default function HistoryBar() {
  const [editor] = useLexicalComposerContext()
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  useEffect(() => {
    return mergeRegister(
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
    <nav>
      <button type="button" disabled={!canUndo} onClick={() => editor.dispatchCommand(UNDO_COMMAND)}>
        撤消
      </button>
      <button type="button" disabled={!canRedo} onClick={() => editor.dispatchCommand(REDO_COMMAND)}>
        重做
      </button>
    </nav>
  )
}
