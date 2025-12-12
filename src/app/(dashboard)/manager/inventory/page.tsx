'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Icons } from '@/components/icons'
import toast from 'react-hot-toast'

interface Product {
    id: string
    name: string
    sku: string
    stock: number
    minStock: number
    category: { name: string }
}

export default function ManagerInventoryPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/manager/inventory')
            if (response.ok) {
                const data = await response.json()
                setProducts(data)
            }
        } catch (error) {
            console.error('Error:', error)
            toast.error('Gagal memuat inventory')
        } finally {
            setLoading(false)
        }
    }

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase())
    )

    const lowStockProducts = products.filter(p => p.stock <= p.minStock)

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
                <h2 className="text-3xl font-bold text-gradient">Manajemen Inventory</h2>
                <p className="text-muted-foreground mt-1">Monitor dan kelola stok barang</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <div className="text-sm font-medium text-muted-foreground">Total Produk</div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{products.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <div className="text-sm font-medium text-muted-foreground">Stok Rendah</div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{lowStockProducts.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <div className="text-sm font-medium text-muted-foreground">Total Stok</div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {products.reduce((sum, p) => sum + p.stock, 0)} pcs
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="relative">
                        <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                        <Input
                            placeholder="Cari produk..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
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
                                {filteredProducts.map((product) => {
                                    const isLowStock = product.stock <= product.minStock
                                    return (
                                        <tr key={product.id} className="border-b hover:bg-accent transition-colors">
                                            <td className="p-3 font-mono text-sm">{product.sku}</td>
                                            <td className="p-3 font-medium">{product.name}</td>
                                            <td className="p-3">{product.category.name}</td>
                                            <td className="p-3 text-center font-semibold">{product.stock}</td>
                                            <td className="p-3 text-center text-muted-foreground">{product.minStock}</td>
                                            <td className="p-3 text-center">
                                                {isLowStock ? (
                                                    <span className="px-3 py-1 rounded-full text-sm bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400">
                                                        Stok Rendah
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 rounded-full text-sm bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400">
                                                        Aman
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
