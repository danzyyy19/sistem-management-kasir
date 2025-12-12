import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const weekAgo = new Date(today)
        weekAgo.setDate(weekAgo.getDate() - 7)

        // Get today's sales (PENDAPATAN BERSIH = total, bukan paid)
        const todaySales = await prisma.transaction.aggregate({
            where: {
                createdAt: { gte: today }
            },
            _sum: { total: true }, // PENDAPATAN BERSIH
            _count: true
        })

        // Get this week's sales
        const weekSales = await prisma.transaction.aggregate({
            where: {
                createdAt: { gte: weekAgo }
            },
            _sum: { total: true } // PENDAPATAN BERSIH
        })

        // Get this month's sales
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        const monthSales = await prisma.transaction.aggregate({
            where: {
                createdAt: { gte: monthStart }
            },
            _sum: { total: true } // PENDAPATAN BERSIH
        })

        // Get all transactions count
        const totalCount = await prisma.transaction.count()

        // Get daily sales for last 7 days
        const dailySales = await prisma.transaction.groupBy({
            by: ['createdAt'],
            where: {
                createdAt: { gte: weekAgo }
            },
            _sum: { total: true }, // PENDAPATAN BERSIH
            _count: true
        })

        // Process daily data
        const dailyData = []
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today)
            date.setDate(date.getDate() - i)
            const dateStr = date.toISOString().split('T')[0]

            const dayData = dailySales.filter(d =>
                new Date(d.createdAt).toISOString().split('T')[0] === dateStr
            )

            const total = dayData.reduce((sum, d) => sum + Number(d._sum.total || 0), 0)
            const count = dayData.reduce((sum, d) => sum + d._count, 0)

            dailyData.push({
                date: dateStr,
                total, // PENDAPATAN BERSIH
                count
            })
        }

        return NextResponse.json({
            summary: {
                today: Number(todaySales._sum.total || 0), // PENDAPATAN BERSIH
                week: Number(weekSales._sum.total || 0), // PENDAPATAN BERSIH
                month: Number(monthSales._sum.total || 0), // PENDAPATAN BERSIH
                totalTransactions: totalCount
            },
            daily: dailyData
        })
    } catch (error) {
        console.error('Error fetching sales report:', error)
        return NextResponse.json(
            { error: 'Failed to fetch sales report' },
            { status: 500 }
        )
    }
}
