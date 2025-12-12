'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/components/icons'

export default function AdminReportsPage() {
    const router = useRouter()

    const reports = [
        {
            title: 'Laporan Penjualan',
            description: 'Analisis penjualan harian, mingguan, dan bulanan',
            icon: Icons.Reports,
            href: '/admin/reports/sales',
        },
        {
            title: 'Laporan Stok',
            description: 'Monitor stok produk dan produk yang perlu restocking',
            icon: Icons.Inventory,
            href: '/admin/reports/stock',
        },
        {
            title: 'Produk Terlaris',
            description: 'Daftar produk dengan penjualan tertinggi',
            icon: Icons.Products,
            href: '/admin/reports/top-products',
        },
        {
            title: 'Kinerja Kasir',
            description: 'Laporan performa kasir dan jumlah transaksi',
            icon: Icons.Users,
            href: '/admin/reports/cashier-performance',
        },
    ]

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-3xl font-bold text-gradient">Laporan & Analytics</h2>
                <p className="text-muted-foreground mt-1">Ringkasan dan analisis bisnis</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {reports.map((report) => {
                    const Icon = report.icon
                    return (
                        <Card
                            key={report.href}
                            className="hover:shadow-lg transition-all cursor-pointer hover:border-primary"
                            onClick={() => router.push(report.href)}
                        >
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    <Icon className="w-6 h-6 text-primary" />
                                    {report.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{report.description}</p>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
