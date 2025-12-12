'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Icons } from '@/components/icons'
import toast from 'react-hot-toast'

interface PageParams {
    params: {
        id: string
    }
}

export default function AdminUserEditPage({ params }: PageParams) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [loadingData, setLoadingData] = useState(true)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'CASHIER',
        password: '', // Optional for edit
    })

    useEffect(() => {
        fetchUser()
    }, [params.id])

    const fetchUser = async () => {
        try {
            const response = await fetch(`/api/admin/users/${params.id}`)
            if (response.ok) {
                const user = await response.json()
                setFormData({
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    password: '',
                })
            }
        } catch (error) {
            console.error('Error:', error)
            toast.error('Gagal memuat user')
        } finally {
            setLoadingData(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const dataToSend: any = {
                name: formData.name,
                email: formData.email,
                role: formData.role,
            }

            // Only include password if it's not empty
            if (formData.password) {
                dataToSend.password = formData.password
            }

            const response = await fetch(`/api/admin/users/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend),
            })

            if (response.ok) {
                toast.success('User berhasil diupdate')
                router.push('/admin/users')
            } else {
                const data = await response.json()
                toast.error(data.error || 'Gagal mengupdate user')
            }
        } catch (error) {
            console.error('Error:', error)
            toast.error('Terjadi kesalahan')
        } finally {
            setLoading(false)
        }
    }

    if (loadingData) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-fade-in max-w-2xl">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.back()}>
                    <Icons.Close className="w-5 h-5" />
                </Button>
                <div>
                    <h2 className="text-3xl font-bold text-gradient">Edit User</h2>
                    <p className="text-muted-foreground mt-1">Update informasi user</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Informasi User</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Lengkap *</Label>
                            <Input
                                id="name"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                minLength={6}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="Kosongkan jika tidak ingin mengubah"
                            />
                            <p className="text-xs text-muted-foreground">
                                Kosongkan jika tidak ingin mengubah password
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">Role *</Label>
                            <Select
                                id="role"
                                required
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            >
                                <option value="CASHIER">Cashier</option>
                                <option value="MANAGER">Manager</option>
                                <option value="ADMIN">Admin</option>
                            </Select>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button type="submit" disabled={loading} className="gap-2">
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Icons.Save className="w-4 h-4" />
                                        Update User
                                    </>
                                )}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => router.back()}>
                                Batal
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    )
}
