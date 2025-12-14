'use client'

import { supabase } from '../utils/supabase'

export default function DeleteButton({ id }: { id: number }) {
  const handleDelete = async () => {
    // 削除前の確認（これがないと間違って消しちゃうので！）
    const confirmed = window.confirm('本当にこの予約を取り消しますか？')
    if (!confirmed) return

    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id)

    if (error) {
      alert('エラー: ' + error.message)
    } else {
      alert('予約を取り消しました')
      window.location.reload() // 画面を更新
    }
  }

  return (
    <button 
      onClick={handleDelete}
      className="text-red-500 text-sm hover:text-red-700 underline"
    >
      取り消し
    </button>
  )
}