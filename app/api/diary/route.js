import { emailValidate } from "@/app/utils"

export async function GET(request) {
  const url = new URL(request.url)
  const email = decodeURIComponent(url.searchParams.get('email') || "")
  if (!emailValidate(email)) {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }

  // 待完成：获得日记
}
