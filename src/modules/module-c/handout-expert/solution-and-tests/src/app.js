import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { ensureSeeded } from './seed.js';
import authRouter from './routes/auth.js';
import turbinesRouter from './routes/turbines.js';
import alertsRouter from './routes/alerts.js';
import { problemHandler, notFound } from './problems.js';

const app = express();
app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

// Seed default users (hashed) if missing
ensureSeeded().catch((e) => {
    console.error('Seeding failed:', e);
});

app.use('/auth', authRouter);
app.use('/turbines', turbinesRouter);
app.use('/alerts', alertsRouter);

// Health (optional, not in spec)
app.get('/__health', (_req, res) => res.json({ ok: true }));

// 404 → Problem JSON
app.use((req, res, next) => {
    if (res.headersSent) return next();
    return notFound(res, `Route ${req.method} ${req.path} not found`);
});

// Central error handler → Problem+JSON
app.use(problemHandler);

export default app;
