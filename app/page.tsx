import { supabase } from '../utils/supabase'
import BookingForm from '../components/BookingForm'
import RealtimeListener from '../components/RealtimeListener'
import ScheduleTabs from '../components/ScheduleTabs' // ← 新しい部品

export const revalidate = 0

export default async function Home() {
  const now = new Date().toISOString()

  // 今後の予約を全部取ってくる
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*')
    .gte('end_time', now)
    .order('start_time', { ascending: true })

  if (error) {
    return <div className="p-4">エラー: {error.message}</div>
  }

  return (
    <div className="p-4 font-sans max-w-md mx-auto">
      <RealtimeListener />

      <h1 className="text-3xl font-bold mb-6 text-center text-black">🎸 スタジオ予約</h1>

      <BookingForm />

      <h2 className="text-2xl font-bold mb-4 border-b-2 border-gray-300 pb-2 mt-10 text-black">📅 予約スケジュール</h2>

      {/* ここがタブ付きのスケジュール表になりました！ */}
      <ScheduleTabs bookings={bookings || []} />
      
      <div className="h-20"></div>
    </div>
  )
}