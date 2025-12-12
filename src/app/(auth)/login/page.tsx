'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import toast, { Toaster } from 'react-hot-toast'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            })

            const data = await response.json()

            if (!response.ok) {
                toast.error(data.error || 'Login gagal')
                return
            }

            toast.success('Login berhasil!')

            // Redirect based on role
            const role = data.user.role
            if (role === 'ADMIN') {
                router.push('/admin/dashboard')
            } else if (role === 'MANAGER') {
                router.push('/manager/dashboard')
            } else if (role === 'CASHIER') {
                router.push('/cashier/pos')
            }
        } catch (error) {
            console.error('Login error:', error)
            toast.error('Terjadi kesalahan. Silakan coba lagi.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary p-4">
            <Toaster position="top-center" />

            <div className="w-full max-w-md animate-fade-in">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-lg">
                        <Icons.ShoppingCart className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h1 className="text-3xl font-bold text-gradient mb-2">
                        Sistem Informasi Minimarket
                    </h1>
                    <p className="text-muted-foreground">
                        Rancangan Basis Data Minimarket
                    </p>
                </div>

                <Card className="shadow-xl">
                    <CardHeader>
                        <CardTitle>Login</CardTitle>
                        <CardDescription>
                            Masukkan email dan password Anda untuk melanjutkan
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@minimarket.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                                size="lg"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Memproses...
                                    </span>
                                ) : (
                                    'Login'
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 p-4 bg-muted rounded-lg">
                            <p className="text-sm font-medium mb-2">Default Credentials:</p>
                            <div className="text-xs space-y-1 text-muted-foreground">
                                <p><strong>Admin:</strong> admin@minimarket.com / admin123</p>
                                <p><strong>Manager:</strong> manager@minimarket.com / manager123</p>
                                <p><strong>Cashier:</strong> cashier@minimarket.com / cashier123</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <p className="text-center text-sm text-muted-foreground mt-4">
                    © 2025 Sistem Informasi Minimarket. All rights reserved.
                </p>
            </div>
        </div>
    )
}
