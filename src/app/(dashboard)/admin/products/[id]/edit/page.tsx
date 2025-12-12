'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Icons } from '@/components/icons'
import toast from 'react-hot-toast'

interface Category {
    id: string
    name: string
}

interface Supplier {
    id: string
    name: string
}

interface PageParams {
    params: {
        id: string
    }
}

export default function AdminProductEditPage({ params }: PageParams) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [loadingData, setLoadingData] = useState(true)
    const [categories, setCategories] = useState<Category[]>([])
    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        barcode: '',
        price: '',
        cost: '',
        stock: '',
        minStock: '',
        categoryId: '',
        supplierId: '',
    })

    useEffect(() => {
        fetchData()
    }, [params.id])

    const fetchData = async () => {
        try {
            const [productRes, catRes, supRes] = await Promise.all([
                fetch(`/api/admin/products/${params.id}`),
                fetch('/api/admin/categories'),
                fetch('/api/admin/suppliers')
            ])

            if (productRes.ok) {
                const product = await productRes.json()
                setFormData({
                    name: product.name,
                    sku: product.sku,
                    barcode: product.barcode || '',
                    price: product.price.toString(),
                    cost: product.cost.toString(),
                    stock: product.stock.toString(),
                    minStock: product.minStock.toString(),
                    categoryId: product.categoryId,
                    supplierId: product.supplierId || '',
                })
            }

            if (catRes.ok) setCategories(await catRes.json())
            if (supRes.ok) setSuppliers(await supRes.json())
        } catch (error) {
            console.error('Error:', error)
            toast.error('Gagal memuat data')
        } finally {
            setLoadingData(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await fetch(`/api/admin/products/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price),
                    cost: parseFloat(formData.cost),
                    stock: parseInt(formData.stock),
                    minStock: parseInt(formData.minStock),
                }),
            })

            if (response.ok) {
                toast.success('Produk berhasil diupdate')
                router.push('/admin/products')
            } else {
                const data = await response.json()
                toast.error(data.error || 'Gagal mengupdate produk')
            }
        } catch (error) {
            console.error('Error:', error)
            toast.error('Terjadi kesalahan')
        } finally {
            setLoading(false)
        }
    }

    if (loadingData) {
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
                    <h2 className="text-3xl font-bold text-gradient">Edit Produk</h2>
                    <p className="text-muted-foreground mt-1">Update informasi produk</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Produk</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Produk *</Label>
                                <Input
                                    id="name"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sku">SKU *</Label>
                                <Input
                                    id="sku"
                                    required
                                    value={formData.sku}
                                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="barcode">Barcode</Label>
                                <Input
                                    id="barcode"
                                    value={formData.barcode}
                                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="categoryId">Kategori *</Label>
                                <Select
                                    id="categoryId"
                                    required
                                    value={formData.categoryId}
                                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                >
                                    <option value="">Pilih Kategori</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="supplierId">Supplier</Label>
                                <Select
                                    id="supplierId"
                                    value={formData.supplierId}
                                    onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                                >
                                    <option value="">Pilih Supplier</option>
                                    {suppliers.map((sup) => (
                                        <option key={sup.id} value={sup.id}>{sup.name}</option>
                                    ))}
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="price">Harga Jual *</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="cost">Harga Beli *</Label>
                                <Input
                                    id="cost"
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={formData.cost}
                                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="stock">Stok *</Label>
                                <Input
                                    id="stock"
                                    type="number"
                                    required
                                    min="0"
                                    value={formData.stock}
                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="minStock">Minimum Stok *</Label>
                                <Input
                                    id="minStock"
                                    type="number"
                                    required
                                    min="0"
                                    value={formData.minStock}
                                    onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button type="submit" disabled={loading} className="gap-2">
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Icons.Save className="w-4 h-4" />
                                        Update Produk
                                    </>
                                )}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => router.back()}>
                                Batal
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    )
}
