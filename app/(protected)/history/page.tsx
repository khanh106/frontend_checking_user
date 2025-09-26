import { Suspense } from 'react'
import { HistoryClient } from './HistoryClient'
import { getAttendanceHistory } from '@/lib/api/history'
import { HistoryParams } from '@/types'

interface HistoryPageProps {
  searchParams: Promise<{
    page?: string
    limit?: string
    dateFrom?: string
    dateTo?: string
    status?: string
    location?: string
    search?: string
    sort?: string
    order?: string
  }>
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const params = await searchParams
  
  const historyParams: HistoryParams = {
    page: 1,
    limit: 1000, // Lấy một lượng lớn bản ghi để lọc phía client
    sortBy: 'date',
    sortOrder: 'desc'
  }

  const historyData = await getAttendanceHistory(historyParams)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lịch sử chấm công</h1>
        <p className="text-muted-foreground">
          Xem và quản lý lịch sử chấm công của bạn
        </p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <HistoryClient
          initialData={historyData}
          searchParams={params}
        />
      </Suspense>
    </div>
  )
}
