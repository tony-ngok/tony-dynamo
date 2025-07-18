import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import {
  $getSelection, $isParagraphNode, $isRangeSelection, $isTextNode, getDOMSelection,
  FORMAT_TEXT_COMMAND, SELECTION_CHANGE_COMMAND,
  $createParagraphNode
} from "lexical"
import { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link"
import { getDOMRangeRect, getSelectedNode, setFloatingElemPosition } from "../utils"
import { $getNearestNodeOfType, mergeRegister } from "@lexical/utils"
import {
  $isListNode, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND,
  ListNode, REMOVE_LIST_COMMAND
} from "@lexical/list"
import { $createHeadingNode, $createQuoteNode, $isHeadingNode } from "@lexical/rich-text"
import { $setBlocksType } from "@lexical/selection"

// https://github.com/facebook/lexical/blob/main/packages/lexical-playground/src/plugins/FloatingTextFormatToolbarPlugin/index.tsx
function FloatFormatBar({ editor, anchorElem, isBold, isItalic, isLink }) {
  const [block, setBlock] = useState('paragraph')

  // https://zh-hans.react.dev/reference/react/useRef#manipulating-the-dom-with-a-ref
  // 对应的 DOM 节点创建渲染后，可使用此 ref 操作该节点
  const popupRef = useRef(null)

  const insertLink = useCallback(() => {
    if (!isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, 'https://')
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
    }
  }, [editor, isLink])

  const updateToolbar = useCallback(() => {
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

    // 更新浮动工具栏位置
    const popupElem = popupRef.current
    const nativeSelection = getDOMSelection(editor._window)
    if (popupElem === null) return
    const rootElement = editor.getRootElement()
    if (selection !== null &&
      nativeSelection !== null &&
      !nativeSelection.isCollapsed &&
      rootElement !== null &&
      rootElement.contains(nativeSelection.anchorNode)
    ) {
      const rangeRect = getDOMRangeRect(nativeSelection, rootElement)
      setFloatingElemPosition(rangeRect, popupElem, anchorElem)
    }
  }, [editor, anchorElem])

  const mouseMoveListener = (e) => {
    if (popupRef?.current && (e.buttons === 1 || e.buttons === 3)) {
      if (popupRef.current.style.pointerEvents !== 'none') {
        const x = e.clientX
        const y = e.clientY
        const elementUnderMouse = document.elementFromPoint(x, y)

        if (!popupRef.current.contains(elementUnderMouse)) {
          popupRef.current.style.pointerEvents = 'none'
        }
      }
    }
  }

  const mouseUpListener = (e) => {
    if (popupRef?.current) {
      if (popupRef.current.style.pointerEvents !== 'auto') {
        popupRef.current.style.pointerEvents = 'auto'
      }
    }
  }

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

  useEffect(() => {
    if (popupRef?.current) {
      document.addEventListener('mousemove', mouseMoveListener)
      document.addEventListener('mouseup', mouseUpListener)

      return () => {
        document.removeEventListener('mousemove', mouseMoveListener)
        document.removeEventListener('mouseup', mouseUpListener)
      }
    }
  }, [popupRef])

  useEffect(() => {
    const scrollerElem = anchorElem.parentElement

    const update = () => {
      editor.getEditorState().read(() => { updateToolbar() })
    }

    window.addEventListener('resize', update)
    if (scrollerElem) {
      scrollerElem.addEventListener('scroll', update)
    }

    // https://zh-hans.react.dev/reference/react/useEffect#parameters
    return () => {
      window.removeEventListener('resize', update)
      if (scrollerElem) {
        scrollerElem.removeEventListener('scroll', update)
      }
    } // 返回清理函数：每次依赖变更重渲染后，再 setup 前运行
  }, [editor, updateToolbar, anchorElem])

  useEffect(() => {
    editor.getEditorState().read(() => { updateToolbar() })

    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => { updateToolbar() })
      }),
      editor.registerCommand(SELECTION_CHANGE_COMMAND, () => {
        updateToolbar()
        return false
      }, 1)
    )
  }, [editor, updateToolbar])

  return (
    <nav ref={popupRef}>
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
      <button type="button" onClick={insertLink} className={isLink ? 'button-true' : 'button-false'}>
        连结
      </button>
    </nav>
  )
}

export default function FloatFormatBarPlugin({ anchorElem = document.body }) {
  const [editor] = useLexicalComposerContext()
  const [isText, setIsText] = useState(false)
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isLink, setIsLink] = useState(false)

  // https://zh-hans.react.dev/reference/react/useCallback
  // useCallBack：在多次渲染中返回（不是调用）函数；是否/何时调用由我决定（当依赖发生变化时触发）
  const updatePopup = useCallback(() => {
    editor.getEditorState().read(() => {
      if (editor.isComposing()) return

      const selection = $getSelection()
      const nativeSelection = getDOMSelection(editor._window)
      const rootElement = editor.getRootElement()
      if (nativeSelection !== null && (!$isRangeSelection(selection) || rootElement === null || !rootElement.contains(nativeSelection.anchorNode))) {
        setIsText(false)
        return
      }
      if (!$isRangeSelection(selection)) return

      const node = getSelectedNode(selection)

      // 获得文字格式
      setIsBold(selection.hasFormat('bold'))
      setIsItalic(selection.hasFormat('italic'))

      // 获得连结
      const parent = node.getParent()
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true)
      } else {
        setIsLink(false)
      }

      if (selection.getTextContent() !== '') {
        setIsText($isTextNode(node) || $isParagraphNode(node))
      } else {
        setIsText(false)
      }

      const rawTextContent = selection.getTextContent().replace(/\n/g, '')
      if (!selection.isCollapsed() && rawTextContent === '') {
        setIsText(false)
        return
      }
    })
  }, [editor])

  useEffect(() => {
    // 当 document 触发 selectionchange 事件时，回调 updatePopup 函数
    document.addEventListener('selectionchange', updatePopup)

    return () => { document.removeEventListener('selectionchange', updatePopup) }
  }, [updatePopup])

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(() => { updatePopup() }),
      editor.registerRootListener(() => {
        if (editor.getRootElement() === null) { setIsText(false) }
      })
    )
  }, [editor, updatePopup])

  if (!isText) return null

  return createPortal(
    <FloatFormatBar
      editor={editor} anchorElem={anchorElem} isBold={isBold} isItalic={isItalic} isLink={isLink}
    />, anchorElem
  )
}
