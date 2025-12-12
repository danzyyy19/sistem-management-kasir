'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import toast from 'react-hot-toast'

interface Category {
    id: string
    name: string
    _count: { products: number }
}

export default function AdminCategoriesPage() {
    const router = useRouter()
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/admin/categories')
            if (response.ok) {
                const data = await response.json()
                setCategories(data)
            }
        } catch (error) {
            console.error('Error:', error)
            toast.error('Gagal memuat kategori')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Hapus kategori "${name}"?`)) return

        try {
            const response = await fetch(`/api/admin/categories/${id}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                toast.success('Kategori berhasil dihapus')
                fetchCategories()
            } else {
                const data = await response.json()
                toast.error(data.error || 'Gagal menghapus kategori')
            }
        } catch (error) {
            console.error('Error:', error)
            toast.error('Terjadi kesalahan')
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gradient">Kelola Kategori</h2>
                    <p className="text-muted-foreground mt-1">Manajemen kategori produk</p>
                </div>
                <Button className="gap-2" onClick={() => router.push('/admin/categories/new')}>
                    <Icons.Add className="w-5 h-5" />
                    Tambah Kategori
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categories.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        Belum ada kategori
                    </div>
                ) : (
                    categories.map((category) => (
                        <Card key={category.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-lg font-medium">{category.name}</CardTitle>
                                <Icons.Categories className="w-6 h-6 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-primary">
                                    {category._count.products}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Total Produk</p>
                                <div className="flex gap-2 mt-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => router.push(`/admin/categories/${category.id}/edit`)}
                                    >
                                        <Icons.Edit className="w-4 h-4 mr-1" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(category.id, category.name)}
                                    >
                                        <Icons.Delete className="w-4 h-4 text-destructive" />
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
