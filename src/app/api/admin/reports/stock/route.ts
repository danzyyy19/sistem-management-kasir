import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        // Get products with low stock
        const lowStockProducts = await prisma.product.findMany({
            where: {
                stock: {
                    lte: prisma.product.fields.minStock
                }
            },
            include: {
                category: {
                    select: { name: true }
                }
            },
            orderBy: {
                stock: 'asc'
            }
        })

        return NextResponse.json({
            lowStock: lowStockProducts,
            count: lowStockProducts.length
        })
    } catch (error) {
        console.error('Error fetching stock report:', error)
        return NextResponse.json(
            { error: 'Failed to fetch stock report' },
            { status: 500 }
        )
    }
}
