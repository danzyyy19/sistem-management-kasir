'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Icons } from '@/components/icons'
import toast from 'react-hot-toast'

interface Supplier {
    id: string
    name: string
    contact?: string
    phone?: string
    address?: string
    _count: { products: number }
}

export default function AdminSuppliersPage() {
    const router = useRouter()
    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchSuppliers()
    }, [])

    const fetchSuppliers = async () => {
        try {
            const response = await fetch('/api/admin/suppliers')
            if (response.ok) {
                const data = await response.json()
                setSuppliers(data)
            }
        } catch (error) {
            console.error('Error:', error)
            toast.error('Gagal memuat suppliers')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Hapus supplier "${name}"?`)) return

        try {
            const response = await fetch(`/api/admin/suppliers/${id}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                toast.success('Supplier berhasil dihapus')
                fetchSuppliers()
            } else {
                const data = await response.json()
                toast.error(data.error || 'Gagal menghapus supplier')
            }
        } catch (error) {
            console.error('Error:', error)
            toast.error('Terjadi kesalahan')
        }
    }

    const filteredSuppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase())
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
                    <h2 className="text-3xl font-bold text-gradient">Kelola Supplier</h2>
                    <p className="text-muted-foreground mt-1">Manajemen data supplier</p>
                </div>
                <Button className="gap-2" onClick={() => router.push('/admin/suppliers/new')}>
                    <Icons.Add className="w-5 h-5" />
                    Tambah Supplier
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="relative">
                        <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                        <Input
                            placeholder="Cari supplier..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        {filteredSuppliers.length === 0 ? (
                            <div className="col-span-full text-center py-8 text-muted-foreground">
                                Tidak ada supplier
                            </div>
                        ) : (
                            filteredSuppliers.map((supplier) => (
                                <div
                                    key={supplier.id}
                                    className="p-4 border rounded-lg hover:bg-accent transition-colors"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <Icons.Suppliers className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">{supplier.name}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {supplier._count.products} produk
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => router.push(`/admin/suppliers/${supplier.id}/edit`)}
                                            >
                                                <Icons.Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(supplier.id, supplier.name)}
                                            >
                                                <Icons.Delete className="w-4 h-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </div>
                                    {supplier.contact && (
                                        <p className="text-sm text-muted-foreground mb-1">
                                            <strong>Contact:</strong> {supplier.contact}
                                        </p>
                                    )}
                                    {supplier.phone && (
                                        <p className="text-sm text-muted-foreground mb-1">
                                            <strong>Phone:</strong> {supplier.phone}
                                        </p>
                                    )}
                                    {supplier.address && (
                                        <p className="text-sm text-muted-foreground">
                                            <strong>Address:</strong> {supplier.address}
                                        </p>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
