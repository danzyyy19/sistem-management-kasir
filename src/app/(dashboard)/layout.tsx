'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import toast, { Toaster } from 'react-hot-toast'

interface User {
    id: string
    email: string
    name: string
    role: string
}

const roleMenus = {
    ADMIN: [
        { name: 'Dashboard', href: '/admin/dashboard', icon: Icons.Dashboard },
        { name: 'Produk', href: '/admin/products', icon: Icons.Products },
        { name: 'Kategori', href: '/admin/categories', icon: Icons.Categories },
        { name: 'Users', href: '/admin/users', icon: Icons.Users },
        { name: 'Supplier', href: '/admin/suppliers', icon: Icons.Suppliers },
        { name: 'Purchase Orders', href: '/admin/purchase-orders', icon: Icons.Inventory },
        { name: 'Transaksi', href: '/admin/transactions', icon: Icons.Transactions },
        { name: 'Laporan', href: '/admin/reports', icon: Icons.Reports },
    ],
    MANAGER: [
        { name: 'Dashboard', href: '/manager/dashboard', icon: Icons.Dashboard },
        { name: 'Inventory', href: '/manager/inventory', icon: Icons.Inventory },
        { name: 'Purchase Orders', href: '/manager/purchase-orders', icon: Icons.Products },
        { name: 'Laporan Penjualan', href: '/manager/sales-reports', icon: Icons.Reports },
    ],
    CASHIER: [
        { name: 'Point of Sale', href: '/cashier/pos', icon: Icons.ShoppingCart },
        { name: 'Riwayat Transaksi', href: '/cashier/transactions', icon: Icons.Transactions },
    ],
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const pathname = usePathname()
    const [user, setUser] = useState<User | null>(null)
    const [sidebarOpen, setSidebarOpen] = useState(false) // Mobile-first: closed by default
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch('/api/auth/me')
                if (!response.ok) {
                    router.push('/login')
                    return
                }
                const data = await response.json()
                setUser(data.user)
            } catch (error) {
                console.error('Error fetching user:', error)
                router.push('/login')
            } finally {
                setLoading(false)
            }
        }

        fetchUser()
    }, [router])

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setSidebarOpen(false)
    }, [pathname])

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' })
            toast.success('Logout berhasil')
            router.push('/login')
        } catch (error) {
            console.error('Logout error:', error)
            toast.error('Logout gagal')
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    const menus = roleMenus[user.role as keyof typeof roleMenus] || []

    return (
        <div className="min-h-screen bg-background">
            <Toaster position="top-center" />

            {/* Backdrop Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-40 h-screen transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:translate-x-0 bg-card border-r border-border shadow-lg w-[280px] opacity-100`}
                style={{ backgroundColor: 'hsl(var(--card))' }}
            >
                <div className="h-full px-3 py-4 overflow-y-auto flex flex-col bg-card opacity-100" style={{ backgroundColor: 'hsl(var(--card))' }}>
                    {/* Logo & Close Button */}
                    <div className="flex items-center justify-between gap-3 px-3 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                                <Icons.ShoppingCart className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <div>
                                <h2 className="font-bold text-lg">Minimarket</h2>
                                <p className="text-xs text-muted-foreground">{user.role}</p>
                            </div>
                        </div>
                        {/* Close button for mobile */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <Icons.Close className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Navigation */}
                    <ul className="space-y-2 font-medium flex-1">
                        {menus.map((menu) => {
                            const Icon = menu.icon
                            const isActive = pathname === menu.href

                            return (
                                <li key={menu.href}>
                                    <a
                                        href={menu.href}
                                        className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${isActive
                                            ? 'bg-primary text-primary-foreground shadow-md'
                                            : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span>{menu.name}</span>
                                    </a>
                                </li>
                            )
                        })}
                    </ul>

                    {/* User Section */}
                    <div className="pt-4 border-t border-border space-y-2">
                        <div className="px-3 py-2">
                            <p className="text-sm font-medium truncate">{user.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3"
                            onClick={handleLogout}
                        >
                            <Icons.Logout className="w-5 h-5" />
                            <span>Logout</span>
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="lg:ml-[280px]">
                {/* Header */}
                <header className="sticky top-0 z-20 bg-card border-b border-border shadow-sm">
                    <div className="flex items-center justify-between px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="lg:hidden"
                            >
                                <Icons.Menu className="w-5 h-5" />
                            </Button>
                            <h1 className="text-lg sm:text-xl font-semibold truncate">
                                {menus.find(m => m.href === pathname)?.name || 'Dashboard'}
                            </h1>
                        </div>

                        <div className="flex items-center gap-3">
                            <ThemeToggle />
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 sm:p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
