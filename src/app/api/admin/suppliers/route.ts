import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const suppliers = await prisma.supplier.findMany({
            include: {
                _count: {
                    select: { products: true }
                }
            },
            orderBy: {
                name: 'asc'
            }
        })

        return NextResponse.json(suppliers)
    } catch (error) {
        console.error('Error fetching suppliers:', error)
        return NextResponse.json(
            { error: 'Failed to fetch suppliers' },
            { status: 500 }
        )
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { name, contact, phone, address } = body

        if (!name) {
            return NextResponse.json(
                { error: 'Name is required' },
                { status: 400 }
            )
        }

        const supplier = await prisma.supplier.create({
            data: {
                name,
                contact: contact || null,
                phone: phone || null,
                address: address || null,
            },
        })

        return NextResponse.json(supplier)
    } catch (error) {
        console.error('Error creating supplier:', error)
        return NextResponse.json(
            { error: 'Failed to create supplier' },
            { status: 500 }
        )
    }
}
