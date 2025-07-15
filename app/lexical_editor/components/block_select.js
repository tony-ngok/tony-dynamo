"use client"

import { useEffect, useState } from "react"
import { $createParagraphNode, $getSelection, $isRangeSelection } from 'lexical'
import { $getNearestNodeOfType } from '@lexical/utils'
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND
} from "@lexical/list"
import { $isListNode, ListNode } from "@lexical/list"
import { $createHeadingNode, $createQuoteNode, $isHeadingNode } from "@lexical/rich-text"
import { $setBlocksType } from '@lexical/selection'

export default function BlockSelect({ editor }) {
  const [block, setBlock] = useState('paragraph')

  useEffect(() => {
    function update() {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) return

      // 获得区块类型
      const anchorNode = selection.anchor.getNode()
      const element = anchorNode.getKey() === 'root' ? anchorNode : anchorNode.getTopLevelElementOrThrow()
      const elementKey = element.getKey()
      const elementDOM = editor.getElementByKey(elementKey)
      if (elementDOM) {
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType(anchorNode, ListNode)
          const type = parentList ? parentList.getTag() : element.getTag() // ol, ul
          setBlock(type)
        } else {
          const type = $isHeadingNode(element) ?
            element.getTag() // h3
            :
            element.getType() // paragraph, quote
          setBlock(type)
        }
      }
    }

    editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => { update() })
    })
  }, [editor])

  // useEffect(() => {
  //   console.log(block)
  // }, [block]) // DEBUG

  const formatP = () => {
    if (block !== 'paragraph') {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createParagraphNode()) // 将选择部分包裹在某个区块标签内
        }
      })
    }
  }

  const formatH3 = () => {
    if (block !== 'h3') {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode('h3'))
        }
      })
    } else {
      formatP()
    }
  }

  const formatUl = () => {
    if (block !== 'ul') {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND)
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND)
    }
  }

  const formatOl = () => {
    if (block !== 'ol') {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND)
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND)
    }
  }

  const formatQuote = () => {
    if (block !== 'quote') {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createQuoteNode())
        }
      })
    } else {
      formatP()
    }
  }

  return (
    <nav>
      <label>区块样式：</label>
      <button type="button" onClick={formatH3} className={block === 'h3' ? 'button-true' : 'button-false'}>
        小标题
      </button>
      <button type="button" onClick={formatUl} className={block === 'ul' ? 'button-true' : 'button-false'}>
        项目清单
      </button>
      <button type="button" onClick={formatOl} className={block === 'ol' ? 'button-true' : 'button-false'}>
        号数清单
      </button>
      <button type="button" onClick={formatQuote} className={block === 'quote' ? 'button-true' : 'button-false'}>
        引用
      </button>
    </nav>
  )
}
