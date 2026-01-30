'use client'

import { useState } from 'react'
import { supabase } from '../utils/supabase'

export default function BookingForm() {
  const [bandName, setBandName] = useState('')
  const [leader, setLeader] = useState('')
  // normal:通常, live:ライブ(赤), ng:不可(グレー), event:告知のみ(枠なし)
  const [type, setType] = useState('normal') 
  const [isAllDay, setIsAllDay] = useState(false)

  const studio = 'スタジオ622'
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)

  const [startTime, setStartTime] = useState('10:00')
  const [endTime, setEndTime] = useState('12:00')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!bandName || !leader) {
      alert('名称と代表者名は必須です！')
      return
    }

    let finalStartTime = startTime
    let finalEndTime = endTime

    // ★ 告知のみの場合は 00:00〜00:01 (1分間) にする
    if (type === 'event') {
      finalStartTime = '00:00'
      finalEndTime = '00:01'
    } else if (isAllDay) {
      // 終日設定
      finalStartTime = '08:00'
      finalEndTime = '22:00'
    } else {
       if (finalStartTime >= finalEndTime) {
        alert('終了時間は開始時間より後にしてください！')
        return
      }
    }

    const startDateTime = new Date(`${date}T${finalStartTime}`).toISOString()
    const endDateTime = new Date(`${date}T${finalEndTime}`).toISOString()
    const now = new Date()
    const startDate = new Date(startDateTime)

    // 過去チェック（告知以外）
    if (startDate < now && type !== 'event') {
      alert('過去の日時は予約できません！')
      return
    }

    // 重複チェック（告知のみの場合はチェックしない）
    if (type !== 'event') {
      const { data: conflicts } = await supabase
        .from('bookings')
        .select('*')
        .lt('start_time', endDateTime)
        .gt('end_time', startDateTime)

      if (conflicts && conflicts.length > 0) {
        alert('⚠️ エラー：その時間は既に予約が入っています！')
        return
      }
    }

    // 名前を自動で加工
    let finalBandName = bandName
    if (type === 'live') finalBandName = bandName + ' (LIVE)'
    if (type === 'ng') finalBandName = bandName + ' (NG)'

    const { error } = await supabase
      .from('bookings')
      .insert([
        { 
          band_name: finalBandName, 
          leader: leader,
          studio: studio,
          start_time: startDateTime,
          end_time: endDateTime
        }
      ])

    if (error) {
      alert('エラーが発生しました: ' + error.message)
    } else {
      alert('登録しました！')
      setBandName('')
      setLeader('')
      setType('normal')
      setIsAllDay(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8 p-6 bg-white border border-gray-300 rounded-xl shadow-sm">
      <h2 className="text-2xl font-bold mb-6 text-black">📝 新規予約 / 告知</h2>
      
      <div className="grid gap-6">
        
        {/* 種類選択エリア */}
        <div>
          <label className="block font-bold mb-2 text-black">登録の種類</label>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <button
              type="button"
              onClick={() => { setType('normal'); setIsAllDay(false); }}
              className={`py-3 px-2 rounded-lg font-bold text-sm transition border-2 ${
                type === 'normal' 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              通常練習
            </button>
            <button
              type="button"
              onClick={() => { setType('event'); setIsAllDay(false); }}
              className={`py-3 px-2 rounded-lg font-bold text-sm transition border-2 ${
                type === 'event' 
                  ? 'bg-purple-600 text-white border-purple-600' 
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              告知のみ(枠なし)
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType('live')}
              className={`py-3 px-2 rounded-lg font-bold text-sm transition border-2 ${
                type === 'live' 
                  ? 'bg-red-500 text-white border-red-500' 
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              ライブ(赤)
            </button>
            <button
              type="button"
              onClick={() => setType('ng')}
              className={`py-3 px-2 rounded-lg font-bold text-sm transition border-2 ${
                type === 'ng' 
                  ? 'bg-gray-600 text-white border-gray-600' 
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              使用不可
            </button>
          </div>
        </div>

        <div>
          <label className="block font-bold mb-2 text-black">
            {type === 'normal' ? 'バンド名' : 'イベント名・内容'}
          </label>
          <input 
            type="text" 
            value={bandName}
            onChange={(e) => setBandName(e.target.value)}
            className="w-full p-3 text-lg border-2 border-gray-300 rounded-lg text-black bg-white"
            placeholder={type === 'normal' ? '例：放課後ティータイム' : '例：クリスマスライブ'}
          />
        </div>

        <div>
          <label className="block font-bold mb-2 text-black">
             {type === 'normal' ? '代表者' : '登録者'}
          </label>
          <input 
            type="text" 
            value={leader}
            onChange={(e) => setLeader(e.target.value)}
            className="w-full p-3 text-lg border-2 border-gray-300 rounded-lg text-black bg-white"
            placeholder="例：平沢"
          />
        </div>

        <div>
          <label className="block font-bold mb-2 text-black">対象日</label>
          <input 
            type="date"
            value={date}
            min={today}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-3 text-lg border-2 border-gray-300 rounded-lg bg-white text-black"
          />
        </div>

        {/* 時間選択エリア（告知のみの場合は隠す） */}
        {type !== 'event' && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 animate-in fade-in zoom-in duration-300">
            
            {(type === 'live' || type === 'ng') && (
              <div className="mb-4 pb-4 border-b border-gray-200">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isAllDay}
                    onChange={(e) => setIsAllDay(e.target.checked)}
                    className="w-6 h-6 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                  />
                  <span className="font-bold text-lg text-black">終日貸切 (8:00〜22:00)</span>
                </label>
              </div>
            )}

            <div className={`grid grid-cols-2 gap-4 transition-opacity ${isAllDay ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
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
          </div>
        )}

        {/* 告知のみのときの説明 */}
        {type === 'event' && (
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 text-purple-800 text-sm">
            💡 <strong>カレンダーに文字を表示します。</strong><br/>
            予約枠（時間）は確保しないので、練習の予約は誰でも入れられる状態になります。
          </div>
        )}

        <button 
          type="submit" 
          className={`mt-4 text-white font-bold text-xl py-4 px-4 rounded-xl transition w-full shadow-md ${
            type === 'event' ? 'bg-purple-600 hover:bg-purple-700' :
            type === 'normal' ? 'bg-blue-700 hover:bg-blue-800' : 
            type === 'live' ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-800'
          }`}
        >
          {type === 'event' ? '告知を登録する' : isAllDay ? '終日で登録する' : '予約する'}
        </button>
      </div>
    </form>
  )
}