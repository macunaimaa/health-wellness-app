import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { requestLogger } from './middleware/requestLogger';
import { rateLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import checkinRoutes from './routes/checkin.routes';
import recommendationRoutes from './routes/recommendation.routes';
import reminderRoutes from './routes/reminder.routes';
import adminRoutes from './routes/admin.routes';
import resetRoutes from './routes/reset.routes';

const app = express();

app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true,
}));
app.use(express.json());
app.use(requestLogger);
app.use(rateLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/me', profileRoutes);
app.use('/api/me', checkinRoutes);
app.use('/api/me', recommendationRoutes);
app.use('/api/me', reminderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/me', resetRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});

export default app;
