'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icons } from '@/components/icons'
import toast from 'react-hot-toast'

interface PageParams {
    params: {
        id: string
    }
}

export default function AdminCategoryEditPage({ params }: PageParams) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [loadingData, setLoadingData] = useState(true)
    const [name, setName] = useState('')

    useEffect(() => {
        fetchCategory()
    }, [params.id])

    const fetchCategory = async () => {
        try {
            const response = await fetch(`/api/admin/categories/${params.id}`)
            if (response.ok) {
                const category = await response.json()
                setName(category.name)
            }
        } catch (error) {
            console.error('Error:', error)
            toast.error('Gagal memuat kategori')
        } finally {
            setLoadingData(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await fetch(`/api/admin/categories/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            })

            if (response.ok) {
                toast.success('Kategori berhasil diupdate')
                router.push('/admin/categories')
            } else {
                const data = await response.json()
                toast.error(data.error || 'Gagal mengupdate kategori')
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
                    <h2 className="text-3xl font-bold text-gradient">Edit Kategori</h2>
                    <p className="text-muted-foreground mt-1">Update informasi kategori</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Kategori</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Kategori *</Label>
                            <Input
                                id="name"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
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
                                        Update Kategori
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
