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

  const getDayBookings = (date: Date) => {
    return bookings.filter(booking => {
      const bDate = new Date(booking.start_time)
      return (
        bDate.getFullYear() === date.getFullYear() &&
        bDate.getMonth() === date.getMonth() &&
        bDate.getDate() === date.getDate()
      )
    })
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
    // 全体を白背景に変更
    <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-200 font-sans">
      
      {/* ヘッダー（白背景） */}
      <div className="flex justify-between items-center p-4 bg-gray-50 border-b border-gray-200">
        <button onClick={prevMonth} className="text-blue-500 font-bold p-2 text-xl">◀</button>
        <h2 className="text-lg font-bold text-gray-900">
          {year}年 {month + 1}月
        </h2>
        <button onClick={nextMonth} className="text-blue-500 font-bold p-2 text-xl">▶</button>
      </div>

      {/* 曜日（白背景） */}
      <div className="grid grid-cols-7 text-center bg-white py-2 border-b border-gray-200">
        {['日', '月', '火', '水', '木', '金', '土'].map((day, i) => (
          <div key={i} className={`text-xs font-bold ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'}`}>
            {day}
          </div>
        ))}
      </div>

      {/* カレンダー本体（白背景） */}
      <div className="grid grid-cols-7 bg-gray-200 gap-[1px] border-b border-gray-200">
        {days.map((date, i) => {
          // 空白マス
          if (!date) return <div key={i} className="bg-gray-50 min-h-[100px]"></div>

          const isSelected = 
            date.getFullYear() === selectedDate.getFullYear() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getDate() === selectedDate.getDate()
          
          const isToday = 
            date.toDateString() === new Date().toDateString()

          const dayBookings = getDayBookings(date)

          return (
            <button
              key={i}
              onClick={() => setSelectedDate(date)}
              className={`
                min-h-[100px] flex flex-col items-start justify-start p-1 relative transition text-left
                ${isSelected ? 'bg-blue-50' : 'bg-white'} // 選択時は薄い青、通常は白
                active:bg-gray-100
              `}
            >
              {/* 日付 */}
              <div className="w-full text-left mb-1">
                <span className={`
                  text-sm font-bold inline-block w-7 h-7 leading-7 text-center rounded-full
                  ${isToday ? 'bg-red-500 text-white' : 'text-gray-700'} // 今日は赤丸、他はグレー文字
                  ${isSelected && !isToday ? 'bg-blue-500 text-white' : ''} // 選択日は青丸
                `}>
                  {date.getDate()}
                </span>
              </div>
              
              {/* バンド名のバー（TimeTree風デザイン） */}
              <div className="w-full flex flex-col gap-1">
                {dayBookings.map((booking) => {
                  const isSpecial = specialKeywords.some(k => booking.band_name.includes(k));
                  // 白背景に映える色味に変更
                  const barColor = isSpecial ? 'bg-red-500' : 'bg-green-500'; 

                  const displayName = booking.band_name.replace('(LIVE)', '').replace('(NG)', '').trim();

                  return (
                    <div 
                      key={booking.id}
                      className={`
                        ${barColor} text-white
                        text-xs font-bold          // 文字サイズxs、太字
                        px-2 py-0.5                // 上下の余白
                        rounded-md                 // 角丸
                        w-full text-left truncate  // 横幅いっぱい、省略表示
                        shadow-sm
                      `}
                    >
                      {displayName}
                    </div>
                  )
                })}
              </div>
            </button>
          )
        })}
      </div>

      {/* 下部の詳細表示（ここは既存のまま白背景でOK） */}
      <div className="p-4 bg-white text-gray-900 min-h-[300px]">
        <h3 className="font-bold mb-3 text-lg border-b pb-2 border-gray-200">
          {dateString} の予定
        </h3>
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <DailySchedule 
            date={dateString} 
            bookings={filteredBookings} 
          />
        </div>
      </div>
    </div>
  )
}