'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/components/icons'
import { formatCurrency, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Transaction {
    id: string
    transactionNo: string
    total: number
    paid: number
    change: number
    status: string
    createdAt: Date
    user: { name: string }
    items: { quantity: number }[]
}

export default function AdminTransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchTransactions()
    }, [])

    const fetchTransactions = async () => {
        try {
            const response = await fetch('/api/admin/transactions')
            if (response.ok) {
                const data = await response.json()
                setTransactions(data)
            }
        } catch (error) {
            console.error('Error:', error)
            toast.error('Gagal memuat transaksi')
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

    const totalRevenue = transactions.reduce((sum, t) => sum + Number(t.total), 0)
    const totalItems = transactions.reduce((sum, t) => sum + t.items.reduce((s, i) => s + i.quantity, 0), 0)

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-3xl font-bold text-gradient">Riwayat Transaksi</h2>
                <p className="text-muted-foreground mt-1">Semua transaksi yang telah dilakukan</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Transaksi</CardTitle>
                        <Icons.Transactions className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{transactions.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <Icons.Transactions className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">{formatCurrency(totalRevenue)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                        <Icons.Products className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalItems}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-3">No. Transaksi</th>
                                    <th className="text-left p-3">Tanggal</th>
                                    <th className="text-left p-3">Kasir</th>
                                    <th className="text-right p-3">Total</th>
                                    <th className="text-center p-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((transaction) => (
                                    <tr key={transaction.id} className="border-b hover:bg-accent transition-colors">
                                        <td className="p-3 font-mono text-sm">{transaction.transactionNo}</td>
                                        <td className="p-3">{formatDate(transaction.createdAt)}</td>
                                        <td className="p-3">{transaction.user.name}</td>
                                        <td className="p-3 text-right font-semibold text-emerald-600">
                                            {formatCurrency(Number(transaction.total))}
                                        </td>
                                        <td className="p-3 text-center">
                                            <span className="px-3 py-1 rounded-full text-sm bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400">
                                                {transaction.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
