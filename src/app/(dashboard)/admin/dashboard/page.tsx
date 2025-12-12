'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/components/icons'
import { formatCurrency } from '@/lib/utils'

interface DashboardStats {
    totalProducts: number
    lowStockProducts: number
    totalCategories: number
    totalSuppliers: number
    totalUsers: number
    todayRevenue: number
    totalTransactions: number
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/admin/stats')
                if (response.ok) {
                    const data = await response.json()
                    setStats(data)
                }
            } catch (error) {
                console.error('Error fetching stats:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    const statsCards = [
        {
            title: 'Total Produk',
            value: stats?.totalProducts || 0,
            icon: Icons.Products,
            color: 'text-blue-600 dark:text-blue-400',
            bgColor: 'bg-blue-100 dark:bg-blue-900/20',
        },
        {
            title: 'Stok Rendah',
            value: stats?.lowStockProducts || 0,
            icon: Icons.Inventory,
            color: 'text-orange-600 dark:text-orange-400',
            bgColor: 'bg-orange-100 dark:bg-orange-900/20',
        },
        {
            title: 'Total Kategori',
            value: stats?.totalCategories || 0,
            icon: Icons.Categories,
            color: 'text-purple-600 dark:text-purple-400',
            bgColor: 'bg-purple-100 dark:bg-purple-900/20',
        },
        {
            title: 'Total Supplier',
            value: stats?.totalSuppliers || 0,
            icon: Icons.Suppliers,
            color: 'text-green-600 dark:text-green-400',
            bgColor: 'bg-green-100 dark:bg-green-900/20',
        },
        {
            title: 'Total Users',
            value: stats?.totalUsers || 0,
            icon: Icons.Users,
            color: 'text-indigo-600 dark:text-indigo-400',
            bgColor: 'bg-indigo-100 dark:bg-indigo-900/20',
        },
        {
            title: 'Pendapatan Hari Ini',
            value: formatCurrency(stats?.todayRevenue || 0),
            icon: Icons.Transactions,
            color: 'text-emerald-600 dark:text-emerald-400',
            bgColor: 'bg-emerald-100 dark:bg-emerald-900/20',
            isRevenue: true,
        },
    ]

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-3xl font-bold text-gradient">Dashboard Admin</h2>
                <p className="text-muted-foreground mt-1">
                    Selamat datang di sistem informasi minimarket
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {statsCards.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                        <Card
                            key={index}
                            className="hover:shadow-lg transition-shadow duration-200"
                        >
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {stat.title}
                                </CardTitle>
                                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                    <Icon className={`w-4 h-4 ${stat.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${stat.color}`}>
                                    {stat.value}
                                </div>
                                {stat.title === 'Stok Rendah' && stat.value > 0 && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Perlu restocking segera
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Aksi Cepat</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <a
                            href="/admin/products"
                            className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-accent transition-colors"
                        >
                            <Icons.Products className="w-8 h-8 text-primary" />
                            <div>
                                <p className="font-medium">Kelola Produk</p>
                                <p className="text-xs text-muted-foreground">Tambah/Edit produk</p>
                            </div>
                        </a>
                        <a
                            href="/admin/users"
                            className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-accent transition-colors"
                        >
                            <Icons.Users className="w-8 h-8 text-primary" />
                            <div>
                                <p className="font-medium">Kelola Users</p>
                                <p className="text-xs text-muted-foreground">Manajemen pengguna</p>
                            </div>
                        </a>
                        <a
                            href="/admin/categories"
                            className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-accent transition-colors"
                        >
                            <Icons.Categories className="w-8 h-8 text-primary" />
                            <div>
                                <p className="font-medium">Kategori</p>
                                <p className="text-xs text-muted-foreground">Kelola kategori</p>
                            </div>
                        </a>
                        <a
                            href="/admin/reports"
                            className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-accent transition-colors"
                        >
                            <Icons.Reports className="w-8 h-8 text-primary" />
                            <div>
                                <p className="font-medium">Laporan</p>
                                <p className="text-xs text-muted-foreground">Lihat laporan</p>
                            </div>
                        </a>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
