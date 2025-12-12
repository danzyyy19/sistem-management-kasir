import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const transactions = await prisma.transaction.findMany({
            include: {
                user: {
                    select: { name: true }
                },
                items: {
                    select: { quantity: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 100
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
