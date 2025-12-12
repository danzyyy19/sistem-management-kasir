import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
    params: {
        id: string
    }
}

export async function GET(req: NextRequest, { params }: RouteParams) {
    try {
        const product = await prisma.product.findUnique({
            where: { id: params.id },
            include: {
                category: true,
                supplier: true,
            }
        })

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(product)
    } catch (error) {
        console.error('Error fetching product:', error)
        return NextResponse.json(
            { error: 'Failed to fetch product' },
            { status: 500 }
        )
    }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
    try {
        const body = await req.json()
        const { name, sku, barcode, price, cost, stock, minStock, categoryId, supplierId } = body

        const product = await prisma.product.update({
            where: { id: params.id },
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
        console.error('Error updating product:', error)
        return NextResponse.json(
            { error: 'Failed to update product' },
            { status: 500 }
        )
    }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
    try {
        await prisma.product.delete({
            where: { id: params.id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting product:', error)
        return NextResponse.json(
            { error: 'Failed to delete product' },
            { status: 500 }
        )
    }
}
