import bcrypt from 'bcryptjs';
import { prisma } from './db.js';

export async function ensureSeeded() {
    const count = await prisma.user.count();
    if (count > 0) return;
    const mk = (u, p, r = null) => ({ username: u, passwordHash: bcrypt.hashSync(p, 10), role: r });
    await prisma.user.createMany({
        data: [
            mk('user', 'user12345', null),
            mk('bob', 'bob12345', 'operator'),
            mk('alice', 'alice12345', 'admin'),
        ],
        skipDuplicates: true,
    });
}
