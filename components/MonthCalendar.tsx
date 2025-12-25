'use client'

import { useState } from 'react'
import DailySchedule from './DailySchedule'

type Booking = {
  id: number
  band_name: string
  studio: string
  start_time: string
  end_time: string
  leader: string
}

export default function MonthCalendar({ bookings }: { bookings: Booking[] }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  // 特別なキーワード（この文字が入っていたら赤くなる）
  const specialKeywords = ['NG', 'ライブ', 'LIVE', 'メンテ', 'メンテナンス']

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const days = []
  for (let i = 0; i < firstDay.getDay(); i++) {
    days.push(null)
  }
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i))
  }

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  // ★ その日の「告知イベント」の名前を取得する
  const getEventLabel = (date: Date) => {
    const event = bookings.find(booking => {
      const bDate = new Date(booking.start_time)
      return (
        bDate.getFullYear() === date.getFullYear() &&
        bDate.getMonth() === date.getMonth() &&
        bDate.getDate() === date.getDate() &&
        // 00:00開始のものは「告知」とみなす
        bDate.getHours() === 0 && bDate.getMinutes() === 0
      )
    })
    return event ? event.band_name : null
  }

  // ★ 予約の状態（通常か、特別か）を判定
  const getBookingStatus = (date: Date) => {
    const daysBookings = bookings.filter(booking => {
      const bDate = new Date(booking.start_time)
      // 00:00開始（告知）は点の判定から除外
      if (bDate.getHours() === 0 && bDate.getMinutes() === 0) return false

      return (
        bDate.getFullYear() === date.getFullYear() &&
        bDate.getMonth() === date.getMonth() &&
        bDate.getDate() === date.getDate()
      )
    })

    if (daysBookings.length === 0) return 'none'

    const hasSpecial = daysBookings.some(booking => 
      specialKeywords.some(keyword => booking.band_name.includes(keyword))
    )

    return hasSpecial ? 'special' : 'normal'
  }

  const filteredBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.start_time)
    return (
      bookingDate.getFullYear() === selectedDate.getFullYear() &&
      bookingDate.getMonth() === selectedDate.getMonth() &&
      bookingDate.getDate() === selectedDate.getDate()
    )
  })

  const dateString = selectedDate.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short'
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-4 bg-gray-100 p-4 rounded-xl">
        <button onClick={prevMonth} className="text-gray-600 font-bold p-2">◀</button>
        <h2 className="text-xl font-bold text-black">
          {year}年 {month + 1}月
        </h2>
        <button onClick={nextMonth} className="text-gray-600 font-bold p-2">▶</button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-8 text-center">
        {['日', '月', '火', '水', '木', '金', '土'].map((day, i) => (
          <div key={i} className={`text-xs font-bold ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'}`}>
            {day}
          </div>
        ))}

        {days.map((date, i) => {
          if (!date) return <div key={i}></div>

          const isSelected = 
            date.getFullYear() === selectedDate.getFullYear() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getDate() === selectedDate.getDate()
          
          const isToday = 
            date.toDateString() === new Date().toDateString()

          const status = getBookingStatus(date)
          const eventLabel = getEventLabel(date)

          return (
            <button
              key={i}
              onClick={() => setSelectedDate(date)}
              className={`
                h-14 rounded-lg flex flex-col items-center justify-start pt-1 relative transition overflow-hidden
                ${isSelected ? 'bg-black text-white shadow-lg scale-105 z-10' : 'bg-white text-black hover:bg-gray-100'}
                ${isToday && !isSelected ? 'border-2 border-blue-500' : ''}
              `}
            >
              <span className={`text-sm leading-none ${isSelected ? 'font-bold' : ''}`}>{date.getDate()}</span>
              
              {/* イベント名があれば文字を表示、なければ点を表示 */}
              {eventLabel ? (
                <span className={`mt-1 text-[10px] w-full px-0.5 truncate font-bold ${isSelected ? 'text-yellow-300' : 'text-purple-600'}`}>
                  {eventLabel}
                </span>
              ) : (
                <>
                  {status === 'normal' && (
                    <span className={`w-1.5 h-1.5 rounded-full mt-2 ${isSelected ? 'bg-white' : 'bg-blue-500'}`}></span>
                  )}
                  {status === 'special' && (
                    <span className={`w-2 h-2 rounded-full mt-2 ${isSelected ? 'bg-red-400' : 'bg-red-500'}`}></span>
                  )}
                </>
              )}
            </button>
          )
        })}
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        <DailySchedule 
          date={dateString} 
          bookings={filteredBookings} 
        />
      </div>
    </div>
  )
}