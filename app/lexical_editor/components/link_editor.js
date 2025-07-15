import { $getSelection, $isRangeSelection } from "lexical"
import { useEffect, useState } from "react"
import { getSelectedNode } from "../utils"
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link'

export default function LinkEditor({ editor }) {
  const [linkUrl, setLinkUrl] = useState("")

  useEffect(() => {
    function update() {
      const selection = $getSelection()
      if (!(selection && $isRangeSelection(selection))) return

      // 获得文字是不是连结
      const node = getSelectedNode(selection)
      const parent = node.getParent()
      if ($isLinkNode(parent)) {
        setLinkUrl(parent.getURL())
      } else if ($isLinkNode(node)) {
        setLinkUrl(node.getURL())
      } else {
        setLinkUrl("")
      }
    }

    editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => { update() })
    })
  }, [editor])

  const edit = () => {
    let link = ""
    while (!(link && (link.startsWith('http://') || link.startsWith('https://')))) {
      link = prompt("请输入连结：", linkUrl)
      if (link === null) return
      link = link.trim()
    }
    setLinkUrl(link)
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, link)
  }

  return (
    <>
      <button type="button" onClick={edit}>
        {linkUrl ? "编辑" : "添加"}连结
      </button>
      {linkUrl &&
        <button type="button" onClick={() => editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)}>
          消除连结
        </button>
      }
    </>
  )
}
