'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import { formatCurrency, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

interface SalesData {
    date: string
    total: number
    count: number
}

export default function SalesReportPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [salesData, setSalesData] = useState<SalesData[]>([])
    const [summary, setSummary] = useState({
        today: 0,
        week: 0,
        month: 0,
        totalTransactions: 0,
    })
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        status: 'ALL'
    })

    useEffect(() => {
        fetchSalesReport()
    }, [])

    const fetchSalesReport = async () => {
        try {
            const params = new URLSearchParams()
            if (filters.startDate) params.append('startDate', filters.startDate)
            if (filters.endDate) params.append('endDate', filters.endDate)
            if (filters.status !== 'ALL') params.append('status', filters.status)

            const response = await fetch(`/api/admin/reports/sales?${params.toString()}`)
            if (response.ok) {
                const data = await response.json()
                setSalesData(data.daily || [])
                setSummary(data.summary || {})
            }
        } catch (error) {
            console.error('Error:', error)
            toast.error('Gagal memuat laporan')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.back()}>
                    <Icons.Close className="w-5 h-5" />
                </Button>
                <div>
                    <h2 className="text-3xl font-bold text-gradient">Laporan Penjualan</h2>
                    <p className="text-muted-foreground mt-1">Analisis penjualan periode tertentu</p>
                </div>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <div className="grid gap-4 md:grid-cols-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Tanggal Mulai</label>
                            <input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Tanggal Akhir</label>
                            <input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                                className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Status</label>
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                            >
                                <option value="ALL">Semua Status</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="PENDING">Pending</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>
                        <div className="flex items-end gap-2">
                            <Button onClick={fetchSalesReport} className="flex-1">
                                <Icons.Check className="w-4 h-4 mr-2" />
                                Terapkan
                            </Button>
                            <Button
                                onClick={() => {
                                    setFilters({ startDate: '', endDate: '', status: 'ALL' })
                                    setTimeout(fetchSalesReport, 100)
                                }}
                                variant="outline"
                            >
                                Reset
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <div className="text-sm font-medium text-muted-foreground">Hari Ini</div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">
                            {formatCurrency(summary.today)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <div className="text-sm font-medium text-muted-foreground">Minggu Ini</div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {formatCurrency(summary.week)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <div className="text-sm font-medium text-muted-foreground">Bulan Ini</div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">
                            {formatCurrency(summary.month)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <div className="text-sm font-medium text-muted-foreground">Total Transaksi</div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {summary.totalTransactions}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Penjualan Harian (7 Hari Terakhir)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {salesData.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Belum ada data penjualan
                            </div>
                        ) : (
                            salesData.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="font-medium">{formatDate(new Date(item.date))}</div>
                                        <div className="text-sm text-muted-foreground">{item.count} transaksi</div>
                                    </div>
                                    <div className="text-lg font-bold text-primary">
                                        {formatCurrency(item.total)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
