'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/components/icons'
import { formatCurrency } from '@/lib/utils'

interface Stats {
    todaySales: number
    todayTransactions: number
    monthSales: number
    monthTransactions: number
    lowStockCount: number
    totalProducts: number
}

export default function ManagerDashboardPage() {
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/manager/stats')
            if (response.ok) {
                const data = await response.json()
                setStats(data)
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

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-3xl font-bold text-gradient">Dashboard Manager</h2>
                <p className="text-muted-foreground mt-1">Ringkasan performa inventori dan penjualan</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Penjualan Hari Ini</CardTitle>
                        <Icons.Reports className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats?.todaySales || 0)}</div>
                        <p className="text-xs text-muted-foreground">{stats?.todayTransactions || 0} transaksi</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Penjualan Bulan Ini</CardTitle>
                        <Icons.Reports className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats?.monthSales || 0)}</div>
                        <p className="text-xs text-muted-foreground">{stats?.monthTransactions || 0} transaksi</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Stok Rendah</CardTitle>
                        <Icons.Inventory className="w-4 h-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{stats?.lowStockCount || 0}</div>
                        <p className="text-xs text-muted-foreground">dari {stats?.totalProducts || 0} produk</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <a href="/manager/inventory" className="block p-3 border rounded-lg hover:bg-accent transition-colors">
                            <div className="flex items-center gap-3">
                                <Icons.Inventory className="w-5 h-5 text-primary" />
                                <div>
                                    <div className="font-medium">Monitor Inventori</div>
                                    <div className="text-xs text-muted-foreground">Cek stok produk</div>
                                </div>
                            </div>
                        </a>
                        <a href="/manager/sales-reports" className="block p-3 border rounded-lg hover:bg-accent transition-colors">
                            <div className="flex items-center gap-3">
                                <Icons.Reports className="w-5 h-5 text-primary" />
                                <div>
                                    <div className="font-medium">Laporan Penjualan</div>
                                    <div className="text-xs text-muted-foreground">Analisis sales</div>
                                </div>
                            </div>
                        </a>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats && stats.lowStockCount > 0 ? (
                            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <Icons.Inventory className="w-5 h-5 text-orange-600 mt-0.5" />
                                    <div>
                                        <div className="font-medium text-orange-900 dark:text-orange-100">Stok Rendah</div>
                                        <div className="text-sm text-orange-700 dark:text-orange-300">
                                            {stats.lowStockCount} produk perlu restock
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-sm">Tidak ada alert saat ini</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
