import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            include: {
                category: {
                    select: { name: true }
                }
            },
            orderBy: {
                stock: 'asc'
            }
        })

        return NextResponse.json(products)
    } catch (error) {
        console.error('Error fetching inventory:', error)
        return NextResponse.json(
            { error: 'Failed to fetch inventory' },
            { status: 500 }
        )
    }
}
