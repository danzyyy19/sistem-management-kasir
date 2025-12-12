'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Icons } from '@/components/icons'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Product {
    id: string
    name: string
    sku: string
    barcode?: string
    price: number
    cost: number
    stock: number
    minStock: number
    category: { name: string }
    supplier?: { name: string }
}

export default function AdminProductsPage() {
    const router = useRouter()
    const [products, setProducts] = useState<Product[]>([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/admin/products')
            if (response.ok) {
                const data = await response.json()
                setProducts(data)
            }
        } catch (error) {
            console.error('Error:', error)
            toast.error('Gagal memuat produk')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Hapus produk "${name}"?`)) return

        try {
            const response = await fetch(`/api/admin/products/${id}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                toast.success('Produk berhasil dihapus')
                fetchProducts()
            } else {
                toast.error('Gagal menghapus produk')
            }
        } catch (error) {
            console.error('Error:', error)
            toast.error('Terjadi kesalahan')
        }
    }

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gradient">Kelola Produk</h2>
                    <p className="text-muted-foreground mt-1">Manajemen data produk minimarket</p>
                </div>
                <Button className="gap-2" onClick={() => router.push('/admin/products/new')}>
                    <Icons.Add className="w-5 h-5" />
                    Tambah Produk
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                            <Input
                                placeholder="Cari produk (nama atau SKU)..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
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
                                    <th className="text-left p-3">Harga</th>
                                    <th className="text-left p-3">Stok</th>
                                    <th className="text-left p-3">Supplier</th>
                                    <th className="text-center p-3">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-muted-foreground">
                                            Tidak ada produk
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProducts.map((product) => (
                                        <tr key={product.id} className="border-b hover:bg-accent transition-colors">
                                            <td className="p-3 font-mono text-sm">{product.sku}</td>
                                            <td className="p-3">
                                                <div className="font-medium">{product.name}</div>
                                                {product.barcode && (
                                                    <div className="text-xs text-muted-foreground">{product.barcode}</div>
                                                )}
                                            </td>
                                            <td className="p-3">{product.category.name}</td>
                                            <td className="p-3 font-semibold text-primary">
                                                {formatCurrency(Number(product.price))}
                                            </td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded text-sm ${product.stock <= product.minStock
                                                        ? 'bg-destructive/10 text-destructive'
                                                        : 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                                                    }`}>
                                                    {product.stock} pcs
                                                </span>
                                            </td>
                                            <td className="p-3">{product.supplier?.name || '-'}</td>
                                            <td className="p-3">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                                                    >
                                                        <Icons.Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(product.id, product.name)}
                                                    >
                                                        <Icons.Delete className="w-4 h-4 text-destructive" />
                                                    </Button>
                                                </div>
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
