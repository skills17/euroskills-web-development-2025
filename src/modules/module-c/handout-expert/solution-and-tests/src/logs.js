import { prisma } from './db.js';

const LINE_START = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z)\s+\[(Info|Warning|Error)\]\s+(.*)$/;

export function parseLogs(text) {
    const lines = String(text || '').split(/\r?\n/);
    const out = [];
    let cur = null;
    for (const raw of lines) {
        console.log('parsing log line:', raw);
        const m = raw.match(LINE_START);
        if (m) {
            if (cur) out.push(cur);
            cur = {
                timestamp: m[1],
                level: m[2].toLowerCase(),
                message: m[3] || '',
            };
        } else if (cur) {
            cur.message += (cur.message ? '\n' : '') + raw;
        }
    }
    if (cur) out.push(cur);
    return out;
}

export async function upsertLogs(turbineId, entries) {
    for (const entry of entries) {
        try {
            await prisma.logEntry.create({
                data: {
                    turbineId,
                    timestamp: new Date(entry.timestamp),
                    level: entry.level,
                    message: entry.message,
                },
            });
        } catch (_e) {
            console.warn('Ignoring duplicate log entry for turbine', turbineId, 'at', entry.timestamp);
        }
    }
}
