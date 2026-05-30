'use client'

import DeleteButton from './DeleteButton'

// ★Bookingの型定義に 'type' (予約の種類) を追加！
type Booking = {
  id: number
  band_name: string
  start_time: string
  end_time: string
  leader: string
  type: string // ★ここにSupabaseから取得した 'type' (normal, personal, etc...) が入る
}

export default function DailySchedule({ date, bookings }: { date: string, bookings: Booking[] }) {
  const startHour = 8
  const endHour = 22
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i)

  // 告知イベント（00:00）を全て取得
  const eventBookings = bookings.filter(b => {
    const start = new Date(b.start_time)
    return start.getHours() === 0 && start.getMinutes() === 0
  })

  // 通常の予約（告知以外）を取得
  const normalBookings = bookings.filter(b => {
    const start = new Date(b.start_time)
    return !(start.getHours() === 0 && start.getMinutes() === 0)
  })

  const specialKeywords = ['NG', 'ライブ', 'LIVE', 'メンテ', 'メンテナンス']
  const isSpecialBooking = (name: string) => {
    return specialKeywords.some(keyword => name.includes(keyword))
  }

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="mb-10 border rounded-xl overflow-hidden shadow-sm bg-white">
      <div className="bg-gray-900 text-white p-3 font-bold text-lg text-center">
        {date}
      </div>

      {/* 告知イベントをリスト表示 */}
      {eventBookings.length > 0 && (
        <div className="bg-purple-50 border-b border-purple-100">
          {eventBookings.map(event => (
            <div key={event.id} className="p-2 flex justify-between items-center border-b last:border-b-0 border-purple-200/50">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="bg-purple-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0">INFO</span>
                <span className="font-bold text-purple-900 text-sm truncate">{event.band_name}</span>
              </div>
              <div className="flex-shrink-0 ml-2">
                <DeleteButton id={event.id} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* タイムライン全体（ここを基準に絶対配置する） */}
      <div className="relative">
        
        {/* ① 背景のグリッド線 */}
        <div className="divide-y divide-gray-200">
          {hours.map((hour) => (
            <div key={hour} className="flex bg-white h-24 relative z-0">
              <div className="w-16 flex-shrink-0 border-r border-gray-100 text-gray-400 font-mono text-xs flex flex-col items-center justify-start pt-2 bg-gray-50">
                <span>{hour.toString().padStart(2, '0')}:00</span>
              </div>
              <div className="flex-grow relative w-full pointer-events-none">
                {/* 30分の点線 */}
                <div className="absolute top-1/2 left-0 w-full border-t border-dashed border-gray-100"></div>
              </div>
            </div>
          ))}
        </div>

        {/* ② 予約ブロックをキャンバスの上に直接「シール」のように貼る！ */}
        <div className="absolute top-0 bottom-0 left-16 right-0">
          {normalBookings.map((booking) => {
            const start = new Date(booking.start_time)
            const end = new Date(booking.end_time)
            
            // 分単位に直して、8:00からの「ズレ」を計算する
            const startMins = start.getHours() * 60 + start.getMinutes()
            const endMins = end.getHours() * 60 + end.getMinutes()
            const timelineStartMins = startHour * 60

            // 万が一8:00前の予約があっても枠外に飛ばないように調整
            const visualStart = Math.max(startMins, timelineStartMins)
            const durationMins = endMins - visualStart

            // 1時間(60分) ＝ Tailwindの h-24（6rem）として計算
            const topRem = ((visualStart - timelineStartMins) / 60) * 6
            const heightRem = (durationMins / 60) * 6
            
            const isSpecial = isSpecialBooking(booking.band_name)

            // ★ ここが超重要！色分けの判断基準を変更する
            // 名前で判断するのをやめて、裏側に保存された 'type' (ボタンの種類) で判断する！
            const isPersonal = booking.type === 'personal'

            return (
              <div 
                key={booking.id}
                className={`
                  absolute left-1 right-1 rounded-md border overflow-hidden shadow-sm z-10 block transition-all
                  ${isSpecial ? 'bg-red-100 border-red-400' : isPersonal ? 'bg-green-50 border-green-300' : 'bg-blue-50 border-blue-200'}
                `}
                style={{ top: `${topRem}rem`, height: `${heightRem}rem` }}
              >
                <div className="p-1.5 h-full relative leading-tight overflow-hidden">
                  <div className={`font-bold text-xs mb-0.5 flex items-center gap-1 ${isSpecial ? 'text-red-700' : isPersonal ? 'text-green-700' : 'text-blue-700'}`}>
                    {formatTime(booking.start_time)}〜{formatTime(booking.end_time)}
                  </div>
                  <div className="font-bold text-black text-sm truncate pr-6">
                    {isSpecial ? '⛔ ' : ''}{booking.band_name}
                  </div>
                  <div className="text-xs text-gray-500 truncate pr-6">{booking.leader}</div>
                  
                  {/* ゴミ箱ボタンは右上に固定 */}
                  <div className="absolute top-1 right-1 bg-white/50 rounded z-20">
                    <DeleteButton id={booking.id} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}