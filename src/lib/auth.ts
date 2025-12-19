import { SignJWT, jwtVerify } from 'jose'
import { hash, compare } from 'bcryptjs'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key')

export interface TokenPayload {
    userId: string
    email: string
    role: string
    name: string
    [key: string]: unknown
}

export async function hashPassword(password: string): Promise<string> {
    return await hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await compare(password, hashedPassword)
}

export async function createToken(payload: TokenPayload): Promise<string> {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(secret)
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
    try {
        const { payload } = await jwtVerify(token, secret)
        return payload as unknown as TokenPayload
    } catch {
        return null
    }
}

export function getRolePermissions(role: string) {
    const permissions = {
        ADMIN: ['*'], // Full access
        MANAGER: [
            'inventory:read',
            'inventory:write',
            'purchase:read',
            'purchase:write',
            'reports:read',
            'products:read',
        ],
        CASHIER: [
            'pos:read',
            'pos:write',
            'transactions:read',
            'products:read',
        ],
    }
    return permissions[role as keyof typeof permissions] || []
}

export function hasPermission(userRole: string, permission: string): boolean {
    const permissions = getRolePermissions(userRole)
    return permissions.includes('*') || permissions.includes(permission)
}
