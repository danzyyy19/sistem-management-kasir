import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams
        const startDateParam = searchParams.get('startDate')
        const endDateParam = searchParams.get('endDate')
        const statusParam = searchParams.get('status')

        const now = new Date()

        // Parse filter dates or use defaults (last 7 days)
        const defaultStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
        const defaultEndDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

        const startDate = startDateParam
            ? new Date(startDateParam)
            : defaultStartDate

        const endDate = endDateParam
            ? new Date(endDateParam)
            : defaultEndDate

        // Build where clause for transactions
        const whereClause: any = {
            createdAt: {
                gte: startDate,
                lte: endDate
            }
        }

        // Add status filter if specified
        if (statusParam && statusParam !== 'ALL') {
            whereClause.status = statusParam
        }

        // Calculate summary stats (today, week, month) - always unfiltered for context
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const weekAgo = new Date(today)
        weekAgo.setDate(weekAgo.getDate() - 7)
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

        const [todaySales, weekSales, monthSales, totalCount] = await Promise.all([
            prisma.transaction.aggregate({
                where: {
                    createdAt: { gte: today },
                    status: 'COMPLETED'
                },
                _sum: { total: true }
            }),
            prisma.transaction.aggregate({
                where: {
                    createdAt: { gte: weekAgo },
                    status: 'COMPLETED'
                },
                _sum: { total: true }
            }),
            prisma.transaction.aggregate({
                where: {
                    createdAt: { gte: monthStart },
                    status: 'COMPLETED'
                },
                _sum: { total: true }
            }),
            prisma.transaction.count()
        ])

        // Get daily breakdown based on filters
        const dailySales = await prisma.transaction.groupBy({
            by: ['createdAt'],
            where: whereClause,
            _sum: { total: true },
            _count: true
        })

        // Process daily data
        const dailyData = []
        const currentDate = new Date(startDate)

        while (currentDate <= endDate) {
            const dateStr = currentDate.toISOString().split('T')[0]

            const dayData = dailySales.filter(d =>
                new Date(d.createdAt).toISOString().split('T')[0] === dateStr
            )

            const total = dayData.reduce((sum, d) => sum + Number(d._sum.total || 0), 0)
            const count = dayData.reduce((sum, d) => sum + d._count, 0)

            dailyData.push({
                date: dateStr,
                total,
                count
            })

            currentDate.setDate(currentDate.getDate() + 1)
        }

        return NextResponse.json({
            summary: {
                today: Number(todaySales._sum.total || 0),
                week: Number(weekSales._sum.total || 0),
                month: Number(monthSales._sum.total || 0),
                totalTransactions: totalCount
            },
            daily: dailyData,
            filters: {
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                status: statusParam || 'ALL'
            }
        })
    } catch (error) {
        console.error('Error fetching sales report:', error)
        return NextResponse.json(
            { error: 'Failed to fetch sales report' },
            { status: 500 }
        )
    }
}
