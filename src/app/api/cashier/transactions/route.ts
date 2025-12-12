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
        if (!payload || payload.role !== 'CASHIER') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const transactions = await prisma.transaction.findMany({
            where: {
                userId: payload.userId
            },
            include: {
                items: {
                    select: { quantity: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 50
        })

        return NextResponse.json(transactions)
    } catch (error) {
        console.error('Error fetching transactions:', error)
        return NextResponse.json(
            { error: 'Failed to fetch transactions' },
            { status: 500 }
        )
    }
}
