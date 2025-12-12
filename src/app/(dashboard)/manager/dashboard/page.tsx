'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/components/icons'

export default function ManagerDashboard() {
    const [stats, setStats] = useState({
        totalInventory: 0,
        lowStockItems: 0,
        pendingPurchaseOrders: 0,
        monthlyRevenue: 0,
    })

    useEffect(() => {
        // Fetch manager stats
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/manager/stats')
                if (response.ok) {
                    const data = await response.json()
                    setStats(data)
                }
            } catch (error) {
                console.error('Error fetching stats:', error)
            }
        }

        fetchStats()
    }, [])

    const statsCards = [
        {
            title: 'Total Inventory',
            value: stats.totalInventory,
            icon: Icons.Inventory,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100 dark:bg-blue-900/20',
        },
        {
            title: 'Stok Rendah',
            value: stats.lowStockItems,
            icon: Icons.Products,
            color: 'text-orange-600',
            bgColor: 'bg-orange-100 dark:bg-orange-900/20',
        },
        {
            title: 'PO Pending',
            value: stats.pendingPurchaseOrders,
            icon: Icons.Suppliers,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100 dark:bg-purple-900/20',
        },
    ]

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-3xl font-bold text-gradient">Dashboard Manager</h2>
                <p className="text-muted-foreground mt-1">
                    Kelola inventory dan purchase orders
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {statsCards.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                        <Card key={index} className="hover:shadow-lg transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                    <Icon className={`w-4 h-4 ${stat.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <a
                    href="/manager/inventory"
                    className="flex items-center gap-4 p-6 rounded-lg border border-border hover:bg-accent transition-colors"
                >
                    <Icons.Inventory className="w-10 h-10 text-primary" />
                    <div>
                        <p className="font-semibold text-lg">Kelola Inventory</p>
                        <p className="text-sm text-muted-foreground">Monitor dan kelola stok barang</p>
                    </div>
                </a>
                <a
                    href="/manager/purchase-orders"
                    className="flex items-center gap-4 p-6 rounded-lg border border-border hover:bg-accent transition-colors"
                >
                    <Icons.Products className="w-10 h-10 text-primary" />
                    <div>
                        <p className="font-semibold text-lg">Purchase Orders</p>
                        <p className="text-sm text-muted-foreground">Buat dan kelola PO</p>
                    </div>
                </a>
            </div>
        </div>
    )
}
