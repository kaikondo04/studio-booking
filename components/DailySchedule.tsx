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

  // 予約バーの位置と高さを計算する関数
  const getBookingStyle = (hour: number, booking: Booking) => {
    const start = new Date(booking.start_time)
    const end = new Date(booking.end_time)
    
    // この時間の枠（例: 13:00〜14:00）
    const hourStart = new Date(start)
    hourStart.setHours(hour, 0, 0, 0)
    const hourEnd = new Date(start)
    hourEnd.setHours(hour + 1, 0, 0, 0)

    // この枠の中で、予約が「どこから」始まって「どこまで」あるか
    const visualStart = start < hourStart ? hourStart : start
    const visualEnd = end > hourEnd ? hourEnd : end

    // 分に直して計算
    const startMin = visualStart.getMinutes()
    let endMin = visualEnd.getMinutes()
    if (endMin === 0 && visualEnd > visualStart) endMin = 60

    const durationMin = endMin - startMin

    return {
      top: `${(startMin / 60) * 100}%`,
      height: `${(durationMin / 60) * 100}%`
    }
  }

  // その時間に表示すべき予約を探す関数
  const getBookingAt = (hour: number) => {
    return bookings.find(b => {
      const start = new Date(b.start_time).getHours()
      const end = new Date(b.end_time).getHours()
      const endMinutes = new Date(b.end_time).getMinutes()
      
      // 基本的に開始〜終了の間なら表示
      if (hour >= start && hour < end) return true
      // 分またぎ（例: 14:30終了）の場合、14時の枠も表示対象にする
      if (hour === end && endMinutes > 0) return true
      return false
    })
  }

  // 時間を「13:00」のように綺麗にする関数
  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    })
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
          const style = booking ? getBookingStyle(hour, booking) : null
          
          // その枠が予約の「開始地点」かどうか（タイトル表示用）
          const isStartBlock = booking && new Date(booking.start_time).getHours() === hour

          return (
            <div key={hour} className="flex bg-white h-24 relative">
              
              {/* 左側：時刻（XX:00のみ表示） */}
              <div className="w-16 flex-shrink-0 border-r border-gray-100 text-gray-400 font-mono text-xs flex flex-col items-center justify-start pt-2 bg-gray-50">
                <span>{hour.toString().padStart(2, '0')}:00</span>
              </div>

              {/* 右側：内容エリア */}
              <div className="flex-grow relative w-full">
                
                {/* 30分の補助線（点線） */}
                <div className="absolute top-1/2 left-0 w-full border-t border-dashed border-gray-100 pointer-events-none"></div>

                {booking && style ? (
                  <div 
                    className="absolute left-1 right-1 rounded-md border border-blue-200 bg-blue-50 overflow-hidden shadow-sm z-10 block"
                    style={{ 
                      top: style.top, 
                      height: style.height,
                      transition: 'all 0.3s'
                    }}
                  >
                    {/* タイトルなどは「開始ブロック」のときだけ表示 */}
                    {isStartBlock && (
                      <div className="p-1 leading-tight">
                         <div className="text-blue-700 font-bold text-xs mb-0.5 flex items-center gap-1">
                            {formatTime(booking.start_time)}〜{formatTime(booking.end_time)}
                          </div>
                        <div className="font-bold text-black text-sm truncate">
                          {booking.band_name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                           {booking.leader}
                        </div>
                         {/* 削除ボタン */}
                         <div className="absolute top-1 right-1">
                            <DeleteButton id={booking.id} />
                          </div>
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