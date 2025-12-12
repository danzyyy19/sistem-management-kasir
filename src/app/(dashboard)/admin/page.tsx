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
    totalProducts: number
    lowStockProducts: number
    totalUsers: number
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/admin/stats')
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
                <h2 className="text-3xl font-bold text-gradient">Dashboard Admin</h2>
                <p className="text-muted-foreground mt-1">Ringkasan sistem informasi minimarket</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                        <CardTitle className="text-sm font-medium">Bulan Ini</CardTitle>
                        <Icons.Reports className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats?.monthSales || 0)}</div>
                        <p className="text-xs text-muted-foreground">{stats?.monthTransactions || 0} transaksi</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Produk</CardTitle>
                        <Icons.Products className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats?.lowStockProducts || 0} stok rendah
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Icons.Users className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                        <p className="text-xs text-muted-foreground">Pengguna sistem</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/admin/products'}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Icons.Products className="w-5 h-5 text-primary" />
                            Kelola Produk
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Tambah, edit, atau hapus produk
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/admin/categories'}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Icons.Categories className="w-5 h-5 text-primary" />
                            Kelola Kategori
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Atur kategori produk
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/admin/users'}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Icons.Users className="w-5 h-5 text-primary" />
                            Kelola Users
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Manajemen pengguna sistem
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/admin/suppliers'}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Icons.Suppliers className="w-5 h-5 text-primary" />
                            Kelola Supplier
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Manajemen data supplier
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/admin/transactions'}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Icons.Transactions className="w-5 h-5 text-primary" />
                            Riwayat Transaksi
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Lihat semua transaksi
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/admin/reports'}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Icons.Reports className="w-5 h-5 text-primary" />
                            Laporan
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Analytics dan laporan
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
