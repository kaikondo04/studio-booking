'use client'

import { useState } from 'react'
import { supabase } from '../utils/supabase'

export default function BookingForm() {
  const [bandName, setBandName] = useState('')
  const [leader, setLeader] = useState('')
  const studio = 'スタジオ622'

  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)

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
    <form onSubmit={handleSubmit} className="mb-8 p-6 bg-white border border-gray-300 rounded-xl shadow-sm">
      <h2 className="text-2xl font-bold mb-6 text-black">📝 新規予約</h2>
      
      <div className="grid gap-6">
        <div>
          <label className="block font-bold mb-2 text-black">バンド名</label>
          <input 
            type="text" 
            value={bandName}
            onChange={(e) => setBandName(e.target.value)}
            className="w-full p-3 text-lg border-2 border-gray-300 rounded-lg text-black bg-white"
            placeholder="例：放課後ティータイム"
          />
        </div>

        <div>
          <label className="block font-bold mb-2 text-black">代表者</label>
          <input 
            type="text" 
            value={leader}
            onChange={(e) => setLeader(e.target.value)}
            className="w-full p-3 text-lg border-2 border-gray-300 rounded-lg text-black bg-white"
            placeholder="例：平沢"
          />
        </div>

        <div>
          <label className="block font-bold mb-2 text-black">スタジオ</label>
          <div className="w-full p-3 text-lg border-2 border-gray-300 rounded-lg bg-gray-100 text-black font-bold">
            {studio}
          </div>
        </div>

        <div>
          <label className="block font-bold mb-2 text-black">利用日</label>
          <input 
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-3 text-lg border-2 border-gray-300 rounded-lg bg-white text-black"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-bold mb-2 text-black">開始</label>
            <input 
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full p-3 text-lg border-2 border-gray-300 rounded-lg bg-white text-black text-center"
            />
          </div>
          <div>
            <label className="block font-bold mb-2 text-black">終了</label>
            <input 
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full p-3 text-lg border-2 border-gray-300 rounded-lg bg-white text-black text-center"
            />
          </div>
        </div>

        <button 
          type="submit" 
          className="mt-4 bg-blue-700 text-white font-bold text-xl py-4 px-4 rounded-xl hover:bg-blue-800 transition w-full shadow-md"
        >
          予約する
        </button>
      </div>
    </form>
  )
}