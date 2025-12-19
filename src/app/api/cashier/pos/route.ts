import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// Generate transaction number
function generateTransactionNo(): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')

    return `TRX-${year}${month}${day}-${hours}${minutes}${seconds}-${random}`
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
        const { items, total, paid, change, paymentMethod = 'CASH' } = body

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json(
                { error: 'Items are required' },
                { status: 400 }
            )
        }

        // Start a transaction
        const result = await prisma.$transaction(async (tx: any) => {
            // Create transaction with unique transaction number
            const transaction = await tx.transaction.create({
                data: {
                    transactionNo: generateTransactionNo(),
                    userId: payload.userId,
                    total: Number(total),
                    paid: Number(paid),
                    change: Number(change),
                    paymentMethod: paymentMethod,
                }
            })

            // Create transaction items and update stock
            for (const item of items) {
                await tx.transactionItem.create({
                    data: {
                        transactionId: transaction.id,
                        productId: item.productId,
                        quantity: item.quantity,
                        price: Number(item.price),
                        subtotal: Number(item.subtotal),
                    }
                })

                // Update product stock
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            decrement: item.quantity
                        }
                    }
                })
            }

            // Get full transaction with items
            const fullTransaction = await tx.transaction.findUnique({
                where: { id: transaction.id },
                include: {
                    items: {
                        include: {
                            product: true
                        }
                    }
                }
            })

            return fullTransaction
        })

        return NextResponse.json(result)
    } catch (error) {
        console.error('Error creating transaction:', error)
        return NextResponse.json(
            { error: 'Failed to create transaction', details: String(error) },
            { status: 500 }
        )
    }
}
