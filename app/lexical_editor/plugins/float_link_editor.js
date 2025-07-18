import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import {
  $getSelection, $isRangeSelection,
  KEY_ESCAPE_COMMAND, SELECTION_CHANGE_COMMAND
} from "lexical"
import { $findMatchingParent, mergeRegister } from "@lexical/utils"
import { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link"
import { getSelectedNode, sanitizeUrl, setFloatingElemPosition } from "../utils"

// https://github.com/facebook/lexical/blob/main/packages/lexical-playground/src/plugins/FloatingLinkEditorPlugin/index.tsx
function FloatLinkEditor({ editor, anchorElem, isLink, setIsLink }) {
  const editorRef = useRef(null)
  const inputRef = useRef(null)
  const [linkUrl, setLinkUrl] = useState('')
  const [editedLinkUrl, setEditedLinkUrl] = useState('https://')
  const [isEditMode, setIsEditMode] = useState(false)
  const [lastSelection, setLastSelection] = useState(null)

  const updateLinkEditor = useCallback(() => {
    // 判断是否是连结；如果是，获得 URL
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection)
      const parent = node.getParent()
      if ($isLinkNode(parent)) {
        setLinkUrl(parent.getURL())
      } else if ($isLinkNode(node)) {
        setLinkUrl(node.getURL())
      } else {
        setLinkUrl('')
      }
    }

    // 改变浮动工具栏位置
    const editorElem = editorRef.current
    const nativeSelection = window.getSelection()
    const activeElement = document.activeElement
    if (editorElem === null) return

    const rootElement = editor.getRootElement()
    if (
      selection !== null &&
      nativeSelection !== null &&
      rootElement !== null &&
      rootElement.contains(nativeSelection.anchorNode) &&
      editor.isEditable()
    ) {
      const domRect = nativeSelection.focusNode?.parentElement?.getBoundingClientRect()
      if (domRect) {
        domRect.y += 40
        setFloatingElemPosition(domRect, editorElem, anchorElem)
      }
      setLastSelection(selection)
    } else if (!activeElement || activeElement.className !== 'link-input') {
      if (rootElement !== null) {
        setFloatingElemPosition(null, editorElem, anchorElem)
      }
      setLastSelection(null)
      setIsEditMode(false)
      setLinkUrl('')
    }

    return true
  }, [editor, anchorElem])

  useEffect(() => {
    const scrollerElem = anchorElem.parentElement
    const update = () => {
      editor.getEditorState().read(() => { updateLinkEditor() })
    }

    window.addEventListener('resize', update)
    if (scrollerElem) { scrollerElem.addEventListener('scroll', update) }

    return () => {
      window.removeEventListener('resize', update)
      if (scrollerElem) { scrollerElem.removeEventListener('scroll', update) }
    }
  }, [anchorElem.parentElement, editor, updateLinkEditor])

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => { updateLinkEditor() })
      }),
      editor.registerCommand(SELECTION_CHANGE_COMMAND, () => {
        updateLinkEditor()
        return true
      }, 1),
      editor.registerCommand(KEY_ESCAPE_COMMAND, () => {
        if (isLink) {
          setIsLink(false)
          return true
        }
        return false
      }, 3)
    )
  }, [])

  useEffect(() => {
    editor.getEditorState().read(() => { updateLinkEditor() })
  }, [editor, updateLinkEditor])

  useEffect(() => {
    if (isEditMode && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditMode])

  const monitorInputInteraction = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleLinkSubmission()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setIsEditMode(false)
    }
  }

  const handleLinkSubmission = () => {
    if (lastSelection !== null) {
      if (linkUrl !== '') {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, {
          url: sanitizeUrl(editedLinkUrl), target: '_blank', rel: 'noopener noreferrer'
        })
      }
      setIsEditMode(false)
    }
  }

  return (
    <div ref={editorRef} className="link-editor">
      {!isLink ? null : isEditMode ? (
        <div style={{ backgroundColor: "white", border: "1px solid", width: "300px" }}>
          <input
            ref={inputRef}
            className="link-input"
            value={editedLinkUrl}
            onChange={(e) => { setEditedLinkUrl(e.target.value) }}
            onKeyDown={(e) => { monitorInputInteraction(e) }}
          />
          <div>
            <div
              className="link-cancel"
              role="button"
              tabIndex={0}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { setIsEditMode(false) }}
              style={{ textDecoration: 'underline' }}
            >
              取消
            </div>
            <div
              className="link-confirm"
              role="button"
              tabIndex={0}
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleLinkSubmission}
              style={{ textDecoration: 'underline' }}
            >
              确认
            </div>
          </div>
        </div>
      ) : (
        <div className="link-view"
          style={{ backgroundColor: "white", border: "1px solid", width: "300px" }}
        >
          <a href={linkUrl} target="_blank" rel="noopener noreferrer">{linkUrl}</a>
          <div
            className="link-edit"
            role="button"
            tabIndex={0}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setEditedLinkUrl(linkUrl)
              setIsEditMode(true)
            }}
            style={{ textDecoration: 'underline' }}
          >
            编辑
          </div>
          <div
            className="link-trash"
            role="button"
            tabIndex={0}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => { editor.dispatchCommand(TOGGLE_LINK_COMMAND, null) }}
            style={{ textDecoration: 'underline' }}
          >
            删除
          </div>
        </div>
      )}
    </div>
  )
}

export default function FloatLinkEditorPlugin({ anchorElem = document.body }) {
  const [editor] = useLexicalComposerContext()
  const [isLink, setIsLink] = useState(false)

  const updateToolbar = useCallback(() => {
    const selection = $getSelection()
    if (!$isRangeSelection(selection)) return

    const node = getSelectedNode(selection)
    const linkParent = $findMatchingParent(node, $isLinkNode)
    if (linkParent != null) {
      setIsLink(true)
    } else {
      setIsLink(false)
    }
  }, [])

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => { updateToolbar() })
      }),
      editor.registerCommand(SELECTION_CHANGE_COMMAND, () => {
        updateToolbar()
        return false
      }, 4)
    )
  }, [editor, updateToolbar])

  return createPortal(
    <FloatLinkEditor editor={editor} anchorElem={anchorElem} isLink={isLink} setIsLink={setIsLink} />,
    anchorElem
  )
}
