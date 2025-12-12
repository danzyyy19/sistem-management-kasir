import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting database seed...')

    // Create default admin user
    const adminPassword = await hash('admin123', 10)
    const admin = await prisma.user.upsert({
        where: { email: 'admin@minimarket.com' },
        update: {},
        create: {
            email: 'admin@minimarket.com',
            password: adminPassword,
            name: 'Administrator',
            role: 'ADMIN',
        },
    })
    console.log('✅ Created admin user:', admin.email)

    // Create cashier user
    const cashierPassword = await hash('cashier123', 10)
    const cashier = await prisma.user.upsert({
        where: { email: 'cashier@minimarket.com' },
        update: {},
        create: {
            email: 'cashier@minimarket.com',
            password: cashierPassword,
            name: 'Kasir Utama',
            role: 'CASHIER',
        },
    })
    console.log('✅ Created cashier user:', cashier.email)

    // Create manager user
    const managerPassword = await hash('manager123', 10)
    const manager = await prisma.user.upsert({
        where: { email: 'manager@minimarket.com' },
        update: {},
        create: {
            email: 'manager@minimarket.com',
            password: managerPassword,
            name: 'Manajer Toko',
            role: 'MANAGER',
        },
    })
    console.log('✅ Created manager user:', manager.email)

    // Create categories
    const categories = await Promise.all([
        prisma.category.upsert({
            where: { name: 'Makanan' },
            update: {},
            create: { name: 'Makanan' },
        }),
        prisma.category.upsert({
            where: { name: 'Minuman' },
            update: {},
            create: { name: 'Minuman' },
        }),
        prisma.category.upsert({
            where: { name: 'Snack' },
            update: {},
            create: { name: 'Snack' },
        }),
        prisma.category.upsert({
            where: { name: 'Kebutuhan Rumah Tangga' },
            update: {},
            create: { name: 'Kebutuhan Rumah Tangga' },
        }),
        prisma.category.upsert({
            where: { name: 'Perlengkapan Mandi' },
            update: {},
            create: { name: 'Perlengkapan Mandi' },
        }),
    ])
    console.log(`✅ Created ${categories.length} categories`)

    // Create suppliers
    const suppliers = await Promise.all([
        prisma.supplier.upsert({
            where: { id: 'supplier-1' },
            update: {},
            create: {
                id: 'supplier-1',
                name: 'PT Sumber Rejeki',
                contact: 'Budi Santoso',
                phone: '081234567890',
                address: 'Jl. Raya Industri No. 123, Jakarta',
            },
        }),
        prisma.supplier.upsert({
            where: { id: 'supplier-2' },
            update: {},
            create: {
                id: 'supplier-2',
                name: 'CV Maju Jaya',
                contact: 'Siti Nurhaliza',
                phone: '082345678901',
                address: 'Jl. Perdagangan No. 45, Bandung',
            },
        }),
    ])
    console.log(`✅ Created ${suppliers.length} suppliers`)

    // Create sample products
    const products = [
        {
            name: 'Indomie Goreng',
            sku: 'FD001',
            barcode: '8998866200011',
            description: 'Mie instan rasa goreng',
            categoryId: categories[0].id,
            supplierId: suppliers[0].id,
            price: 3500,
            cost: 2500,
            stock: 100,
            minStock: 20,
        },
        {
            name: 'Aqua 600ml',
            sku: 'BV001',
            barcode: '8993675010016',
            description: 'Air mineral dalam kemasan',
            categoryId: categories[1].id,
            supplierId: suppliers[0].id,
            price: 3000,
            cost: 2000,
            stock: 150,
            minStock: 30,
        },
        {
            name: 'Chitato Rasa Sapi Panggang',
            sku: 'SN001',
            barcode: '8992775001011',
            description: 'Keripik kentang rasa sapi panggang',
            categoryId: categories[2].id,
            supplierId: suppliers[1].id,
            price: 12000,
            cost: 9000,
            stock: 50,
            minStock: 10,
        },
        {
            name: 'Teh Botol Sosro',
            sku: 'BV002',
            barcode: '8993675001013',
            description: 'Teh dalam kemasan botol',
            categoryId: categories[1].id,
            supplierId: suppliers[0].id,
            price: 5000,
            cost: 3500,
            stock: 80,
            minStock: 15,
        },
        {
            name: 'Sabun Lifebuoy',
            sku: 'HH001',
            barcode: '8999999001018',
            description: 'Sabun mandi antiseptik',
            categoryId: categories[4].id,
            supplierId: suppliers[1].id,
            price: 3500,
            cost: 2500,
            stock: 60,
            minStock: 15,
        },
    ]

    for (const product of products) {
        await prisma.product.upsert({
            where: { sku: product.sku },
            update: {},
            create: product,
        })
    }
    console.log(`✅ Created ${products.length} products`)

    console.log('🎉 Database seed completed successfully!')
    console.log('\n📝 Default credentials:')
    console.log('Admin: admin@minimarket.com / admin123')
    console.log('Manager: manager@minimarket.com / manager123')
    console.log('Cashier: cashier@minimarket.com / cashier123')
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
