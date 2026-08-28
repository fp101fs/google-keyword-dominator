import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  
  const res = NextResponse.json({ success: true });
  res.cookies.delete('gkd_gsc_tokens');
  return res;
}
