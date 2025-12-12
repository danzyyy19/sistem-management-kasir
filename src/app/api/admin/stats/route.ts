import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const [
            totalProducts,
            lowStockProducts,
            totalCategories,
            totalSuppliers,
            totalUsers,
            todayTransactions,
        ] = await Promise.all([
            prisma.product.count(),
            prisma.product.count({ where: { stock: { lte: prisma.product.fields.minStock } } }),
            prisma.category.count(),
            prisma.supplier.count(),
            prisma.user.count(),
            prisma.transaction.findMany({
                where: {
                    createdAt: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    },
                    status: 'COMPLETED',
                },
            }),
        ])

        const todayRevenue = todayTransactions.reduce(
            (sum, transaction) => sum + Number(transaction.total),
            0
        )

        return NextResponse.json({
            totalProducts,
            lowStockProducts,
            totalCategories,
            totalSuppliers,
            totalUsers,
            todayRevenue,
            totalTransactions: todayTransactions.length,
        })
    } catch (error) {
        console.error('Error fetching admin stats:', error)
        return NextResponse.json(
            { error: 'Failed to fetch stats' },
            { status: 500 }
        )
    }
}
