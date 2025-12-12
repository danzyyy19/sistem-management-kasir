import * as React from 'react'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> { }

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className = '', children, ...props }, ref) => {
        return (
            <select
                className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>option]:bg-background [&>option]:text-foreground dark:[&>option]:bg-background dark:[&>option]:text-foreground ${className}`}
                style={{
                    colorScheme: 'dark light'
                }}
                ref={ref}
                {...props}
            >
                {children}
            </select>
        )
    }
)
Select.displayName = 'Select'

export { Select }
