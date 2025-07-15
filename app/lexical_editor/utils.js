import { ListItemNode, ListNode } from '@lexical/list'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { LinkNode } from '@lexical/link'

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
