'use client'

import { useState } from 'react'
import { supabase } from '../utils/supabase'
import { useRouter } from 'next/navigation'

export default function BookingForm() {
  const router = useRouter()

  const [bandName, setBandName] = useState('')
  const [leader, setLeader] = useState('')
  const [type, setType] = useState('normal') // normal, personal, live, ng
  const [isAllDay, setIsAllDay] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const studio = 'スタジオ622'
  
  // ★ 日本時間で確実に YYYY-MM-DD を作る魔法の関数を追加！
  const getLocalDateString = (d: Date) => {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  // 今日の日付（日本時間）
  const todayObj = new Date()
  const today = getLocalDateString(todayObj)
  const [date, setDate] = useState(today)

  // 明日の日付（日本時間）
  const tomorrowObj = new Date()
  tomorrowObj.setDate(todayObj.getDate() + 1)
  const tomorrow = getLocalDateString(tomorrowObj)

  const [startTime, setStartTime] = useState('10:00')
  const [endTime, setEndTime] = useState('12:00')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return 
    setIsSubmitting(true)

    try {
      if (type === 'personal') {
        if (!leader) {
          alert('名前を入力してください！')
          return
        }
        if (date > tomorrow) {
          alert('⚠️ エラー：個人練習は「前日」または「当日」のみ予約可能です！')
          return
        }
      } else {
        if (!bandName || !leader) {
          alert('名称と代表者名は必須です！')
          return
        }
      }

      let finalStartTime = startTime
      let finalEndTime = endTime

      if (type === 'event') {
        finalStartTime = '00:00'
        finalEndTime = '00:01'
      } else if (isAllDay) {
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

      if (startDate < now && type !== 'event') {
        alert('過去の日時は予約できません！')
        return
      }

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

      // バンド名の自動設定（個人練の場合はバンド名を自動入力！）
      let finalBandName = bandName
      if (type === 'personal') finalBandName = '個人練' 
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
            end_time: endDateTime,
            
            // ★ここが超重要！Supabaseに「予約の種類（ステートの値）」も一緒に保存する！
            type: type 
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
        router.refresh() 
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // ーーー 以下は見た目の部分（変更なし） ーーー
  const handleDeleteOldData = async () => {
    const threeYearsAgo = new Date()
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3)
    const targetDate = threeYearsAgo.toISOString()

    if (!window.confirm('⚠️ 本当に3年以上前の古いデータをすべて削除しますか？\n（この操作は取り消せません）')) {
      return
    }

    const { error } = await supabase
      .from('bookings')
      .delete()
      .lt('start_time', targetDate)

    if (error) {
      alert('エラーが発生しました: ' + error.message)
    } else {
      alert('🧹 3年以上前のデータの削除が完了しました！')
      window.location.reload()
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="mb-8 p-6 bg-white border border-gray-300 rounded-xl shadow-sm">
        <h2 className="text-2xl font-bold mb-6 text-black">📝 新規予約 / 告知</h2>
        
        <div className="grid gap-6">
          
          <div>
            <label className="block font-bold mb-2 text-black">登録の種類</label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button type="button" onClick={() => { setType('normal'); setIsAllDay(false); }} className={`py-3 px-2 rounded-lg font-bold text-sm transition border-2 ${type === 'normal' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>通常練習</button>
              <button type="button" onClick={() => { setType('personal'); setIsAllDay(false); if (date > tomorrow) setDate(today); }} className={`py-3 px-2 rounded-lg font-bold text-sm transition border-2 ${type === 'personal' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>個人練習 (緑)</button>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button type="button" onClick={() => { setType('event'); setIsAllDay(false); }} className={`py-3 px-2 rounded-lg font-bold text-sm transition border-2 ${type === 'event' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>告知のみ(枠なし)</button>
              <button type="button" onClick={() => setType('live')} className={`py-3 px-2 rounded-lg font-bold text-sm transition border-2 ${type === 'live' ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>ライブ(赤)</button>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <button type="button" onClick={() => setType('ng')} className={`py-3 px-2 rounded-lg font-bold text-sm transition border-2 ${type === 'ng' ? 'bg-gray-600 text-white border-gray-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>使用不可</button>
            </div>
          </div>

          {type !== 'personal' && (
            <div>
              <label className="block font-bold mb-2 text-black">{type === 'normal' ? 'バンド名' : 'イベント名・内容'}</label>
              <input type="text" value={bandName} onChange={(e) => setBandName(e.target.value)} className="w-full p-3 text-lg border-2 border-gray-300 rounded-lg text-black bg-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder={type === 'normal' ? '例：放課後ティータイム' : '例：クリスマスライブ'} />
            </div>
          )}

          <div>
            <label className="block font-bold mb-2 text-black">{type === 'personal' ? '名前（個人練に入る人）' : type === 'normal' ? '代表者' : '登録者'}</label>
            <input type="text" value={leader} onChange={(e) => setLeader(e.target.value)} className="w-full p-3 text-lg border-2 border-gray-300 rounded-lg text-black bg-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder={type === 'personal' ? '例：平沢' : '例：平沢'} />
          </div>

          <div>
            <label className="block font-bold mb-2 text-black">対象日</label>
            <input type="date" value={date} min={today} max={type === 'personal' ? tomorrow : undefined} onChange={(e) => setDate(e.target.value)} className="w-full p-3 text-lg border-2 border-gray-300 rounded-lg bg-white text-black focus:ring-2 focus:ring-blue-500 outline-none" />
            {type === 'personal' && <p className="text-sm text-green-600 mt-2 font-bold">※ 個人練習は「明日」まで予約可能です。</p>}
          </div>

          {type !== 'event' && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 animate-in fade-in zoom-in duration-300">
              {(type === 'live' || type === 'ng') && (
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input type="checkbox" checked={isAllDay} onChange={(e) => setIsAllDay(e.target.checked)} className="w-6 h-6 text-blue-600 rounded focus:ring-blue-500 border-gray-300" />
                    <span className="font-bold text-lg text-black">終日貸切 (8:00〜22:00)</span>
                  </label>
                </div>
              )}
              <div className={`grid grid-cols-2 gap-4 transition-opacity ${isAllDay ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                <div>
                  <label className="block font-bold mb-2 text-black">開始</label>
                  <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full p-3 text-lg border-2 border-gray-300 rounded-lg bg-white text-black text-center focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block font-bold mb-2 text-black">終了</label>
                  <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full p-3 text-lg border-2 border-gray-300 rounded-lg bg-white text-black text-center focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
            </div>
          )}

          {type === 'event' && (
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 text-purple-800 text-sm">
              💡 <strong>カレンダーに文字を表示します。</strong><br/>予約枠（時間）は確保しないので、練習の予約は誰でも入れられる状態になります。
            </div>
          )}

          <button type="submit" disabled={isSubmitting} className={`mt-4 text-white font-bold text-xl py-4 px-4 rounded-xl transition w-full shadow-md ${isSubmitting ? 'bg-gray-400 opacity-50 cursor-not-allowed' : type === 'personal' ? 'bg-green-600 hover:bg-green-700' : type === 'event' ? 'bg-purple-600 hover:bg-purple-700' : type === 'normal' ? 'bg-blue-700 hover:bg-blue-800' : type === 'live' ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-800'}`}>
            {isSubmitting ? '登録中...' : type === 'event' ? '告知を登録する' : isAllDay ? '終日で登録する' : '予約する'}
          </button>
        </div>
      </form>

      <div className="mt-8 mb-12 text-center">
        <button type="button" onClick={handleDeleteOldData} className="text-xs font-bold text-gray-400 hover:text-red-500 underline transition">
          [管理者用] 3年以上前の過去データを一括削除
        </button>
      </div>
    </>
  )
}