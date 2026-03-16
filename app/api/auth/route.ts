import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { code } = await req.json()
  const portalCode = process.env.PORTAL_CODE

  if (!portalCode || code !== portalCode) {
    return NextResponse.json({ valid: false }, { status: 401 })
  }

  const token = Buffer.from(`${code}:${Date.now()}`).toString('base64')
  return NextResponse.json({ valid: true, token })
}
