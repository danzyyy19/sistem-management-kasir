'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import toast from 'react-hot-toast'

interface StockItem {
    id: string
    name: string
    sku: string
    stock: number
    minStock: number
    category: { name: string }
}

export default function StockReportPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [lowStockItems, setLowStockItems] = useState<StockItem[]>([])

    useEffect(() => {
        fetchStockReport()
    }, [])

    const fetchStockReport = async () => {
        try {
            const response = await fetch('/api/admin/reports/stock')
            if (response.ok) {
                const data = await response.json()
                setLowStockItems(data.lowStock || [])
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
                    <h2 className="text-3xl font-bold text-gradient">Laporan Stok</h2>
                    <p className="text-muted-foreground mt-1">Produk dengan stok rendah</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Icons.Inventory className="w-5 h-5 text-orange-600" />
                        Produk Stok Rendah ({lowStockItems.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-3">SKU</th>
                                    <th className="text-left p-3">Nama Produk</th>
                                    <th className="text-left p-3">Kategori</th>
                                    <th className="text-center p-3">Stok</th>
                                    <th className="text-center p-3">Min. Stok</th>
                                    <th className="text-center p-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lowStockItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                            Semua produk memiliki stok yang cukup
                                        </td>
                                    </tr>
                                ) : (
                                    lowStockItems.map((item) => (
                                        <tr key={item.id} className="border-b hover:bg-accent">
                                            <td className="p-3 font-mono text-sm">{item.sku}</td>
                                            <td className="p-3 font-medium">{item.name}</td>
                                            <td className="p-3">{item.category.name}</td>
                                            <td className="p-3 text-center font-semibold text-orange-600">
                                                {item.stock}
                                            </td>
                                            <td className="p-3 text-center">{item.minStock}</td>
                                            <td className="p-3 text-center">
                                                <span className="px-3 py-1 rounded-full text-sm bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400">
                                                    Perlu Restock
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
