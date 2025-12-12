'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'

export default function CashierPerformanceReportPage() {
    const router = useRouter()

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.back()}>
                    <Icons.Close className="w-5 h-5" />
                </Button>
                <div>
                    <h2 className="text-3xl font-bold text-gradient">Kinerja Kasir</h2>
                    <p className="text-muted-foreground mt-1">Laporan performa kasir</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Performa Kasir Bulan Ini</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                        <Icons.Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>Laporan akan tersedia setelah ada transaksi</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
