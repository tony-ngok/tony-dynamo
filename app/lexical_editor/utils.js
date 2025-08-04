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

// https://github.com/facebook/lexical/blob/main/packages/lexical-playground/src/utils/setFloatingElemPosition.ts
export function setFloatingElemPosition(targetRect, floatingElem, anchorElem, verticalGap = 10, horizontalOffset = 5) {
  const scrollerElem = anchorElem.parentElement

  if (targetRect === null || !scrollerElem) {
    floatingElem.style.opacity = '0'
    floatingElem.style.transform = 'translate(-10000px, -10000px)'
    return
  }

  const floatingElemRect = floatingElem.getBoundingClientRect()
  const anchorElementRect = anchorElem.getBoundingClientRect()
  const editorScrollerRect = scrollerElem.getBoundingClientRect()

  let top = targetRect.top - floatingElemRect.height - verticalGap
  let left = targetRect.left - horizontalOffset

  if (top < editorScrollerRect.top) {
    top += (floatingElemRect.height + targetRect.height + verticalGap * 2)
  }

  if (left + floatingElemRect.width > editorScrollerRect.right) {
    left = editorScrollerRect.right - floatingElemRect.width - horizontalOffset
  }

  if (left < editorScrollerRect.left) {
    left = editorScrollerRect.left + horizontalOffset
  }

  top -= (anchorElementRect.height + 70)

  floatingElem.style.opacity = '1'
  floatingElem.style.transform = `translate(${left}px, ${top}px)`
}

// https://github.com/facebook/lexical/blob/main/packages/lexical-playground/src/utils/getDOMRangeRect.ts
export function getDOMRangeRect(nativeSelection, rootElement) {
  const domRange = nativeSelection.getRangeAt(0)

  let rect
  if (nativeSelection.anchorNode === rootElement) {
    let inner = rootElement
    while (inner.firstElementChild !== null) {
      inner = inner.firstElementChild
    }
    rect = inner.getBoundingClientRect()
  } else {
    rect = domRange.getBoundingClientRect()
  }

  return rect
}

// https://github.com/facebook/lexical/blob/main/packages/lexical-playground/src/utils/url.ts
export function sanitizeUrl(url) {
  const SAFE_URL_PATTERN = /^(?:(?:https?|mailto|ftp|tel|file|sms):|[^&:/?#]*(?:[/?#]|$))/gi
  const DATA_URL_PATTERN = /^data:(?:image\/(?:bmp|gif|jpeg|jpg|png|tiff|webp)|video\/(?:mpeg|mp4|ogg|webm)|audio\/(?:mp3|oga|ogg|opus));base64,[a-z0-9+/]+=*$/i
  url = String(url).trim()
  if (url.match(SAFE_URL_PATTERN) || url.match(DATA_URL_PATTERN)) return url
  return 'https://'
}
