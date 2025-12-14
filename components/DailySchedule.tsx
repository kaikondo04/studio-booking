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
  // ★ここを変更しました：8時から22時まで
  const startHour = 8
  const endHour = 22
  
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i)

  const getBookingAt = (hour: number) => {
    return bookings.find(b => {
      const start = new Date(b.start_time).getHours()
      const end = new Date(b.end_time).getHours()
      return hour >= start && hour < end
    })
  }

  const isStartOfBooking = (hour: number, booking: Booking) => {
    const start = new Date(booking.start_time).getHours()
    return hour === start
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

          return (
            <div key={hour} className={`flex ${isBusy ? 'bg-blue-50' : 'bg-white'}`}>
              
              <div className="w-16 flex-shrink-0 border-r border-gray-200 p-3 text-gray-500 font-mono text-sm flex items-center justify-center">
                {/* 桁数を揃える（8:00 → 08:00）と見栄えが良いので整形 */}
                {hour.toString().padStart(2, '0')}:00
              </div>

              <div className="flex-grow p-2 min-h-[50px] flex items-center">
                {isBusy ? (
                  <div className="w-full relative">
                    {isStartOfBooking(hour, booking) && (
                      <div>
                        <div className="font-bold text-black text-lg">
                          {booking.band_name}
                        </div>
                        <div className="text-xs text-gray-600">
                          代表: {booking.leader}
                        </div>
                        <div className="absolute top-0 right-0">
                          <DeleteButton id={booking.id} />
                        </div>
                      </div>
                    )}
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