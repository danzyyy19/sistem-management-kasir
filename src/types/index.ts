export type Role = 'ADMIN' | 'CASHIER' | 'MANAGER'

export interface User {
    id: string
    email: string
    name: string
    role: Role
    createdAt: Date
    updatedAt: Date
}

export interface Product {
    id: string
    name: string
    sku: string
    barcode?: string | null
    description?: string | null
    price: number
    cost: number
    stock: number
    minStock: number
    categoryId: string
    supplierId?: string | null
    category?: Category
    supplier?: Supplier | null
}

export interface Category {
    id: string
    name: string
}

export interface Supplier {
    id: string
    name: string
    contact?: string | null
    phone?: string | null
    address?: string | null
}

export interface Transaction {
    id: string
    transactionNo: string
    userId: string
    total: number
    paid: number
    change: number
    status: string
    createdAt: Date
    user?: User
    items?: TransactionItem[]
}

export interface TransactionItem {
    id: string
    transactionId: string
    productId: string
    quantity: number
    price: number
    subtotal: number
    product?: Product
}

export interface CartItem {
    product: Product
    quantity: number
}

export interface DashboardStats {
    totalRevenue: number
    totalTransactions: number
    totalProducts: number
    lowStockProducts: number
}
