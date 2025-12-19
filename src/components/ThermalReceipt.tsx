'use client'

import { formatCurrency, formatDate } from '@/lib/utils'

interface ReceiptItem {
    productName: string
    quantity: number
    price: number
    subtotal: number
}

interface ThermalReceiptProps {
    receiptId: string
    date: Date
    cashierName: string
    items: ReceiptItem[]
    total: number
    paid: number
    change: number
    paymentMethod: 'CASH' | 'DEBIT_CARD' | 'CREDIT_CARD' | 'E_WALLET'
}

const paymentMethodLabels: Record<string, string> = {
    CASH: 'Tunai',
    DEBIT_CARD: 'Kartu Debit',
    CREDIT_CARD: 'Kartu Kredit',
    E_WALLET: 'E-Wallet'
}

export function ThermalReceipt({
    receiptId,
    date,
    cashierName,
    items,
    total,
    paid,
    change,
    paymentMethod
}: ThermalReceiptProps) {
    return (
        <div className="thermal-receipt bg-white text-black p-6 font-mono text-sm" style={{ width: '300px' }}>
            {/* Header */}
            <div className="text-center border-b border-dashed border-black pb-3 mb-3">
                <h1 className="text-lg font-bold">MINIMARKET</h1>
                <p className="text-xs">Sistem Manajemen Kasir</p>
                <p className="text-xs">Telp: (021) 1234-5678</p>
            </div>

            {/* Transaction Info */}
            <div className="text-xs border-b border-dashed border-black pb-3 mb-3 space-y-1">
                <div className="flex justify-between">
                    <span>No:</span>
                    <span>{receiptId}</span>
                </div>
                <div className="flex justify-between">
                    <span>Tanggal:</span>
                    <span>{formatDate(date)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Kasir:</span>
                    <span>{cashierName}</span>
                </div>
            </div>

            {/* Items */}
            <div className="mb-3 space-y-2">
                {items.map((item, index) => (
                    <div key={index}>
                        <div className="font-bold text-xs">{item.productName}</div>
                        <div className="flex justify-between text-xs">
                            <span>{item.quantity} x {formatCurrency(item.price)}</span>
                            <span>{formatCurrency(item.subtotal)}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Totals */}
            <div className="border-t border-dashed border-black pt-3 space-y-1">
                <div className="flex justify-between font-bold text-base">
                    <span>TOTAL:</span>
                    <span>{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between text-xs border-t border-dashed border-black pt-2 mt-2">
                    <span>Metode:</span>
                    <span>{paymentMethodLabels[paymentMethod]}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span>Dibayar:</span>
                    <span>{formatCurrency(paid)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span>Kembalian:</span>
                    <span>{formatCurrency(change)}</span>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-4 border-t border-dashed border-black pt-3 text-xs">
                <p className="font-bold">*** TERIMA KASIH ***</p>
                <p>Selamat Berbelanja Kembali</p>
                <p className="mt-2 text-[10px]">Barang yang sudah dibeli</p>
                <p className="text-[10px]">tidak dapat dikembalikan</p>
            </div>
        </div>
    )
}
