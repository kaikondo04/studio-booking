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

export default function ScheduleTabs({ bookings }: { bookings: Booking[] }) {
  // ★ここを変更: 7日分 → 8日分（来週の同じ曜日まで表示）
  const dates = Array.from({ length: 8 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return d
  })

  const [selectedIndex, setSelectedIndex] = useState(0)
  const selectedDate = dates[selectedIndex]

  const filteredBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.start_time)
    return (
      bookingDate.getFullYear() === selectedDate.getFullYear() &&
      bookingDate.getMonth() === selectedDate.getMonth() &&
      bookingDate.getDate() === selectedDate.getDate()
    )
  })

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      month: 'numeric',
      day: 'numeric',
      weekday: 'short',
    })
  }

  const dateString = selectedDate.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })

  return (
    <div>
      <div className="flex overflow-x-auto pb-4 mb-4 gap-2 no-scrollbar">
        {dates.map((date, index) => {
          const isSelected = index === selectedIndex
          return (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`
                flex-shrink-0 px-4 py-3 rounded-lg font-bold text-sm transition-all
                ${isSelected 
                  ? 'bg-blue-600 text-white shadow-md transform scale-105' 
                  : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                }
              `}
            >
              {formatDate(date)}
            </button>
          )
        })}
      </div>

      <div className="animate-in fade-in duration-300">
        <DailySchedule 
          date={dateString} 
          bookings={filteredBookings} 
        />
      </div>
    </div>
  )
}