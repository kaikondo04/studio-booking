import { supabase } from '../utils/supabase'
import BookingForm from '../components/BookingForm'
import RealtimeListener from '../components/RealtimeListener'
import MonthCalendar from '../components/MonthCalendar'
import RefreshButton from '../components/RefreshButton'

export const revalidate = 0

// 今日が含まれる月を 'YYYY-MM' で返す（サーバーのタイムゾーンに関係なく日本時間で計算）
function getCurrentMonth() {
  const jst = new Date(Date.now() + 9 * 60 * 60 * 1000)
  return `${jst.getUTCFullYear()}-${String(jst.getUTCMonth() + 1).padStart(2, '0')}`
}

// 'YYYY-MM' から、その月の範囲（日本時間の1日0:00〜翌月1日0:00）をISO文字列で作る
function getMonthRange(month: string) {
  const [year, m] = month.split('-').map(Number)
  // 日本時間の0:00はUTCの前日15:00なので、時に -9 を指定して補正する
  const start = new Date(Date.UTC(year, m - 1, 1, -9, 0, 0))
  const end = new Date(Date.UTC(year, m, 1, -9, 0, 0))
  return { start: start.toISOString(), end: end.toISOString() }
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const params = await searchParams
  const month =
    params.month && /^\d{4}-\d{2}$/.test(params.month) ? params.month : getCurrentMonth()

  const { start, end } = getMonthRange(month)

  // 表示する月の予約だけを取得する（全件取ると1000件の上限で新しい予約が切り捨てられる）
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*')
    .gte('start_time', start)
    .lt('start_time', end)
    .order('start_time', { ascending: true })

  if (error) {
    return <div className="p-4 text-red-500">エラー: {error.message}</div>
  }

  return (
    <div className="p-4 font-sans max-w-md mx-auto">
      <RealtimeListener />

      <h1 className="text-3xl font-bold mb-6 text-center text-black">🎸 スタジオ予約</h1>

      <BookingForm />

      <div className="flex justify-between items-end mb-4 border-b-2 border-gray-300 pb-2 mt-10">
        <h2 className="text-2xl font-bold text-black m-0">📅 予約カレンダー</h2>
        <RefreshButton />
      </div>

      {/* key に月を渡すと、月を移動したときに選択日などの状態がリセットされる */}
      <MonthCalendar key={month} month={month} bookings={bookings || []} />

      <div className="h-20"></div>
    </div>
  )
}