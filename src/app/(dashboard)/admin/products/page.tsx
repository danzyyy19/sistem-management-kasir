'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
    const searchParams = useSearchParams()
    const [products, setProducts] = useState<Product[]>([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [showLowStockOnly, setShowLowStockOnly] = useState(false)
    const itemsPerPage = 10

    // Detect filter from URL params
    useEffect(() => {
        const filter = searchParams.get('filter')
        if (filter === 'lowStock') {
            setShowLowStockOnly(true)
        }
    }, [searchParams])

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

    const filteredProducts = products
        .filter(p => {
            // Search filter
            const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                p.sku.toLowerCase().includes(search.toLowerCase())

            // Low stock filter
            const matchesLowStock = !showLowStockOnly || p.stock <= p.minStock

            return matchesSearch && matchesLowStock
        })

    // Pagination logic
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage)

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1)
    }, [search, showLowStockOnly])

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
                        {showLowStockOnly && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 rounded-lg border border-orange-200 dark:border-orange-800">
                                <Icons.Inventory className="w-4 h-4" />
                                <span className="text-sm font-medium">Stok Rendah</span>
                                <button
                                    onClick={() => {
                                        setShowLowStockOnly(false)
                                        router.push('/admin/products')
                                    }}
                                    className="ml-2 hover:bg-orange-200 dark:hover:bg-orange-800 rounded p-1"
                                >
                                    <Icons.Close className="w-3 h-3" />
                                </button>
                            </div>
                        )}
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
                                {paginatedProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-muted-foreground">
                                            Tidak ada produk
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedProducts.map((product) => (
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

                    {/* Pagination Controls */}
                    {filteredProducts.length > itemsPerPage && (
                        <div className="flex items-center justify-between mt-4 pt-4 border-t">
                            <div className="text-sm text-muted-foreground">
                                Menampilkan {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredProducts.length)} dari {filteredProducts.length} produk
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </Button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }
                                        return (
                                            <Button
                                                key={pageNum}
                                                variant={pageNum === currentPage ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setCurrentPage(pageNum)}
                                                className="w-8 h-8 p-0"
                                            >
                                                {pageNum}
                                            </Button>
                                        );
                                    })}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
