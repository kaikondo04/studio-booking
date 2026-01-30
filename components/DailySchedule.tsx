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

  // ★ 告知イベント（00:00）を全て取得
  const eventBookings = bookings.filter(b => {
    const start = new Date(b.start_time)
    return start.getHours() === 0 && start.getMinutes() === 0
  })

  const specialKeywords = ['NG', 'ライブ', 'LIVE', 'メンテ', 'メンテナンス']
  const isSpecialBooking = (name: string) => {
    return specialKeywords.some(keyword => name.includes(keyword))
  }

  const getBookingStyle = (hour: number, booking: Booking) => {
    const start = new Date(booking.start_time)
    const end = new Date(booking.end_time)
    
    const hourStart = new Date(start)
    hourStart.setHours(hour, 0, 0, 0)
    const hourEnd = new Date(start)
    hourEnd.setHours(hour + 1, 0, 0, 0)

    const visualStart = start < hourStart ? hourStart : start
    const visualEnd = end > hourEnd ? hourEnd : end

    const startMin = visualStart.getMinutes()
    let endMin = visualEnd.getMinutes()
    if (endMin === 0 && visualEnd > visualStart) endMin = 60

    const durationMin = endMin - startMin

    return {
      top: `${(startMin / 60) * 100}%`,
      height: `${(durationMin / 60) * 100}%`
    }
  }

  const getBookingAt = (hour: number) => {
    return bookings.find(b => {
      const start = new Date(b.start_time)
      const end = new Date(b.end_time)
      
      // 告知はバーとして表示しない
      if (start.getHours() === 0 && start.getMinutes() === 0) return false

      const startH = start.getHours()
      const endH = end.getHours()
      const endMinutes = end.getMinutes()
      
      if (hour >= startH && hour < endH) return true
      if (hour === endH && endMinutes > 0) return true
      return false
    })
  }

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="mb-10 border rounded-xl overflow-hidden shadow-sm bg-white">
      <div className="bg-gray-900 text-white p-3 font-bold text-lg text-center">
        {date}
      </div>

      {/* ★ 告知イベントをリスト表示 */}
      {eventBookings.length > 0 && (
        <div className="bg-purple-50 border-b border-purple-100">
          {eventBookings.map(event => (
            <div key={event.id} className="p-2 flex justify-between items-center border-b last:border-b-0 border-purple-200/50">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="bg-purple-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0">INFO</span>
                <span className="font-bold text-purple-900 text-sm truncate">{event.band_name}</span>
              </div>
              <div className="flex-shrink-0 ml-2">
                <DeleteButton id={event.id} />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="divide-y divide-gray-200">
        {hours.map((hour) => {
          const booking = getBookingAt(hour)
          const style = booking ? getBookingStyle(hour, booking) : null
          const isStartBlock = booking && new Date(booking.start_time).getHours() === hour
          const isSpecial = booking && isSpecialBooking(booking.band_name)

          return (
            <div key={hour} className="flex bg-white h-24 relative">
              <div className="w-16 flex-shrink-0 border-r border-gray-100 text-gray-400 font-mono text-xs flex flex-col items-center justify-start pt-2 bg-gray-50">
                <span>{hour.toString().padStart(2, '0')}:00</span>
              </div>
              <div className="flex-grow relative w-full">
                <div className="absolute top-1/2 left-0 w-full border-t border-dashed border-gray-100 pointer-events-none"></div>
                {booking && style ? (
                  <div 
                    className={`
                      absolute left-1 right-1 rounded-md border overflow-hidden shadow-sm z-10 block transition-all
                      ${isSpecial ? 'bg-red-100 border-red-400' : 'bg-blue-50 border-blue-200'}
                    `}
                    style={{ top: style.top, height: style.height }}
                  >
                    {isStartBlock && (
                      <div className="p-1 leading-tight">
                         <div className={`font-bold text-xs mb-0.5 flex items-center gap-1 ${isSpecial ? 'text-red-700' : 'text-blue-700'}`}>
                            {formatTime(booking.start_time)}〜{formatTime(booking.end_time)}
                          </div>
                        <div className="font-bold text-black text-sm truncate">
                          {isSpecial ? '⛔ ' : ''}{booking.band_name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">{booking.leader}</div>
                         <div className="absolute top-1 right-1"><DeleteButton id={booking.id} /></div>
                      </div>
                    )}
                  </div>
                ) : (
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