import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// キャッシュを無効化（常に最新のデータを返す）
export const revalidate = 0

export async function GET() {
  // 1. Supabaseのクライアントを作成（APIルート内では直接作成するのが確実です）
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey)

  // 2. 未来の予約と、直近1ヶ月の過去データを取得
  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
  
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*')
    .gte('end_time', oneMonthAgo.toISOString())
    .order('start_time', { ascending: true })

  if (!bookings) {
    return new NextResponse('Error', { status: 500 })
  }

  // 3. iCalendar形式（.ics）のテキストを作成
  let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//StudioBooking//JA
X-WR-CALNAME:スタジオ予約
X-WR-TIMEZONE:Asia/Tokyo
CALSCALE:GREGORIAN
METHOD:PUBLISH
`

  // 日付をフォーマットする関数 (YYYYMMDDTHHmmSSZ)
  const formatDate = (isoString: string) => {
    // UTC時間をそのまま扱う（iPhone側で日本時間に直してくれる）
    return isoString.replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  bookings.forEach((b) => {
    const start = formatDate(b.start_time)
    const end = formatDate(b.end_time)
    
    // タイトルなどの調整
    let summary = b.band_name
    let description = `代表者: ${b.leader}`
    
    // 告知のみ(0分)の場合の処理
    const bStart = new Date(b.start_time)
    const isEvent = bStart.getHours() === 0 && bStart.getMinutes() === 0
    
    if (isEvent) {
      // 終日イベントとして扱う
      const dateOnly = b.start_time.replace(/-/g, '').split('T')[0]
      // 次の日付を計算（終日指定のため）
      const nextDay = new Date(b.start_time)
      nextDay.setDate(nextDay.getDate() + 1)
      const nextDateOnly = nextDay.toISOString().replace(/-/g, '').split('T')[0]

      icsContent += `BEGIN:VEVENT
UID:${b.id}@studio-booking
DTSTAMP:${formatDate(new Date().toISOString())}
DTSTART;VALUE=DATE:${dateOnly}
DTEND;VALUE=DATE:${nextDateOnly}
SUMMARY:${summary}
DESCRIPTION:${description}
END:VEVENT
`
    } else {
      // 通常の予約
      icsContent += `BEGIN:VEVENT
UID:${b.id}@studio-booking
DTSTAMP:${formatDate(new Date().toISOString())}
DTSTART:${start}
DTEND:${end}
SUMMARY:${summary}
DESCRIPTION:${description}
END:VEVENT
`
    }
  })

  icsContent += `END:VCALENDAR`

  // 4. レスポンスを返す
  return new NextResponse(icsContent, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="studio.ics"',
    },
  })
}