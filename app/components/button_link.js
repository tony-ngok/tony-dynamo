import Link from "next/link"

export default function ButtonLink({ href, disabled, text }) {
  if (disabled) return <span>{text}</span>
  return <Link href={href}>{text}</Link>
}
