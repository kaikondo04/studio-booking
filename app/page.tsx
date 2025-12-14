import { supabase } from '../utils/supabase'
import BookingForm from '../components/BookingForm'
import DeleteButton from '../components/DeleteButton'

type Booking = {
  id: number
  band_name: string
  studio: string
  start_time: string
  end_time: string
  leader: string 
}

// 予約データを日付ごとにまとめるための型
type GroupedBookings = {
  [date: string]: Booking[]
}

export const revalidate = 0

export default async function Home() {
  const now = new Date().toISOString()

  // データの取得
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*')
    .gte('end_time', now)
    .order('start_time', { ascending: true })

  if (error) {
    return <div className="p-4">エラー: {error.message}</div>
  }

  // ★データを「日付ごと」にグループ化する処理
  const groupedBookings: GroupedBookings = {}
  
  bookings?.forEach((booking) => {
    // JST(日本時間)で日付の文字列を作る（例: 12/15(月)）
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

  // 時間だけを表示する関数
  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Tokyo'
    })
  }

  return (
    <div className="p-6 font-sans max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">🎸 スタジオ予約</h1>

      <BookingForm />

      <h2 className="text-xl font-bold mb-6 border-b pb-2">📅 今後の予約</h2>

      {/* ★ここから表示ロジックが変わりました */}
      <div className="space-y-8">
        {Object.keys(groupedBookings).map((date) => (
          <div key={date}>
            {/* 日付のヘッダー（例：12/15(月)） */}
            <h3 className="text-lg font-bold bg-gray-200 text-gray-800 px-3 py-1 rounded mb-3 inline-block">
              {date}
            </h3>

            <ul className="space-y-3">
              {groupedBookings[date].map((booking) => (
                <li key={booking.id} className="border-l-4 border-blue-500 pl-4 py-2 bg-white shadow-sm rounded-r relative">
                  
                  {/* 時間とバンド名 */}
                  <div className="flex justify-between items-start pr-8">
                    <div>
                      <div className="text-blue-600 font-bold text-lg leading-none mb-1">
                        {formatTime(booking.start_time)} 〜 {formatTime(booking.end_time)}
                      </div>
                      <div className="font-bold text-lg">
                        {booking.band_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        代表: {booking.leader}
                      </div>
                    </div>
                  </div>

                  {/* 削除ボタン（右上に配置） */}
                  <div className="absolute top-2 right-2">
                    <DeleteButton id={booking.id} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {bookings?.length === 0 && (
        <p className="text-center text-gray-500 mt-10">今後の予約はありません。</p>
      )}
    </div>
  )
}