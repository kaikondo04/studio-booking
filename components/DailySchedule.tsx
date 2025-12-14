'use client'

import DeleteButton from './DeleteButton'

type Booking = {
  id: number
  band_name: string
  start_time: string
  end_time: string
  leader: string
}

export default function DailySchedule({ date, bookings }: { date: string, bookings: Booking[] }) {
  // スタジオの営業時間（例: 9時から21時まで）
  const startHour = 9
  const endHour = 21
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i)

  // 時間ごとの予約データを判定する関数
  const getBookingAt = (hour: number) => {
    return bookings.find(b => {
      const start = new Date(b.start_time).getHours()
      const end = new Date(b.end_time).getHours()
      // その時間が予約に含まれているか（終了時間は含まない）
      return hour >= start && hour < end
    })
  }

  // 同じ予約の「最初の1時間」かどうか（バンド名を表示するため）
  const isStartOfBooking = (hour: number, booking: Booking) => {
    const start = new Date(booking.start_time).getHours()
    return hour === start
  }

  return (
    <div className="mb-10 border rounded-xl overflow-hidden shadow-sm bg-white">
      {/* 日付ヘッダー */}
      <div className="bg-gray-900 text-white p-3 font-bold text-lg text-center">
        {date}
      </div>

      <div className="divide-y divide-gray-200">
        {hours.map((hour) => {
          const booking = getBookingAt(hour)
          const isBusy = !!booking

          return (
            <div key={hour} className={`flex ${isBusy ? 'bg-blue-50' : 'bg-white'}`}>
              
              {/* 左側：時刻 */}
              <div className="w-16 flex-shrink-0 border-r border-gray-200 p-3 text-gray-500 font-mono text-sm flex items-center justify-center">
                {hour}:00
              </div>

              {/* 右側：内容 */}
              <div className="flex-grow p-2 min-h-[50px] flex items-center">
                {isBusy ? (
                  <div className="w-full relative">
                    {/* 予約の開始時刻のときだけバンド名を表示 */}
                    {isStartOfBooking(hour, booking) && (
                      <div>
                        <div className="font-bold text-black text-lg">
                          {booking.band_name}
                        </div>
                        <div className="text-xs text-gray-600">
                          代表: {booking.leader}
                        </div>
                        {/* 削除ボタンを右上に */}
                        <div className="absolute top-0 right-0">
                          <DeleteButton id={booking.id} />
                        </div>
                      </div>
                    )}
                    {/* 続きの時間は矢印を表示 */}
                    {!isStartOfBooking(hour, booking) && (
                      <div className="text-blue-300 text-xl pl-2">⬇︎</div>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-300 text-sm">Empty</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}