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
  const [currentDate, setCurrentDate] = useState(new Date()) // カレンダーの表示月
  const [selectedDate, setSelectedDate] = useState(new Date()) // 選択中の日付

  // 月の初日と末日を取得
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  // カレンダーの日付リストを作成
  const days = []
  // 月の初めの空白（曜日合わせ）
  for (let i = 0; i < firstDay.getDay(); i++) {
    days.push(null)
  }
  // 日付を入れる
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i))
  }

  // 前の月へ
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  // 次の月へ
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  // その日に予約があるかチェックする関数
  const hasBooking = (date: Date) => {
    return bookings.some(booking => {
      const bDate = new Date(booking.start_time)
      return (
        bDate.getFullYear() === date.getFullYear() &&
        bDate.getMonth() === date.getMonth() &&
        bDate.getDate() === date.getDate()
      )
    })
  }

  // 選択された日の予約だけをフィルターしてDailyScheduleに渡す
  const filteredBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.start_time)
    return (
      bookingDate.getFullYear() === selectedDate.getFullYear() &&
      bookingDate.getMonth() === selectedDate.getMonth() &&
      bookingDate.getDate() === selectedDate.getDate()
    )
  })

  // YYYY/MM/DD 文字列作成
  const dateString = selectedDate.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short'
  })

  return (
    <div>
      {/* カレンダーヘッダー（月切り替え） */}
      <div className="flex justify-between items-center mb-4 bg-gray-100 p-4 rounded-xl">
        <button onClick={prevMonth} className="text-gray-600 font-bold p-2">◀</button>
        <h2 className="text-xl font-bold text-black">
          {year}年 {month + 1}月
        </h2>
        <button onClick={nextMonth} className="text-gray-600 font-bold p-2">▶</button>
      </div>

      {/* カレンダー本体 */}
      <div className="grid grid-cols-7 gap-1 mb-8 text-center">
        {['日', '月', '火', '水', '木', '金', '土'].map((day, i) => (
          <div key={i} className={`text-xs font-bold ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'}`}>
            {day}
          </div>
        ))}

        {days.map((date, i) => {
          if (!date) return <div key={i}></div>

          // 今選択されている日かどうか
          const isSelected = 
            date.getFullYear() === selectedDate.getFullYear() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getDate() === selectedDate.getDate()
          
          // 今日かどうか
          const isToday = 
            date.toDateString() === new Date().toDateString()

          // 予約があるかどうか
          const isBusy = hasBooking(date)

          return (
            <button
              key={i}
              onClick={() => setSelectedDate(date)}
              className={`
                h-12 rounded-lg flex flex-col items-center justify-center relative transition
                ${isSelected ? 'bg-black text-white shadow-lg scale-105' : 'bg-white text-black hover:bg-gray-100'}
                ${isToday && !isSelected ? 'border-2 border-blue-500' : ''}
              `}
            >
              <span className={`text-sm ${isSelected ? 'font-bold' : ''}`}>{date.getDate()}</span>
              
              {/* 予約がある日は青い点を表示 */}
              {isBusy && (
                <span className={`w-1.5 h-1.5 rounded-full mt-1 ${isSelected ? 'bg-white' : 'bg-blue-500'}`}></span>
              )}
            </button>
          )
        })}
      </div>

      {/* ここに選択した日のタイムラインが表示される */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        <DailySchedule 
          date={dateString} 
          bookings={filteredBookings} 
        />
      </div>
    </div>
  )
}