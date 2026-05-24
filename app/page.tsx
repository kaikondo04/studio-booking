import { supabase } from '../utils/supabase'
import BookingForm from '../components/BookingForm'
import RealtimeListener from '../components/RealtimeListener'
import MonthCalendar from '../components/MonthCalendar'
import RefreshButton from '../components/RefreshButton' // ★更新ボタンを読み込む！

export const revalidate = 0

export default async function Home() {
  const now = new Date().toISOString()

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*')
    .order('start_time', { ascending: true })

  if (error) {
    return <div className="p-4 text-red-500">エラー: {error.message}</div>
  }

  return (
    <div className="p-4 font-sans max-w-md mx-auto">
      <RealtimeListener />

      <h1 className="text-3xl font-bold mb-6 text-center text-black">🎸 スタジオ予約</h1>

      <BookingForm />

      {/* ★見出しと更新ボタンを横並びにする！ */}
      <div className="flex justify-between items-end mb-4 border-b-2 border-gray-300 pb-2 mt-10">
        <h2 className="text-2xl font-bold text-black m-0">📅 予約カレンダー</h2>
        <RefreshButton />
      </div>

      <MonthCalendar bookings={bookings || []} />
      
      <div className="h-20"></div>
    </div>
  )
}