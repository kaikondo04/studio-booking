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

  const specialKeywords = ['NG', 'ライブ', 'LIVE', 'メンテ', 'メンテナンス']

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const days = Array(firstDay.getDay()).fill(null).concat(
    Array.from({ length: lastDay.getDate() }, (_, i) => new Date(year, month, i + 1))
  )

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const getDayBookings = (date: Date) => {
    return bookings.filter(b => {
      const d = new Date(b.start_time)
      return (
        d.getFullYear() === date.getFullYear() && 
        d.getMonth() === date.getMonth() && 
        d.getDate() === date.getDate()
      )
    })
  }

  const filteredBookings = bookings.filter(b => {
    const d = new Date(b.start_time)
    return (
      d.getFullYear() === selectedDate.getFullYear() && 
      d.getMonth() === selectedDate.getMonth() && 
      d.getDate() === selectedDate.getDate()
    )
  })

  return (
    <div>
      {/* カレンダーヘッダー */}
      <div className="flex justify-between items-center mb-2 bg-gray-100 p-2 rounded-xl sticky top-0 z-20 shadow-sm">
        <button onClick={prevMonth} className="text-gray-600 font-bold p-2 px-4">◀</button>
        <h2 className="text-lg font-bold text-black">
          {year}年 {month + 1}月
        </h2>
        <button onClick={nextMonth} className="text-gray-600 font-bold p-2 px-4">▶</button>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 gap-px mb-1 text-center border-b pb-2">
        {['日', '月', '火', '水', '木', '金', '土'].map((d, i) => (
          <div key={i} className={`text-xs font-bold ${i===0?'text-red-500':i===6?'text-blue-500':'text-gray-400'}`}>
            {d}
          </div>
        ))}
      </div>

      {/* カレンダー本体 */}
      <div className="grid grid-cols-7 gap-1 mb-8">
        {days.map((date, i) => {
          if (!date) return <div key={i} className="min-h-[110px]"></div>

          const isSelected = date.toDateString() === selectedDate.toDateString()
          const isToday = date.toDateString() === new Date().toDateString()
          const dayBookings = getDayBookings(date)
          
          return (
            <button
              key={i}
              onClick={() => setSelectedDate(date)}
              // ★ ここを変更：高さを min-h-[110px] にして大きく確保
              className={`
                min-h-[110px] flex flex-col items-start justify-start p-1 relative transition overflow-hidden rounded-md border
                ${isSelected ? 'bg-white border-black ring-1 ring-black z-10' : 'bg-white border-gray-100 hover:bg-gray-50'}
                ${isToday && !isSelected ? 'ring-2 ring-blue-500 z-10' : ''}
              `}
            >
              {/* 日付 */}
              <span className={`text-xs mb-1 font-bold ${isSelected ? 'text-black' : isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                {date.getDate()}
              </span>

              {/* 予約リスト（最大5件まで表示） */}
              <div className="w-full flex flex-col gap-1">
                {dayBookings.slice(0, 5).map((booking) => {
                  const isEvent = new Date(booking.start_time).getHours() === 0
                  const isSpecial = specialKeywords.some(k => booking.band_name.includes(k))

                  let bgColor = 'bg-blue-100 text-blue-800'
                  if (isSpecial) bgColor = 'bg-red-100 text-red-800'
                  if (isEvent) bgColor = 'bg-purple-100 text-purple-800'

                  return (
                    // ★ ここを変更：文字サイズを text-[10px] にアップ、高さを確保
                    <span 
                      key={booking.id} 
                      className={`text-[10px] px-1 rounded-sm w-full text-left leading-tight py-0.5 font-bold whitespace-nowrap overflow-hidden text-ellipsis ${bgColor}`}
                    >
                      {booking.band_name}
                    </span>
                  )
                })}
                
                {/* 5件より多い場合 */}
                {dayBookings.length > 5 && (
                  <span className="text-[9px] text-gray-400 pl-1 font-bold">
                    +{dayBookings.length - 5}
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      <DailySchedule 
        date={selectedDate.toLocaleDateString('ja-JP', {year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short'})} 
        bookings={filteredBookings} 
      />
    </div>
  )
}