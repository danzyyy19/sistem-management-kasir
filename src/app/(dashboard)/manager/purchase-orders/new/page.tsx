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
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Supplier {
    id: string
    name: string
}

interface Product {
    id: string
    name: string
    sku: string
    cost: number
}

interface OrderItem {
    productId: string
    productName: string
    quantity: number
    cost: number
}

export default function NewPurchaseOrderPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [selectedSupplier, setSelectedSupplier] = useState('')
    const [items, setItems] = useState<OrderItem[]>([])
    const [notes, setNotes] = useState('')

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [suppliersRes, productsRes] = await Promise.all([
                fetch('/api/admin/suppliers'),
                fetch('/api/admin/products')
            ])

            if (suppliersRes.ok) setSuppliers(await suppliersRes.json())
            if (productsRes.ok) setProducts(await productsRes.json())
        } catch (error) {
            console.error('Error:', error)
        }
    }

    const addItem = () => {
        if (products.length === 0) {
            toast.error('Tidak ada produk tersedia')
            return
        }
        const firstProduct = products[0]
        setItems([...items, {
            productId: firstProduct.id,
            productName: firstProduct.name,
            quantity: 1,
            cost: Number(firstProduct.cost)
        }])
    }

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index))
    }

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...items]
        if (field === 'productId') {
            const product = products.find(p => p.id === value)
            if (product) {
                newItems[index] = {
                    ...newItems[index],
                    productId: value,
                    productName: product.name,
                    cost: Number(product.cost)
                }
            }
        } else {
            newItems[index] = { ...newItems[index], [field]: value }
        }
        setItems(newItems)
    }

    const total = items.reduce((sum, item) => sum + (item.quantity * item.cost), 0)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!selectedSupplier) {
            toast.error('Pilih supplier')
            return
        }

        if (items.length === 0) {
            toast.error('Tambahkan minimal 1 item')
            return
        }

        setLoading(true)
        try {
            // Get user from session - for now use a placeholder
            const response = await fetch('/api/manager/purchase-orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    supplierId: selectedSupplier,
                    items,
                    notes
                })
            })

            if (response.ok) {
                toast.success('Purchase Order berhasil dibuat')
                router.push('/manager/purchase-orders')
            } else {
                toast.error('Gagal membuat PO')
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
                    <h2 className="text-3xl font-bold text-gradient">Buat Purchase Order</h2>
                    <p className="text-muted-foreground mt-1">Buat pesanan pembelian baru</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Supplier</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="supplier">Supplier *</Label>
                                <Select
                                    id="supplier"
                                    required
                                    value={selectedSupplier}
                                    onChange={(e) => setSelectedSupplier(e.target.value)}
                                >
                                    <option value="">Pilih Supplier</option>
                                    {suppliers.map(supplier => (
                                        <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                                    ))}
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Catatan</Label>
                                <textarea
                                    id="notes"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    placeholder="Catatan tambahan..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Items</CardTitle>
                            <Button type="button" onClick={addItem} size="sm" className="gap-2">
                                <Icons.Add className="w-4 h-4" />
                                Tambah Item
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {items.length === 0 ? (
                                    <p className="text-center py-8 text-muted-foreground">Belum ada item</p>
                                ) : (
                                    items.map((item, index) => (
                                        <div key={index} className="grid gap-3 p-4 border rounded-lg md:grid-cols-12 items-end">
                                            <div className="md:col-span-5 space-y-2">
                                                <Label>Produk</Label>
                                                <Select
                                                    value={item.productId}
                                                    onChange={(e) => updateItem(index, 'productId', e.target.value)}
                                                >
                                                    {products.map(product => (
                                                        <option key={product.id} value={product.id}>
                                                            {product.name} ({product.sku})
                                                        </option>
                                                    ))}
                                                </Select>
                                            </div>

                                            <div className="md:col-span-2 space-y-2">
                                                <Label>Qty</Label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                                                />
                                            </div>

                                            <div className="md:col-span-2 space-y-2">
                                                <Label>Harga</Label>
                                                <CurrencyInput
                                                    value={item.cost}
                                                    onValueChange={(value) => updateItem(index, 'cost', value)}
                                                />
                                            </div>

                                            <div className="md:col-span-2 space-y-2">
                                                <Label>Subtotal</Label>
                                                <div className="text-sm font-semibold p-2 border rounded-md bg-muted">
                                                    {formatCurrency(item.quantity * item.cost)}
                                                </div>
                                            </div>

                                            <div className="md:col-span-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeItem(index)}
                                                >
                                                    <Icons.Delete className="w-4 h-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {items.length > 0 && (
                                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                                    <span className="text-lg font-semibold">Total:</span>
                                    <span className="text-2xl font-bold text-primary">{formatCurrency(total)}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex gap-3">
                        <Button type="submit" disabled={loading} className="gap-2">
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <Icons.Save className="w-4 h-4" />
                                    Buat Purchase Order
                                </>
                            )}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => router.back()}>
                            Batal
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    )
}
