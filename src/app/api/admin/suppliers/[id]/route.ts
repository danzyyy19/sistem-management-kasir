import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params
        const supplier = await prisma.supplier.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        products: true,
                        purchaseOrders: true,
                    }
                }
            }
        })

        if (!supplier) {
            return NextResponse.json(
                { error: 'Supplier not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(supplier)
    } catch (error) {
        console.error('Error fetching supplier:', error)
        return NextResponse.json(
            { error: 'Failed to fetch supplier' },
            { status: 500 }
        )
    }
}

export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params
        const body = await req.json()
        const { name, contact, phone, address } = body

        const supplier = await prisma.supplier.update({
            where: { id },
            data: {
                name,
                contact: contact || null,
                phone: phone || null,
                address: address || null,
            },
        })

        return NextResponse.json(supplier)
    } catch (error) {
        console.error('Error updating supplier:', error)
        return NextResponse.json(
            { error: 'Failed to update supplier' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params
        const supplier = await prisma.supplier.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { products: true }
                }
            }
        })

        if (supplier && supplier._count.products > 0) {
            return NextResponse.json(
                { error: 'Cannot delete supplier with products' },
                { status: 400 }
            )
        }

        await prisma.supplier.delete({
            where: { id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting supplier:', error)
        return NextResponse.json(
            { error: 'Failed to delete supplier' },
            { status: 500 }
        )
    }
}
