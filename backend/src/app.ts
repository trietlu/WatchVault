import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import watchRoutes from './routes/watch.routes.js';
import publicRoutes from './routes/public.routes.js';
import fileRoutes from './routes/file.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/watches', watchRoutes);
app.use('/passports', publicRoutes);
app.use('/files', fileRoutes);
app.use('/uploads', express.static('uploads'));

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

export default app;
