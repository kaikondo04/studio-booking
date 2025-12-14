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
  // 1. 今日から7日分の日付を作る
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return d
  })

  // 2. 現在選択されているタブ（0番目＝今日）
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selectedDate = dates[selectedIndex]

  // 3. 選択された日の予約だけを抜き出す
  const filteredBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.start_time)
    return (
      bookingDate.getFullYear() === selectedDate.getFullYear() &&
      bookingDate.getMonth() === selectedDate.getMonth() &&
      bookingDate.getDate() === selectedDate.getDate()
    )
  })

  // 日付の表示用フォーマット（例: 12/15(月)）
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      month: 'numeric',
      day: 'numeric',
      weekday: 'short',
    })
  }

  // YYYY/MM/DD 形式（DailyScheduleに渡す用）
  const dateString = selectedDate.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })

  return (
    <div>
      {/* タブボタンのエリア（横スクロール可能） */}
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

      {/* 選択された日の時間割を表示 */}
      <div className="animate-in fade-in duration-300">
        <DailySchedule 
          date={dateString} 
          bookings={filteredBookings} 
        />
      </div>
    </div>
  )
}