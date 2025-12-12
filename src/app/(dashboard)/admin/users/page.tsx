'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Icons } from '@/components/icons'
import toast from 'react-hot-toast'

interface User {
    id: string
    name: string
    email: string
    role: string
    createdAt: Date
}

export default function AdminUsersPage() {
    const router = useRouter()
    const [users, setUsers] = useState<User[]>([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/users')
            if (response.ok) {
                const data = await response.json()
                setUsers(data)
            }
        } catch (error) {
            console.error('Error:', error)
            toast.error('Gagal memuat users')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Hapus user "${name}"?`)) return

        try {
            const response = await fetch(`/api/admin/users/${id}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                toast.success('User berhasil dihapus')
                fetchUsers()
            } else {
                const data = await response.json()
                toast.error(data.error || 'Gagal menghapus user')
            }
        } catch (error) {
            console.error('Error:', error)
            toast.error('Terjadi kesalahan')
        }
    }

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    )

    const getRoleBadge = (role: string) => {
        const colors = {
            ADMIN: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
            MANAGER: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
            CASHIER: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
        }
        return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-700'
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gradient">Kelola Users</h2>
                    <p className="text-muted-foreground mt-1">Manajemen pengguna sistem</p>
                </div>
                <Button className="gap-2" onClick={() => router.push('/admin/users/new')}>
                    <Icons.Add className="w-5 h-5" />
                    Tambah User
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="relative">
                        <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                        <Input
                            placeholder="Cari user (nama atau email)..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {filteredUsers.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Tidak ada user
                            </div>
                        ) : (
                            filteredUsers.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Icons.Users className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <div className="font-medium">{user.name}</div>
                                            <div className="text-sm text-muted-foreground">{user.email}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadge(user.role)}`}>
                                            {user.role}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => router.push(`/admin/users/${user.id}/edit`)}
                                        >
                                            <Icons.Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(user.id, user.name)}
                                        >
                                            <Icons.Delete className="w-4 h-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
