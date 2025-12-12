'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import { formatCurrency, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

interface PurchaseOrder {
    id: string
    orderNo: string
    supplier: {
        name: string
    }
    total: number
    status: string
    createdAt: string
    items: Array<{
        product: { name: string }
        quantity: number
    }>
}

export default function ManagerPurchaseOrdersPage() {
    const router = useRouter()
    const [orders, setOrders] = useState<PurchaseOrder[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        try {
            const response = await fetch('/api/manager/purchase-orders')
            if (response.ok) {
                const data = await response.json()
                setOrders(data)
            }
        } catch (error) {
            console.error('Error:', error)
            toast.error('Gagal memuat data')
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadge = (status: string) => {
        const styles = {
            PENDING: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400',
            APPROVED: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
            RECEIVED: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
            CANCELLED: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
        }
        return styles[status as keyof typeof styles] || styles.PENDING
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
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-gradient">Purchase Orders</h2>
                    <p className="text-muted-foreground mt-1">Kelola pesanan pembelian dari supplier</p>
                </div>
                <Button onClick={() => router.push('/manager/purchase-orders/new')} className="gap-2">
                    <Icons.Add className="w-5 h-5" />
                    Buat PO Baru
                </Button>
            </div>

            <div className="grid gap-4">
                {orders.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <Icons.Inventory className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
                            <p className="text-lg font-medium text-muted-foreground">Belum ada Purchase Order</p>
                            <p className="text-sm text-muted-foreground mt-1">Klik tombol "Buat PO Baru" untuk memulai</p>
                        </CardContent>
                    </Card>
                ) : (
                    orders.map((order) => (
                        <Card key={order.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg">{order.orderNo}</CardTitle>
                                        <p className="text-sm text-muted-foreground mt-1">{order.supplier.name}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                                        {order.status}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div>
                                        <div className="text-sm text-muted-foreground">Total</div>
                                        <div className="text-lg font-bold text-primary">{formatCurrency(Number(order.total))}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Items</div>
                                        <div className="text-lg font-semibold">{order.items.length} produk</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Tanggal</div>
                                        <div className="text-sm font-medium">{formatDate(new Date(order.createdAt))}</div>
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-4">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => router.push(`/manager/purchase-orders/${order.id}`)}
                                    >
                                        <Icons.Reports className="w-4 h-4 mr-2" />
                                        Detail
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
