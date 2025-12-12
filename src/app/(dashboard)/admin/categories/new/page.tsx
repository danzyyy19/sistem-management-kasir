'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icons } from '@/components/icons'
import toast from 'react-hot-toast'

export default function AdminCategoryNewPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await fetch('/api/admin/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            })

            if (response.ok) {
                toast.success('Kategori berhasil ditambahkan')
                router.push('/admin/categories')
            } else {
                const data = await response.json()
                toast.error(data.error || 'Gagal menambahkan kategori')
            }
        } catch (error) {
            console.error('Error:', error)
            toast.error('Terjadi kesalahan')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6 animate-fade-in max-w-2xl">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.back()}>
                    <Icons.Close className="w-5 h-5" />
                </Button>
                <div>
                    <h2 className="text-3xl font-bold text-gradient">Tambah Kategori Baru</h2>
                    <p className="text-muted-foreground mt-1">Isi form untuk menambahkan kategori</p>
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
                                placeholder="Contoh: Makanan Ringan"
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
                                        Simpan Kategori
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
