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
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const now = new Date()
        const weekAgo = new Date(now)
        weekAgo.setDate(weekAgo.getDate() - 7)

        // Get daily sales for last 7 days
        const transactions = await prisma.transaction.findMany({
            where: {
                createdAt: { gte: weekAgo }
            },
            select: {
                total: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'asc'
            }
        })

        // Group by date
        const salesByDate: { [key: string]: number } = {}
        transactions.forEach(t => {
            const date = new Date(t.createdAt).toISOString().split('T')[0]
            salesByDate[date] = (salesByDate[date] || 0) + Number(t.total)
        })

        // Format for chart
        const chartData = Object.entries(salesByDate).map(([date, total]) => ({
            date,
            total
        }))

        // Get this month stats
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        const monthStats = await prisma.transaction.aggregate({
            where: { createdAt: { gte: monthStart } },
            _sum: { total: true },
            _count: true
        })

        return NextResponse.json({
            chartData,
            monthTotal: Number(monthStats._sum.total || 0),
            monthTransactions: monthStats._count
        })
    } catch (error) {
        console.error('Error fetching sales report:', error)
        return NextResponse.json(
            { error: 'Failed to fetch sales report' },
            { status: 500 }
        )
    }
}
