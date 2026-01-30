import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const revalidate = 0

export async function GET() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
  
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*')
    .gte('end_time', oneMonthAgo.toISOString())
    .order('start_time', { ascending: true })

  if (!bookings) return new NextResponse('Error', { status: 500 })

  let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//StudioBooking//JA
X-WR-CALNAME:スタジオ予約
X-WR-TIMEZONE:Asia/Tokyo
CALSCALE:GREGORIAN
METHOD:PUBLISH
`
  // UTC時間をYYYYMMDDTHHmmSSZ形式にする
  const formatDate = (iso: string) => iso.replace(/[-:]/g, '').split('.')[0] + 'Z'
  const formatDateOnly = (iso: string) => iso.replace(/-/g, '').split('T')[0]

  bookings.forEach((b) => {
    const startObj = new Date(b.start_time)
    const isEvent = startObj.getHours() === 0 && startObj.getMinutes() === 0 // 告知かどうか

    icsContent += `BEGIN:VEVENT
UID:${b.id}@studio-booking
DTSTAMP:${formatDate(new Date().toISOString())}
SUMMARY:${b.band_name}
DESCRIPTION:代表者: ${b.leader}
`
    if (isEvent) {
      // 告知の場合は「終日」として扱う
      const nextDay = new Date(b.start_time)
      nextDay.setDate(nextDay.getDate() + 1)
      icsContent += `DTSTART;VALUE=DATE:${formatDateOnly(b.start_time)}
DTEND;VALUE=DATE:${formatDateOnly(nextDay.toISOString())}
`
    } else {
      // 通常予約は時間を指定
      icsContent += `DTSTART:${formatDate(b.start_time)}
DTEND:${formatDate(b.end_time)}
`
    }
    icsContent += `END:VEVENT
`
  })

  icsContent += `END:VCALENDAR`

  return new NextResponse(icsContent, {
    headers: { 'Content-Type': 'text/calendar; charset=utf-8', 'Content-Disposition': 'attachment; filename="studio.ics"' },
  })
}