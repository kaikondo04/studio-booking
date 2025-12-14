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
  const startHour = 8
  const endHour = 22
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i)

  const getBookingAt = (hour: number) => {
    return bookings.find(b => {
      const start = new Date(b.start_time).getHours()
      const end = new Date(b.end_time).getHours()
      // 分またぎの判定（例: 13:00終了の場合は12時台まで、13:01終了なら13時台も含む）
      const endMinutes = new Date(b.end_time).getMinutes()
      const actualEndHour = endMinutes === 0 ? end : end // そのまま
      
      return hour >= start && hour < end
    })
  }

  const isStartOfBooking = (hour: number, booking: Booking) => {
    const start = new Date(booking.start_time).getHours()
    return hour === start
  }

  // 時間を「12:45」のように綺麗にする関数
  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // 「何分開始か」によって、上の余白（クッション）の高さを計算する関数
  const getTopSpacerHeight = (startTime: string) => {
    const minutes = new Date(startTime).getMinutes()
    // 60分のうちの割合 × 枠の高さ(約50px)
    return (minutes / 60) * 50
  }

  return (
    <div className="mb-10 border rounded-xl overflow-hidden shadow-sm bg-white">
      <div className="bg-gray-900 text-white p-3 font-bold text-lg text-center">
        {date}
      </div>

      <div className="divide-y divide-gray-200">
        {hours.map((hour) => {
          const booking = getBookingAt(hour)
          const isBusy = !!booking
          const isStart = booking && isStartOfBooking(hour, booking)

          return (
            <div key={hour} className={`flex ${isBusy ? 'bg-blue-50' : 'bg-white'}`}>
              
              {/* 左側：時刻 */}
              <div className="w-16 flex-shrink-0 border-r border-gray-200 text-gray-500 font-mono text-sm flex flex-col items-center justify-start pt-2">
                <span>{hour.toString().padStart(2, '0')}:00</span>
                {/* 30分の補助線用メモリ（あってもなくても良いですが、あると便利） */}
                <span className="text-gray-200 text-xs mt-4">- 30 -</span>
              </div>

              {/* 右側：内容 */}
              <div className="flex-grow min-h-[60px] relative"> {/* 高さを少し広げました */}
                
                {isBusy ? (
                  <div className="w-full h-full relative px-2">
                    
                    {/* 開始時間のときだけ表示 */}
                    {isStart && (
                      <div style={{ paddingTop: `${getTopSpacerHeight(booking.start_time)}px` }}>
                        <div className="bg-white/80 rounded-lg p-2 border border-blue-200 shadow-sm">
                          {/* ★ここで正確な時間を表示！ */}
                          <div className="text-blue-700 font-bold text-sm mb-1 flex items-center gap-1">
                            🕒 {formatTime(booking.start_time)} 〜 {formatTime(booking.end_time)}
                          </div>
                          
                          <div className="font-bold text-black text-lg leading-tight">
                            {booking.band_name}
                          </div>
                          <div className="text-xs text-gray-600">
                            代表: {booking.leader}
                          </div>

                          <div className="absolute top-2 right-2">
                            <DeleteButton id={booking.id} />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 続きの時間（2時間目以降）の表示 */}
                    {!isStart && (
                      <div className="h-full flex items-center justify-center">
                        <div className="w-1 h-full bg-blue-200 rounded-full"></div>
                      </div>
                    )}
                  </div>
                ) : (
                  // 空きの表示
                  <div className="h-full flex items-center pl-2">
                    <span className="text-gray-300 text-sm">Empty</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}