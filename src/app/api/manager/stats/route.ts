import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const payload = await verifyToken(token)
        if (!payload || payload.role !== 'MANAGER') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

        // Get today's sales
        const todaySales = await prisma.transaction.aggregate({
            where: { createdAt: { gte: today } },
            _sum: { total: true },
            _count: true
        })

        // Get this month's sales
        const monthSales = await prisma.transaction.aggregate({
            where: { createdAt: { gte: monthStart } },
            _sum: { total: true },
            _count: true
        })

        // Get low stock count
        const lowStockCount = await prisma.product.count({
            where: {
                stock: {
                    lte: prisma.product.fields.minStock
                }
            }
        })

        // Get total products
        const totalProducts = await prisma.product.count()

        return NextResponse.json({
            todaySales: Number(todaySales._sum.total || 0),
            todayTransactions: todaySales._count,
            monthSales: Number(monthSales._sum.total || 0),
            monthTransactions: monthSales._count,
            lowStockCount,
            totalProducts
        })
    } catch (error) {
        console.error('Error fetching manager stats:', error)
        return NextResponse.json(
            { error: 'Failed to fetch stats' },
            { status: 500 }
        )
    }
}
