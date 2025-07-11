import { ListItemNode, ListNode } from '@lexical/list'
import { LinkNode } from '@lexical/link'

export const editorTheme = {
  text: {
    bold: 'editor-strong',
    italic: 'editor-em'
  },
  ltr: 'ltr',
  rtl: 'rtl',
  paragraph: 'editor-p'
}

export const editorNodes = [
  ListItemNode, ListNode, LinkNode
]
