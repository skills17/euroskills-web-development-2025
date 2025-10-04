import { prisma } from './db.js';

export async function evaluateHighRpmForTurbine(turbine) {
    // turbine: external single item with rpm and id
    const rpm = turbine?.rpm;
    if (rpm == null) return; // nothing to do
    const type = 'HighRPM';
    const existing = await prisma.alert.findUnique({ where: { turbineId_type: { turbineId: turbine.id, type } } });

    if (rpm > 60) {
        if (!existing) {
            await prisma.alert.create({
                data: { turbineId: turbine.id, type, status: 'firing', acknowledged: 'unacknowledged' },
            });
        } else if (existing.status !== 'firing') {
            await prisma.alert.update({ where: { id: existing.id }, data: { status: 'firing' } });
        }
    } else {
        if (existing && existing.status === 'firing') {
            await prisma.alert.update({ where: { id: existing.id }, data: { status: 'resolved' } });
        }
    }
}
