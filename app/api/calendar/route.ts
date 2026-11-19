import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const revalidate = 0

const pad = (n: number) => String(n).padStart(2, '0')

// UTCの日時を YYYYMMDDTHHmmSSZ 形式にする
const formatUtc = (iso: string) => {
  const d = new Date(iso)
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  )
}

// 日本時間での日付を YYYYMMDD 形式にする（サーバーの時刻がUTCでも日付がズレないように）
const formatDateJst = (iso: string, addDays = 0) => {
  const shiftMinutes = 9 * 60 + addDays * 24 * 60
  const d = new Date(new Date(iso).getTime() + shiftMinutes * 60 * 1000)
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`
}

// ics で特別な意味を持つ記号をエスケープする
const escapeText = (text: string) =>
  text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')

// 1行が長いと読めないカレンダーアプリがあるので、75バイトごとに折り返す
const foldLine = (line: string) => {
  if (Buffer.byteLength(line, 'utf-8') <= 75) return line

  const chunks: string[] = []
  let current = ''
  for (const char of line) {
    const limit = chunks.length === 0 ? 75 : 74
    if (Buffer.byteLength(current + char, 'utf-8') > limit) {
      chunks.push(current)
      current = ''
    }
    current += char
  }
  chunks.push(current)
  return chunks.join('\r\n ')
}

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*')
    .gte('end_time', oneMonthAgo.toISOString())
    .order('start_time', { ascending: true })

  if (error || !bookings) {
    return new NextResponse('Error', { status: 500 })
  }

  const stamp = formatUtc(new Date().toISOString())

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//StudioBooking//JA',
    'X-WR-CALNAME:スタジオ予約',
    'X-WR-TIMEZONE:Asia/Tokyo',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ]

  for (const b of bookings) {
    // 日本時間に直してから判定する（0:00開始なら告知）
    const startJst = new Date(new Date(b.start_time).getTime() + 9 * 60 * 60 * 1000)
    const isEvent =
      b.type === 'event' || (startJst.getUTCHours() === 0 && startJst.getUTCMinutes() === 0)
    const isPersonal = b.type === 'personal' || b.band_name === '個人練'

    // カレンダーアプリでは色が付けられないので、個人練は名前を付けて見分けられるようにする
    const title = isPersonal && b.leader ? b.leader : b.band_name

    lines.push('BEGIN:VEVENT')
    lines.push(`UID:${b.id}@studio-booking`)
    lines.push(`DTSTAMP:${stamp}`)
    lines.push(`SUMMARY:${escapeText(title)}`)
    lines.push(`DESCRIPTION:${escapeText(`代表者: ${b.leader}`)}`)

    if (isEvent) {
      // 告知は「終日」の予定として扱う
      lines.push(`DTSTART;VALUE=DATE:${formatDateJst(b.start_time)}`)
      lines.push(`DTEND;VALUE=DATE:${formatDateJst(b.start_time, 1)}`)
    } else {
      lines.push(`DTSTART:${formatUtc(b.start_time)}`)
      lines.push(`DTEND:${formatUtc(b.end_time)}`)
    }

    lines.push('END:VEVENT')
  }

  lines.push('END:VCALENDAR')

  return new NextResponse(lines.map(foldLine).join('\r\n'), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="studio.ics"',
    },
  })
}
