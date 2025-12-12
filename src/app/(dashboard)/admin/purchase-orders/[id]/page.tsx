'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import { formatCurrency, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

interface PurchaseOrder {
    id: string
    orderNo: string
    status: string
    total: number
    notes: string
    createdAt: string
    supplier: {
        name: string
        contact: string
        phone: string
    }
    user: {
        name: string
        email: string
    }
    items: Array<{
        id: string
        quantity: number
        cost: number
        subtotal: number
        product: {
            name: string
            sku: string
        }
    }>
}

export default function AdminPurchaseOrderDetailPage() {
    const router = useRouter()
    const params = useParams()
    const id = params.id as string

    const [po, setPo] = useState<PurchaseOrder | null>(null)
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)

    useEffect(() => {
        if (id) fetchPO()
    }, [id])

    const fetchPO = async () => {
        try {
            const response = await fetch(`/api/manager/purchase-orders/${id}`)
            if (response.ok) {
                const data = await response.json()
                setPo(data)
            }
        } catch (error) {
            console.error('Error:', error)
            toast.error('Gagal memuat data')
        } finally {
            setLoading(false)
        }
    }

    const handleAction = async (action: string) => {
        const actionText = action === 'approve' ? 'approve' : action === 'receive' ? 'terima' : 'batalkan'
        if (!confirm(`Yakin ingin ${actionText} PO ini?`)) return

        setActionLoading(true)
        try {
            const response = await fetch(`/api/manager/purchase-orders/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            })

            if (response.ok) {
                toast.success(`PO berhasil di-${actionText}`)
                fetchPO()
            } else {
                const error = await response.json()
                toast.error(error.error || 'Gagal update PO')
            }
        } catch (error) {
            console.error('Error:', error)
            toast.error('Terjadi kesalahan')
        } finally {
            setActionLoading(false)
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

    if (!po) {
        return <div className="text-center py-12"><p className="text-muted-foreground">PO tidak ditemukan</p></div>
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.back()}>
                    <Icons.Close className="w-5 h-5" />
                </Button>
                <div className="flex-1">
                    <h2 className="text-3xl font-bold text-gradient">{po.orderNo}</h2>
                    <p className="text-muted-foreground mt-1">Detail Purchase Order</p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusBadge(po.status)}`}>
                    {po.status}
                </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader><CardTitle>Informasi Supplier</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        <div>
                            <div className="text-sm text-muted-foreground">Nama Supplier</div>
                            <div className="font-medium">{po.supplier.name}</div>
                        </div>
                        {po.supplier.contact && (
                            <div>
                                <div className="text-sm text-muted-foreground">Kontak</div>
                                <div className="font-medium">{po.supplier.contact}</div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Informasi PO</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        <div>
                            <div className="text-sm text-muted-foreground">Dibuat oleh</div>
                            <div className="font-medium">{po.user.name}</div>
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Tanggal</div>
                            <div className="font-medium">{formatDate(new Date(po.createdAt))}</div>
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Total</div>
                            <div className="text-xl font-bold text-primary">{formatCurrency(Number(po.total))}</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {po.notes && (
                <Card>
                    <CardHeader><CardTitle>Catatan</CardTitle></CardHeader>
                    <CardContent><p className="text-sm">{po.notes}</p></CardContent>
                </Card>
            )}

            <Card>
                <CardHeader><CardTitle>Items ({po.items.length})</CardTitle></CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-3">Produk</th>
                                    <th className="text-center p-3">Qty</th>
                                    <th className="text-right p-3">Harga</th>
                                    <th className="text-right p-3">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {po.items.map((item) => (
                                    <tr key={item.id} className="border-b">
                                        <td className="p-3 font-medium">{item.product.name}</td>
                                        <td className="p-3 text-center">{item.quantity}</td>
                                        <td className="p-3 text-right">{formatCurrency(Number(item.cost))}</td>
                                        <td className="p-3 text-right font-semibold">{formatCurrency(Number(item.subtotal))}</td>
                                    </tr>
                                ))}
                                <tr>
                                    <td colSpan={3} className="p-3 text-right font-bold">TOTAL:</td>
                                    <td className="p-3 text-right text-xl font-bold text-primary">{formatCurrency(Number(po.total))}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Aksi</CardTitle></CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-3">
                        {po.status === 'PENDING' && (
                            <>
                                <Button onClick={() => handleAction('approve')} disabled={actionLoading} className="gap-2">
                                    <Icons.Check className="w-4 h-4" />
                                    Approve PO
                                </Button>
                                <Button onClick={() => handleAction('cancel')} disabled={actionLoading} variant="destructive" className="gap-2">
                                    <Icons.Close className="w-4 h-4" />
                                    Cancel
                                </Button>
                            </>
                        )}

                        {po.status === 'APPROVED' && (
                            <Button onClick={() => handleAction('receive')} disabled={actionLoading} className="gap-2">
                                <Icons.Check className="w-4 h-4" />
                                Mark as Received (Update Stok)
                            </Button>
                        )}

                        {po.status === 'RECEIVED' && (
                            <div className="p-4 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Icons.Check className="w-5 h-5 text-green-600" />
                                    <div>
                                        <div className="font-medium text-green-900 dark:text-green-100">PO Telah Diterima</div>
                                        <div className="text-sm text-green-700 dark:text-green-300">Stok produk sudah ditambahkan</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
