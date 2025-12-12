'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/components/icons'
import { formatCurrency } from '@/lib/utils'

interface SalesData {
    chartData: Array<{ date: string; total: number }>
    monthTotal: number
    monthTransactions: number
}

export default function ManagerSalesReportsPage() {
    const [data, setData] = useState<SalesData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchSalesData()
    }, [])

    const fetchSalesData = async () => {
        try {
            const response = await fetch('/api/manager/sales')
            if (response.ok) {
                const salesData = await response.json()
                setData(salesData)
            }
        } catch (error) {
            console.error('Error:', error)
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

    const averageDaily = data ? Math.round(data.monthTotal / 30) : 0

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-3xl font-bold text-gradient">Laporan Penjualan</h2>
                <p className="text-muted-foreground mt-1">Analisis dan laporan penjualan</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Bulan Ini</CardTitle>
                        <Icons.Reports className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(data?.monthTotal || 0)}</div>
                        <p className="text-xs text-muted-foreground mt-1">{data?.monthTransactions || 0} transaksi</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Rata-rata/Hari</CardTitle>
                        <Icons.Reports className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(averageDaily)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Bulan ini</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">7 Hari Terakhir</CardTitle>
                        <Icons.Reports className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(
                                data?.chartData.reduce((sum, d) => sum + d.total, 0) || 0
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Minggu ini</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Penjualan Harian (7 Hari Terakhir)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {data && data.chartData.length > 0 ? (
                            data.chartData.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="text-sm font-medium">
                                        {new Date(item.date).toLocaleDateString('id-ID', {
                                            weekday: 'short',
                                            day: '2-digit',
                                            month: 'short'
                                        })}
                                    </div>
                                    <div className="text-lg font-bold text-primary">
                                        {formatCurrency(item.total)}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <p>Belum ada data penjualan</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
