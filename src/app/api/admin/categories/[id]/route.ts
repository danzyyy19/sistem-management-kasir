import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
    params: {
        id: string
    }
}

export async function GET(req: NextRequest, { params }: RouteParams) {
    try {
        const category = await prisma.category.findUnique({
            where: { id: params.id },
            include: {
                _count: {
                    select: { products: true }
                }
            }
        })

        if (!category) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(category)
    } catch (error) {
        console.error('Error fetching category:', error)
        return NextResponse.json(
            { error: 'Failed to fetch category' },
            { status: 500 }
        )
    }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
    try {
        const body = await req.json()
        const { name } = body

        const category = await prisma.category.update({
            where: { id: params.id },
            data: { name },
        })

        return NextResponse.json(category)
    } catch (error) {
        console.error('Error updating category:', error)
        return NextResponse.json(
            { error: 'Failed to update category' },
            { status: 500 }
        )
    }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
    try {
        const category = await prisma.category.findUnique({
            where: { id: params.id },
            include: {
                _count: {
                    select: { products: true }
                }
            }
        })

        if (category && category._count.products > 0) {
            return NextResponse.json(
                { error: 'Cannot delete category with products' },
                { status: 400 }
            )
        }

        await prisma.category.delete({
            where: { id: params.id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting category:', error)
        return NextResponse.json(
            { error: 'Failed to delete category' },
            { status: 500 }
        )
    }
}
