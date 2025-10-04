import { Router } from 'express';
import { prisma } from '../db.js';
import { authenticate, requireRole, loginHandler } from '../auth.js';
import { badRequest, conflict, notFound } from '../problems.js';

const router = Router();

router.post('/login', loginHandler);

router.post('/assign-role', authenticate, requireRole('admin'), async (req, res) => {
    const { username, role } = req.body || {};
    if (!username || !role) return badRequest(res, 'username and role required');
    if (!['operator', 'admin'].includes(role)) return badRequest(res, 'invalid role');

    const me = req.user?.username;
    if (me === username && role !== 'admin') {
        return conflict(res, 'Admin cannot drop own admin role');
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return notFound(res, 'User not found');

    await prisma.user.update({ where: { id: user.id }, data: { role } });
    return res.status(204).end();
});

export default router;
