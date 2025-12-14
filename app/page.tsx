import { supabase } from '../utils/supabase'
import BookingForm from '../components/BookingForm'
import DeleteButton from '../components/DeleteButton'
import RealtimeListener from '../components/RealtimeListener' // ←追加されました

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

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*')
    .gte('end_time', now)
    .order('start_time', { ascending: true })

  if (error) {
    return <div className="p-4">エラー: {error.message}</div>
  }

  const groupedBookings: GroupedBookings = {}
  
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

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Tokyo'
    })
  }

  return (
    <div className="p-4 font-sans max-w-md mx-auto">
      {/* ★ここに監視カメラを設置！ */}
      <RealtimeListener />

      <h1 className="text-3xl font-bold mb-6 text-center text-black">🎸 スタジオ予約</h1>

      <BookingForm />

      <h2 className="text-2xl font-bold mb-6 border-b-2 border-gray-300 pb-2 mt-10 text-black">📅 今後の予約</h2>

      <div className="space-y-8">
        {Object.keys(groupedBookings).map((date) => (
          <div key={date}>
            <h3 className="text-xl font-bold bg-black text-white px-4 py-2 rounded mb-4 inline-block">
              {date}
            </h3>

            <ul className="space-y-4">
              {groupedBookings[date].map((booking) => (
                <li key={booking.id} className="border-l-8 border-blue-700 pl-4 py-3 bg-white shadow-md rounded-r-lg relative border border-gray-200">
                  
                  <div className="flex justify-between items-start pr-10">
                    <div>
                      <div className="text-blue-800 font-extrabold text-2xl leading-none mb-2">
                        {formatTime(booking.start_time)} <span className="text-black text-lg">〜</span> {formatTime(booking.end_time)}
                      </div>
                      <div className="font-bold text-xl text-black">
                        {booking.band_name}
                      </div>
                      <div className="text-base text-gray-700 mt-1 font-medium">
                        代表: {booking.leader}
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-3 right-3">
                    <DeleteButton id={booking.id} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {bookings?.length === 0 && (
        <p className="text-center text-gray-600 mt-10 text-lg font-bold">今後の予約はありません。</p>
      )}
      
      <div className="h-20"></div>
    </div>
  )
}