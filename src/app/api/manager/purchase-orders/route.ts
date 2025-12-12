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
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const purchaseOrders = await prisma.purchaseOrder.findMany({
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
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(purchaseOrders)
    } catch (error) {
        console.error('Error fetching purchase orders:', error)
        return NextResponse.json(
            { error: 'Failed to fetch purchase orders' },
            { status: 500 }
        )
    }
}

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const payload = await verifyToken(token)
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { supplierId, items, notes } = body

        // Calculate total
        const total = items.reduce((sum: number, item: any) =>
            sum + (item.quantity * item.cost), 0
        )

        // Generate order number
        const now = new Date()
        const orderNo = `PO-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`

        const purchaseOrder = await prisma.purchaseOrder.create({
            data: {
                orderNo,
                supplierId,
                userId: payload.userId, // Use authenticated user ID
                total,
                notes: notes || null,
                items: {
                    create: items.map((item: any) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        cost: item.cost,
                        subtotal: item.quantity * item.cost
                    }))
                }
            },
            include: {
                supplier: true,
                items: {
                    include: {
                        product: true
                    }
                }
            }
        })

        return NextResponse.json(purchaseOrder)
    } catch (error) {
        console.error('Error creating purchase order:', error)
        return NextResponse.json(
            { error: 'Failed to create purchase order', details: String(error) },
            { status: 500 }
        )
    }
}
