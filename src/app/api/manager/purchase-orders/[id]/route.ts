import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params

        const purchaseOrder = await prisma.purchaseOrder.findUnique({
            where: { id },
            include: {
                supplier: true,
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                },
                items: {
                    include: {
                        product: true
                    }
                }
            }
        })

        if (!purchaseOrder) {
            return NextResponse.json(
                { error: 'Purchase order not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(purchaseOrder)
    } catch (error) {
        console.error('Error fetching purchase order:', error)
        return NextResponse.json(
            { error: 'Failed to fetch purchase order' },
            { status: 500 }
        )
    }
}

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params

        const token = req.cookies.get('token')?.value
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const payload = await verifyToken(token)
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { action } = body

        const po = await prisma.purchaseOrder.findUnique({
            where: { id },
            include: {
                items: true
            }
        })

        if (!po) {
            return NextResponse.json(
                { error: 'Purchase order not found' },
                { status: 404 }
            )
        }

        if (action === 'approve') {
            if (payload.role !== 'ADMIN') {
                return NextResponse.json({ error: 'Only admin can approve' }, { status: 403 })
            }

            if (po.status !== 'PENDING') {
                return NextResponse.json(
                    { error: 'Only pending PO can be approved' },
                    { status: 400 }
                )
            }

            const updated = await prisma.purchaseOrder.update({
                where: { id },
                data: { status: 'APPROVED' }
            })

            return NextResponse.json(updated)
        }

        if (action === 'receive') {
            if (payload.role !== 'ADMIN' && payload.role !== 'MANAGER') {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
            }

            if (po.status !== 'APPROVED') {
                return NextResponse.json(
                    { error: 'Only approved PO can be received' },
                    { status: 400 }
                )
            }

            await prisma.$transaction(async (tx: any) => {
                await tx.purchaseOrder.update({
                    where: { id },
                    data: { status: 'RECEIVED' }
                })

                for (const item of po.items) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: {
                            stock: {
                                increment: item.quantity
                            }
                        }
                    })
                }
            })

            const updated = await prisma.purchaseOrder.findUnique({
                where: { id },
                include: {
                    supplier: true,
                    items: {
                        include: {
                            product: true
                        }
                    }
                }
            })

            return NextResponse.json(updated)
        }

        if (action === 'cancel') {
            if (po.status === 'RECEIVED') {
                return NextResponse.json(
                    { error: 'Cannot cancel received PO' },
                    { status: 400 }
                )
            }

            const updated = await prisma.purchaseOrder.update({
                where: { id },
                data: { status: 'CANCELLED' }
            })

            return NextResponse.json(updated)
        }

        return NextResponse.json(
            { error: 'Invalid action' },
            { status: 400 }
        )
    } catch (error) {
        console.error('Error updating purchase order:', error)
        return NextResponse.json(
            { error: 'Failed to update purchase order', details: String(error) },
            { status: 500 }
        )
    }
}
