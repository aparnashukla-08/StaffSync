import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

import { connectDB } from './server/db';
import authRoutes from './server/routes/auth.routes';
import employeeRoutes from './server/routes/employee.routes';
import attendanceRoutes from './server/routes/attendance.routes';
import leaveRoutes from './server/routes/leave.routes';
import announcementRoutes from './server/routes/announcement.routes';
import dashboardRoutes from './server/routes/dashboard.routes';
import systemRoutes from './server/routes/system.routes';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const app = express();

  // Basic Security & Parsing
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Connect to Database (with graceful in-memory fallback)
  await connectDB();

  // Mount REST API endpoints
  app.use('/api/auth', authRoutes);
  app.use('/api/employees', employeeRoutes);
  app.use('/api/attendance', attendanceRoutes);
  app.use('/api/leaves', leaveRoutes);
  app.use('/api/announcements', announcementRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/system', systemRoutes);

  // Development: Vite middleware mode
  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {}
      },
      appType: 'spa'
    });

    app.use(vite.middlewares);
  } else {
    // Production: serve built static files
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));

    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✓ StaffSync Full-Stack Server running on port ${PORT} (Mode: ${process.env.NODE_ENV || 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
