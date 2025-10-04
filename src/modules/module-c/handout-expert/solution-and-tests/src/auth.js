import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from './db.js';
import { unauthorized, forbidden } from './problems.js';

export function signToken(payload) {
    const secret = process.env.JWT_SECRET || 'dev-secret-change-me';
    const ttl = Number(process.env.TOKEN_TTL_SECONDS || 86400);
    return jwt.sign(payload, secret, { expiresIn: ttl });
}

export function verifyToken(token) {
    const secret = process.env.JWT_SECRET || 'dev-secret-change-me';
    return jwt.verify(token, secret);
}

export async function authenticate(req, res, next) {
    const hdr = req.headers['authorization'] || '';
    const m = hdr.match(/^Bearer\s+(.+)$/i);
    if (!m) return unauthorized(res, 'Missing bearer token');
    try {
        const decoded = verifyToken(m[1]);
        req.user = decoded; // { id, username, role }
        return next();
    } catch (_e) {
        return unauthorized(res, 'Invalid or expired token');
    }
}

export function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) return unauthorized(res);
        if (!roles.length) return next();
        if (roles.includes(req.user.role)) return next();
        return forbidden(res, 'Insufficient privileges');
    };
}

export async function loginHandler(req, res) {
    const { username, password } = req.body || {};
    if (!username || !password) {
        res.setHeader('Content-Type', 'application/problem+json');
        return res.status(422).json({
            type: 'https://example.com/problems/validation',
            title: 'Validation Error',
            status: 422,
            errors: { username: !username ? 'required' : undefined, password: !password ? 'required' : undefined },
        });
    }
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return unauthorized(res, 'Invalid credentials');
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return unauthorized(res, 'Invalid credentials');
    const token = signToken({ id: user.id, username: user.username, role: user.role ?? 'anonymous' });
    res.json({ token, role: user.role ?? 'anonymous' });
}
