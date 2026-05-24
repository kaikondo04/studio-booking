'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function RefreshButton() {
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    router.refresh() // ★裏側で最新データを取ってくる！
    
    // くるくる回るアニメーションを1秒だけ見せるため
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }

  return (
    <button 
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="flex items-center gap-2 bg-white border border-gray-300 shadow-sm px-4 py-2 rounded-full text-sm font-bold text-gray-700 hover:bg-gray-50 transition active:scale-95"
    >
      <span className={isRefreshing ? "animate-spin" : ""}>🔄</span>
      {isRefreshing ? '更新中...' : '最新の情報に更新'}
    </button>
  )
}