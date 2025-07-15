import { ListItemNode, ListNode } from '@lexical/list'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { LinkNode } from '@lexical/link'
import { $isAtNodeEnd } from '@lexical/selection'

export const editorTheme = {
  text: {
    bold: 'editor-strong',
    italic: 'editor-em'
  },
  heading: {
    h3: 'editor-head'
  },
  list: {
    ol: 'editor-ol',
    ul: 'editor-ul'
  },
  ltr: 'ltr',
  rtl: 'rtl',
  paragraph: 'editor-p',
  quote: 'editor-quote'
}

export const editorNodes = [
  HeadingNode, LinkNode, ListItemNode, ListNode, QuoteNode
]

export function getSelectedNode(selection) {
  const anchor = selection.anchor
  const focus = selection.focus
  const anchorNode = selection.anchor.getNode()
  const focusNode = selection.focus.getNode()
  if (anchorNode === focusNode) {
    return anchorNode
  }
  const isBackward = selection.isBackward()
  if (isBackward) {
    return $isAtNodeEnd(focus) ? anchorNode : focusNode
  } else {
    return $isAtNodeEnd(anchor) ? focusNode : anchorNode
  }
}
