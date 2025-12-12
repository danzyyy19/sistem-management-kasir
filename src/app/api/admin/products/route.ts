import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            include: {
                category: {
                    select: { name: true }
                },
                supplier: {
                    select: { name: true }
                }
            },
            orderBy: {
                name: 'asc'
            }
        })

        return NextResponse.json(products)
    } catch (error) {
        console.error('Error fetching products:', error)
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        )
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { name, sku, barcode, price, cost, stock, minStock, categoryId, supplierId } = body

        if (!name || !sku || !categoryId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const product = await prisma.product.create({
            data: {
                name,
                sku,
                barcode: barcode || null,
                price,
                cost,
                stock,
                minStock,
                categoryId,
                supplierId: supplierId || null,
            },
        })

        return NextResponse.json(product)
    } catch (error) {
        console.error('Error creating product:', error)
        return NextResponse.json(
            { error: 'Failed to create product' },
            { status: 500 }
        )
    }
}
