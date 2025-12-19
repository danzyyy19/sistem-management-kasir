'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { CurrencyInput } from '@/components/ui/currency-input'
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

export default function AdminProductNewPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [categories, setCategories] = useState<Category[]>([])
    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        barcode: '',
        price: 0,
        cost: 0,
        stock: '',
        minStock: '',
        categoryId: '',
        supplierId: '',
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [catRes, supRes] = await Promise.all([
                fetch('/api/admin/categories'),
                fetch('/api/admin/suppliers')
            ])

            if (catRes.ok) {
                const catData = await catRes.json()
                setCategories(catData)
            }

            if (supRes.ok) {
                const supData = await supRes.json()
                setSuppliers(supData)
            }
        } catch (error) {
            console.error('Error:', error)
            toast.error('Gagal memuat data')
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await fetch('/api/admin/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    price: formData.price,
                    cost: formData.cost,
                    stock: parseInt(formData.stock),
                    minStock: parseInt(formData.minStock),
                }),
            })

            if (response.ok) {
                toast.success('Produk berhasil ditambahkan')
                router.push('/admin/products')
            } else {
                const data = await response.json()
                toast.error(data.error || 'Gagal menambahkan produk')
            }
        } catch (error) {
            console.error('Error:', error)
            toast.error('Terjadi kesalahan')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.back()}>
                    <Icons.Close className="w-5 h-5" />
                </Button>
                <div>
                    <h2 className="text-3xl font-bold text-gradient">Tambah Produk Baru</h2>
                    <p className="text-muted-foreground mt-1">Isi form untuk menambahkan produk</p>
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
                                    placeholder="Contoh: Indomie Goreng"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sku">SKU *</Label>
                                <Input
                                    id="sku"
                                    required
                                    value={formData.sku}
                                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                    placeholder="Contoh: PRD-001"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="barcode">Barcode</Label>
                                <Input
                                    id="barcode"
                                    value={formData.barcode}
                                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                                    placeholder="Contoh: 8992753720004"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="categoryId">Kategori *</Label>
                                <select
                                    id="categoryId"
                                    required
                                    value={formData.categoryId}
                                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                    className="flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm"
                                >
                                    <option value="">Pilih Kategori</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="supplierId">Supplier</Label>
                                <select
                                    id="supplierId"
                                    value={formData.supplierId}
                                    onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                                    className="flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm"
                                >
                                    <option value="">Pilih Supplier</option>
                                    {suppliers.map((sup) => (
                                        <option key={sup.id} value={sup.id}>{sup.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="price">Harga Jual *</Label>
                                <CurrencyInput
                                    id="price"
                                    required
                                    value={formData.price}
                                    onValueChange={(value) => setFormData({ ...formData, price: value })}
                                    placeholder="Contoh: 5000"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="cost">Harga Beli *</Label>
                                <CurrencyInput
                                    id="cost"
                                    required
                                    value={formData.cost}
                                    onValueChange={(value) => setFormData({ ...formData, cost: value })}
                                    placeholder="Contoh: 3500"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="stock">Stok Awal *</Label>
                                <Input
                                    id="stock"
                                    type="number"
                                    required
                                    min="0"
                                    value={formData.stock}
                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                    placeholder="Contoh: 100"
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
                                    placeholder="Contoh: 10"
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
                                        Simpan Produk
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
