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

  const getEventLabels = (date: Date) => {
    return bookings.filter(b => {
      const d = new Date(b.start_time)
      return d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth() && d.getDate() === date.getDate() && d.getHours() === 0
    }).map(e => e.band_name)
  }

  const getBookingStatus = (date: Date) => {
    const daysBookings = bookings.filter(b => {
      const d = new Date(b.start_time)
      if (d.getHours() === 0) return false
      return d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth() && d.getDate() === date.getDate()
    })
    if (daysBookings.length === 0) return 'none'
    const hasSpecial = daysBookings.some(b => specialKeywords.some(k => b.band_name.includes(k)))
    return hasSpecial ? 'special' : 'normal'
  }

  const filteredBookings = bookings.filter(b => {
    const d = new Date(b.start_time)
    return d.getFullYear() === selectedDate.getFullYear() && d.getMonth() === selectedDate.getMonth() && d.getDate() === selectedDate.getDate()
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-4 bg-gray-100 p-4 rounded-xl">
        <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="text-gray-600 font-bold p-2">◀</button>
        <h2 className="text-xl font-bold text-black">{year}年 {month + 1}月</h2>
        <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="text-gray-600 font-bold p-2">▶</button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-8 text-center">
        {['日', '月', '火', '水', '木', '金', '土'].map((d, i) => <div key={i} className={`text-xs font-bold ${i===0?'text-red-500':i===6?'text-blue-500':'text-gray-500'}`}>{d}</div>)}
        {days.map((date, i) => {
          if (!date) return <div key={i}></div>
          const isSelected = date.toDateString() === selectedDate.toDateString()
          const isToday = date.toDateString() === new Date().toDateString()
          const status = getBookingStatus(date)
          const labels = getEventLabels(date)

          return (
            <button key={i} onClick={() => setSelectedDate(date)} className={`h-16 rounded-lg flex flex-col items-center justify-start pt-1 relative transition overflow-hidden ${isSelected ? 'bg-black text-white shadow-lg scale-105 z-10' : 'bg-white text-black hover:bg-gray-100'} ${isToday && !isSelected ? 'border-2 border-blue-500' : ''}`}>
              <span className={`text-sm leading-none ${isSelected ? 'font-bold' : ''}`}>{date.getDate()}</span>
              {labels.length > 0 ? (
                <div className="flex flex-col w-full px-0.5 mt-0.5 gap-0.5">
                  {labels.map((l, idx) => <span key={idx} className={`text-[9px] leading-tight truncate font-bold rounded px-0.5 ${isSelected ? 'text-yellow-300' : 'bg-purple-100 text-purple-700'}`}>{l}</span>)}
                </div>
              ) : (
                <>
                  {status === 'normal' && <span className={`w-1.5 h-1.5 rounded-full mt-2 ${isSelected ? 'bg-white' : 'bg-blue-500'}`}></span>}
                  {status === 'special' && <span className={`w-2 h-2 rounded-full mt-2 ${isSelected ? 'bg-red-400' : 'bg-red-500'}`}></span>}
                </>
              )}
            </button>
          )
        })}
      </div>
      <DailySchedule date={selectedDate.toLocaleDateString('ja-JP', {year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short'})} bookings={filteredBookings} />
    </div>
  )
}