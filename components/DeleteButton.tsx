'use client'

import { supabase } from '../utils/supabase'

export default function DeleteButton({ id }: { id: number }) {
  const handleDelete = async () => {
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
      // window.location.reload() ← 削除しました
    }
  }

  return (
    <button 
      onClick={handleDelete}
      className="text-red-600 text-base font-bold hover:text-red-800 underline bg-white px-2 py-1 rounded border border-red-200"
    >
      取り消し
    </button>
  )
}