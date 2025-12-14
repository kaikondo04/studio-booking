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

  // その時間帯における「開始位置(%)」と「高さ(%)」を計算する関数
  const getBookingStyle = (hour: number, booking: Booking) => {
    const start = new Date(booking.start_time)
    const end = new Date(booking.end_time)
    
    // この時間の開始（例: 13:00）と終了（例: 14:00）
    const hourStart = new Date(start)
    hourStart.setHours(hour, 0, 0, 0)
    const hourEnd = new Date(start)
    hourEnd.setHours(hour + 1, 0, 0, 0)

    // この枠の中で、予約が「どこから(visualStart)」始まって「どこまで(visualEnd)」あるか計算
    
    // 予約の開始がこの枠より前なら、枠の頭(0分)から。そうでなければ実際の開始分
    const visualStart = start < hourStart ? hourStart : start
    
    // 予約の終了がこの枠より後なら、枠のお尻(60分)まで。そうでなければ実際の終了分
    const visualEnd = end > hourEnd ? hourEnd : end

    // 分に直す
    const startMin = visualStart.getMinutes()
    // 終了が「XX:00」の場合は60分として扱うための計算
    let endMin = visualEnd.getMinutes()
    if (endMin === 0 && visualEnd > visualStart) endMin = 60

    // 高さの計算（終了分 - 開始分）
    const durationMin = endMin - startMin

    return {
      top: `${(startMin / 60) * 100}%`,
      height: `${(durationMin / 60) * 100}%`
    }
  }

  const getBookingAt = (hour: number) => {
    return bookings.find(b => {
      const start = new Date(b.start_time).getHours()
      const end = new Date(b.end_time).getHours()
      const endMinutes = new Date(b.end_time).getMinutes()
      
      // 終了ピッタリの時間(14:00など)は含まないが、14:01終了なら14時台も含む
      const actualEndHour = endMinutes === 0 ? end : end + 1
      
      // この時間が予約期間に含まれているか
      // (開始時間以上 かつ 終了時間未満)
      if (hour >= start && hour < end) return true
      
      // 分またぎの処理（例: 14:30終了の場合、14時の枠も対象にする）
      if (hour === end && endMinutes > 0) return true
      
      return false
    })
  }

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // バンド名を表示するかどうか（その時間枠の先頭から始まっているか、または前の時間が空いているか）
  const shouldShowTitle = (hour: number, booking: Booking) => {
    const startHour = new Date(booking.start_time).getHours()
    return hour === startHour
  }

  return (
    <div className="mb-10 border rounded-xl overflow-hidden shadow-sm bg-white">
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
            <div key={hour} className="flex bg-white h-24 relative"> {/* h-24で少し高さを確保 */}
              
              {/* 左側：時刻 */}
              <div className="w-16 flex-shrink-0 border-r border-gray-100 text-gray-400 font-mono text-xs flex flex-col justify-between py-2 items-center bg-gray-50">
                <span>{hour.toString().padStart(2, '0')}:00</span>
                <span>{hour.toString().padStart(2, '0')}:30</span>
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
                    {/* タイトル表示（開始ブロックのときだけ表示、または十分な高さがある時） */}
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