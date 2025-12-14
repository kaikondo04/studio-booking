'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../utils/supabase'

export default function RealtimeListener() {
  const router = useRouter()

  useEffect(() => {
    // データベースの「bookings」テーブルをずっと監視する
    const channel = supabase
      .channel('realtime bookings')
      .on(
        'postgres_changes',
        {
          event: '*', // 追加、削除、変更すべてを検知
          schema: 'public',
          table: 'bookings',
        },
        () => {
          // 何か変更があったら、画面のデータを裏側で再取得して更新！
          router.refresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [router])

  return null // 画面には何も表示しません
}