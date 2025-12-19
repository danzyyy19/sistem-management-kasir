import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

export async function POST(req: NextRequest) {
    try {
        // Check if already seeded
        const userCount = await prisma.user.count()
        if (userCount > 0) {
            return NextResponse.json(
                { message: 'Database already seeded', userCount },
                { status: 200 }
            )
        }

        // Create users
        const admin = await prisma.user.create({
            data: {
                email: 'admin@minimarket.com',
                password: await hashPassword('admin123'),
                name: 'Admin User',
                role: 'ADMIN',
            },
        })

        const manager = await prisma.user.create({
            data: {
                email: 'manager@minimarket.com',
                password: await hashPassword('manager123'),
                name: 'Manager User',
                role: 'MANAGER',
            },
        })

        const cashier = await prisma.user.create({
            data: {
                email: 'cashier@minimarket.com',
                password: await hashPassword('cashier123'),
                name: 'Cashier User',
                role: 'CASHIER',
            },
        })

        // Create categories
        const makanan = await prisma.category.create({
            data: { name: 'Makanan' },
        })

        const minuman = await prisma.category.create({
            data: { name: 'Minuman' },
        })

        const kebutuhan = await prisma.category.create({
            data: { name: 'Kebutuhan Rumah Tangga' },
        })

        // Create suppliers
        const supplier1 = await prisma.supplier.create({
            data: {
                name: 'PT Sumber Rezeki',
                contact: 'Budi Santoso',
                phone: '081234567890',
                address: 'Jl. Raya No. 123, Jakarta',
            },
        })

        const supplier2 = await prisma.supplier.create({
            data: {
                name: 'CV Makmur Jaya',
                contact: 'Siti Aminah',
                phone: '081234567891',
                address: 'Jl. Sudirman No. 456, Bandung',
            },
        })

        // Create products
        await prisma.product.createMany({
            data: [
                {
                    name: 'Indomie Goreng',
                    sku: 'MKN-001',
                    barcode: '8992760010014',
                    price: 3000,
                    cost: 2500,
                    stock: 100,
                    minStock: 20,
                    categoryId: makanan.id,
                    supplierId: supplier1.id,
                },
                {
                    name: 'Aqua 600ml',
                    sku: 'MNM-001',
                    barcode: '8996001301142',
                    price: 3500,
                    cost: 3000,
                    stock: 80,
                    minStock: 15,
                    categoryId: minuman.id,
                    supplierId: supplier1.id,
                },
                {
                    name: 'Teh Botol Sosro',
                    sku: 'MNM-002',
                    barcode: '8996006852014',
                    price: 4000,
                    cost: 3500,
                    stock: 60,
                    minStock: 15,
                    categoryId: minuman.id,
                    supplierId: supplier2.id,
                },
                {
                    name: 'Sabun Lifebuoy',
                    sku: 'KRT-001',
                    barcode: '8999999035013',
                    price: 5000,
                    cost: 4200,
                    stock: 50,
                    minStock: 10,
                    categoryId: kebutuhan.id,
                    supplierId: supplier2.id,
                },
                {
                    name: 'Deterjen Rinso',
                    sku: 'KRT-002',
                    barcode: '8999999026011',
                    price: 15000,
                    cost: 12500,
                    stock: 30,
                    minStock: 10,
                    categoryId: kebutuhan.id,
                    supplierId: supplier1.id,
                },
            ],
        })

        const counts = {
            users: await prisma.user.count(),
            categories: await prisma.category.count(),
            suppliers: await prisma.supplier.count(),
            products: await prisma.product.count(),
        }

        return NextResponse.json({
            success: true,
            message: 'Database seeded successfully!',
            data: counts,
        })
    } catch (error) {
        console.error('Seed error:', error)
        return NextResponse.json(
            { error: 'Failed to seed database', details: String(error) },
            { status: 500 }
        )
    }
}
