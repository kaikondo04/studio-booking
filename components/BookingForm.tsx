'use client'

import { useState } from 'react'
import { supabase } from '../utils/supabase'

export default function BookingForm() {
  const [bandName, setBandName] = useState('')
  const [leader, setLeader] = useState('')
  const studio = 'スタジオ622'

  // 今日の日付 (YYYY-MM-DD形式)
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)

  // 時間の初期値
  const [startTime, setStartTime] = useState('10:00')
  const [endTime, setEndTime] = useState('12:00')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!bandName || !leader) {
      alert('バンド名と代表者名は必須です！')
      return
    }

    if (startTime >= endTime) {
      alert('終了時間は開始時間より後にしてください！')
      return
    }

    // 日付と時間を合体させて、データベース用の形式にする
    const startDateTime = new Date(`${date}T${startTime}`).toISOString()
    const endDateTime = new Date(`${date}T${endTime}`).toISOString()

    const { error } = await supabase
      .from('bookings')
      .insert([
        { 
          band_name: bandName, 
          leader: leader,
          studio: studio,
          start_time: startDateTime,
          end_time: endDateTime
        }
      ])

    if (error) {
      alert('エラーが発生しました: ' + error.message)
    } else {
      alert('予約しました！')
      window.location.reload()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8 p-6 bg-gray-50 border rounded-lg shadow-sm text-black">
      <h2 className="text-xl font-bold mb-4">📝 新規予約</h2>
      
      <div className="grid gap-4">
        <div>
          <label className="block text-sm font-bold mb-1">バンド名</label>
          <input 
            type="text" 
            value={bandName}
            onChange={(e) => setBandName(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="例：放課後ティータイム"
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">代表者</label>
          <input 
            type="text" 
            value={leader}
            onChange={(e) => setLeader(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="例：平沢"
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">スタジオ</label>
          <div className="w-full p-2 border rounded bg-gray-200 text-gray-700">
            {studio}
          </div>
        </div>

        {/* 日付を選ぶところ */}
        <div>
          <label className="block text-sm font-bold mb-1">利用日</label>
          <input 
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* 時間を選ぶところ（横並び） */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-1">開始時間</label>
            <input 
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">終了時間</label>
            <input 
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <button 
          type="submit" 
          className="mt-4 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition w-full shadow-md"
        >
          予約する
        </button>
      </div>
    </form>
  )
}