'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import { formatCurrency } from '@/lib/utils'
import { ThermalReceipt } from '@/components/ThermalReceipt'
import toast from 'react-hot-toast'

type PaymentMethodType = 'CASH' | 'DEBIT_CARD' | 'CREDIT_CARD' | 'E_WALLET'

interface Product {
    id: string
    name: string
    sku: string
    price: number
    stock: number
}

interface CartItem {
    product: Product
    quantity: number
}

interface LastTransaction {
    id: string
    date: Date
    cashier: string
    items: { productName: string; quantity: number; price: number; subtotal: number }[]
    total: number
    paid: number
    change: number
    paymentMethod: PaymentMethodType
}

export default function CashierPOSPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [cart, setCart] = useState<CartItem[]>([])
    const [search, setSearch] = useState('')
    const [paid, setPaid] = useState('')
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('CASH')
    const [loading, setLoading] = useState(false)
    const [showReceipt, setShowReceipt] = useState(false)
    const [lastTransaction, setLastTransaction] = useState<LastTransaction | null>(null)

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/cashier/products')
            if (response.ok) {
                const data = await response.json()
                setProducts(data)
            }
        } catch (error) {
            console.error('Error fetching products:', error)
        }
    }

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.sku.toLowerCase().includes(search.toLowerCase())
    )

    const addToCart = (product: Product) => {
        const existing = cart.find(item => item.product.id === product.id)
        if (existing) {
            setCart(
                cart.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            )
        } else {
            setCart([...cart, { product, quantity: 1 }])
        }
        toast.success(`${product.name} ditambahkan ke keranjang`)
    }

    const removeFromCart = (productId: string) => {
        setCart(cart.filter(item => item.product.id !== productId))
    }

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId)
            return
        }
        setCart(
            cart.map(item =>
                item.product.id === productId ? { ...item, quantity } : item
            )
        )
    }

    const total = cart.reduce(
        (sum, item) => sum + Number(item.product.price) * item.quantity,
        0
    )

    const paidAmount = parseFloat(paid) || 0
    const change = paidAmount - total

    const handleCheckout = async () => {
        if (cart.length === 0) {
            toast.error('Keranjang masih kosong')
            return
        }

        if (paidAmount < total) {
            toast.error('Pembayaran kurang')
            return
        }

        setLoading(true)
        try {
            const response = await fetch('/api/cashier/pos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart.map(item => ({
                        productId: item.product.id,
                        quantity: item.quantity,
                        price: item.product.price,
                        subtotal: Number(item.product.price) * item.quantity,
                    })),
                    total: total,
                    paid: paidAmount,
                    change: change,
                    paymentMethod: paymentMethod,
                }),
            })

            if (response.ok) {
                const result = await response.json()
                toast.success('Transaksi berhasil!')

                // Set receipt data
                setLastTransaction({
                    id: result.transactionNo || `TRX-${Date.now()}`,
                    date: new Date(),
                    cashier: 'Kasir',
                    items: cart.map(item => ({
                        productName: item.product.name,
                        quantity: item.quantity,
                        price: Number(item.product.price),
                        subtotal: Number(item.product.price) * item.quantity,
                    })),
                    total,
                    paid: paidAmount,
                    change,
                    paymentMethod,
                })
                setShowReceipt(true)

                setCart([])
                setPaid('')
                setPaymentMethod('CASH')
                fetchProducts()
            } else {
                const error = await response.json()
                toast.error(error.message || 'Transaksi gagal')
            }
        } catch (error) {
            console.error('Checkout error:', error)
            toast.error('Terjadi kesalahan')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Products */}
            <div className="lg:col-span-2 space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Produk</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative mb-4">
                            <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                            <Input
                                placeholder="Cari produk (nama atau SKU)..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto">
                            {filteredProducts.map((product) => (
                                <button
                                    key={product.id}
                                    onClick={() => addToCart(product)}
                                    className="p-4 border border-border rounded-lg hover:bg-accent transition-colors text-left"
                                    disabled={product.stock === 0}
                                >
                                    <p className="font-medium truncate">{product.name}</p>
                                    <p className="text-sm text-muted-foreground">{product.sku}</p>
                                    <p className="text-lg font-bold text-primary mt-2">
                                        {formatCurrency(Number(product.price))}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Stok: {product.stock}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Cart */}
            <div className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Keranjang</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 max-h-[400px] overflow-y-auto">
                            {cart.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">
                                    Keranjang kosong
                                </p>
                            ) : (
                                cart.map((item) => (
                                    <div
                                        key={item.product.id}
                                        className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{item.product.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatCurrency(Number(item.product.price))}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    updateQuantity(item.product.id, item.quantity - 1)
                                                }
                                            >
                                                -
                                            </Button>
                                            <span className="w-8 text-center">{item.quantity}</span>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    updateQuantity(item.product.id, item.quantity + 1)
                                                }
                                            >
                                                +
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => removeFromCart(item.product.id)}
                                            >
                                                <Icons.Delete className="w-4 h-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-3">
                            <div className="flex justify-between text-lg font-semibold">
                                <span>Total:</span>
                                <span className="text-primary">{formatCurrency(total)}</span>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Metode Pembayaran:</label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethodType)}
                                    className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
                                >
                                    <option value="CASH">💵 Tunai / Cash</option>
                                    <option value="DEBIT_CARD">💳 Kartu Debit</option>
                                    <option value="CREDIT_CARD">💳 Kartu Kredit</option>
                                    <option value="E_WALLET">📱 E-Wallet (GoPay/OVO/Dana)</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Dibayar:</label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={paid}
                                    onChange={(e) => setPaid(e.target.value)}
                                    className="text-lg"
                                />
                            </div>

                            {paidAmount > 0 && (
                                <div className="flex justify-between text-lg">
                                    <span>Kembalian:</span>
                                    <span
                                        className={
                                            change >= 0 ? 'text-green-600' : 'text-destructive'
                                        }
                                    >
                                        {formatCurrency(Math.max(0, change))}
                                    </span>
                                </div>
                            )}

                            <Button
                                onClick={handleCheckout}
                                className="w-full"
                                size="lg"
                                disabled={loading || cart.length === 0}
                            >
                                {loading ? 'Memproses...' : 'Proses Transaksi'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Receipt Modal */}
            {showReceipt && lastTransaction && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 no-print">
                    <div className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-auto">
                        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-background">
                            <h3 className="font-bold text-lg">Struk Transaksi</h3>
                            <Button variant="ghost" size="sm" onClick={() => setShowReceipt(false)}>
                                <Icons.Close className="w-5 h-5" />
                            </Button>
                        </div>
                        <div className="p-4 flex justify-center">
                            <ThermalReceipt
                                receiptId={lastTransaction.id}
                                date={lastTransaction.date}
                                cashierName={lastTransaction.cashier}
                                items={lastTransaction.items}
                                total={lastTransaction.total}
                                paid={lastTransaction.paid}
                                change={lastTransaction.change}
                                paymentMethod={lastTransaction.paymentMethod}
                            />
                        </div>
                        <div className="p-4 border-t flex gap-2 sticky bottom-0 bg-background">
                            <Button onClick={() => window.print()} className="flex-1 gap-2">
                                🖨️ Print Struk
                            </Button>
                            <Button onClick={() => setShowReceipt(false)} variant="outline" className="flex-1">
                                Tutup
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
