import * as React from 'react'
import { Input } from './input'

export interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
    value?: number
    onValueChange?: (value: number) => void
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
    ({ value = 0, onValueChange, className = '', ...props }, ref) => {
        const [displayValue, setDisplayValue] = React.useState('')

        React.useEffect(() => {
            if (value !== undefined && value !== null) {
                setDisplayValue(formatCurrency(value))
            }
        }, [value])

        const formatCurrency = (num: number): string => {
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
        }

        const parseCurrency = (str: string): number => {
            const cleaned = str.replace(/\./g, '')
            return parseInt(cleaned) || 0
        }

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const inputValue = e.target.value
            // Only allow numbers and dots
            const cleaned = inputValue.replace(/[^\d]/g, '')

            if (cleaned === '') {
                setDisplayValue('')
                onValueChange?.(0)
                return
            }

            const numericValue = parseInt(cleaned)
            setDisplayValue(formatCurrency(numericValue))
            onValueChange?.(numericValue)
        }

        return (
            <Input
                {...props}
                ref={ref}
                type="text"
                inputMode="numeric"
                value={displayValue}
                onChange={handleChange}
                className={className}
            />
        )
    }
)

CurrencyInput.displayName = 'CurrencyInput'

export { CurrencyInput }
