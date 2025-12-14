import { supabase } from '../utils/supabase'
import BookingForm from '../components/BookingForm'
import RealtimeListener from '../components/RealtimeListener'
import DailySchedule from '../components/DailySchedule' // ←新しく追加

type Booking = {
  id: number
  band_name: string
  studio: string
  start_time: string
  end_time: string
  leader: string 
}

type GroupedBookings = {
  [date: string]: Booking[]
}

export const revalidate = 0

export default async function Home() {
  const now = new Date().toISOString()

  // 今後の予約を取得
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*')
    .gte('end_time', now)
    .order('start_time', { ascending: true })

  if (error) {
    return <div className="p-4">エラー: {error.message}</div>
  }

  // 予約を「日付ごと」にグループ分けする処理
  const groupedBookings: GroupedBookings = {}
  
  // ★予約がない日も表示したい場合は、ここで工夫が必要ですが、
  // まずは「予約がある日」を表示する形にします。
  bookings?.forEach((booking) => {
    const dateKey = new Date(booking.start_time).toLocaleDateString('ja-JP', {
      month: 'numeric',
      day: 'numeric',
      weekday: 'short',
      timeZone: 'Asia/Tokyo'
    })

    if (!groupedBookings[dateKey]) {
      groupedBookings[dateKey] = []
    }
    groupedBookings[dateKey].push(booking)
  })

  return (
    <div className="p-4 font-sans max-w-md mx-auto">
      <RealtimeListener />

      <h1 className="text-3xl font-bold mb-6 text-center text-black">🎸 スタジオ予約</h1>

      <BookingForm />

      <h2 className="text-2xl font-bold mb-6 border-b-2 border-gray-300 pb-2 mt-10 text-black">📅 予約スケジュール</h2>

      {/* ここから新しい時間割表示 */}
      <div className="space-y-4">
        {Object.keys(groupedBookings).map((date) => (
          <DailySchedule 
            key={date} 
            date={date} 
            bookings={groupedBookings[date]} 
          />
        ))}
      </div>

      {bookings?.length === 0 && (
        <p className="text-center text-gray-600 mt-10 text-lg font-bold">今後の予約はありません。</p>
      )}
      
      <div className="h-20"></div>
    </div>
  )
}