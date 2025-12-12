'use client'

import { useEffect, useState } from 'react'
import { Icons } from '@/components/icons'

export function ThemeToggle() {
    const [theme, setTheme] = useState<'light' | 'dark'>('light')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        // Check for saved theme preference or default to 'light'
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light')

        setTheme(initialTheme)
        applyTheme(initialTheme)
    }, [])

    const applyTheme = (newTheme: 'light' | 'dark') => {
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light'
        setTheme(newTheme)
        localStorage.setItem('theme', newTheme)
        applyTheme(newTheme)
    }

    if (!mounted) {
        return null
    }

    return (
        <button
            onClick={toggleTheme}
            className="relative p-2 rounded-lg bg-secondary hover:bg-accent transition-colors duration-200"
            aria-label="Toggle theme"
        >
            <div className="relative w-6 h-6">
                <Icons.Sun
                    className={`absolute inset-0 transition-all duration-300 ${theme === 'light' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-0'
                        }`}
                />
                <Icons.Moon
                    className={`absolute inset-0 transition-all duration-300 ${theme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
                        }`}
                />
            </div>
        </button>
    )
}
