import dotenv from 'dotenv';
dotenv.config();

import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import { PrismaClient } from '@prisma/client';
import prismaPlugin from './plugins/prisma';
import fastifyStatic from '@fastify/static';
import path from 'path';

// Route Modules
import authRoutes from './modules/auth/auth.routes';
import vehicleRoutes from './modules/vehicle/vehicle.routes';
import driverRoutes from './modules/driver/driver.routes';
import routeRoutes from './modules/route/route.routes';
import routeStopRoutes from './modules/routeStop/routeStop.routes';
import studentRoutes from './modules/student/student.routes';
import feeStructureRoutes from './modules/transportFeeStructure/feeStructure.routes';
import transactionRoutes from './modules/transportTransaction/transaction.routes';
import feeSummaryRoutes from './modules/transportFeeSummary/feeSummary.routes';
import paymentRoutes from './modules/payment/payment.routes';
import transportOrgRoutes from './modules/transportOrg/transportOrg.routes';
import classRoutes from './modules/class/class.routes';
import concessionRoutes from './modules/concessionSetting/concessionSetting.routes';
import fineSettingRoutes from './modules/fineSetting/fineSetting.routes';
import studentOptOutSlabRoutes from './modules/studentOptOutSlab/studentOptOutSlab.routes';

// Extend FastifyRequest type for jwtSign (optional, helps TypeScript)
declare module 'fastify' {
  interface FastifyRequest {
    jwtSign(payload: any): Promise<string>;
  }
}

// Define custom Fastify instance interface
interface CustomFastifyInstance extends FastifyInstance {
  prisma: PrismaClient;
  authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
}

const app = Fastify() as CustomFastifyInstance;

const start = async () => {
  try {
    // 🔌 CORS
    await app.register(cors, {
      origin: (origin, cb) => {
        console.log('Origin:', origin);
        const allowedOrigins = [
          'https://lstravel.edubridgeerp.in',
          'http://localhost:3000',
          'http://localhost:3001',
        ];
        if (!origin || allowedOrigins.includes(origin)) {
          cb(null, true); // ✅ ALLOW
        } else {
          cb(new Error('Not allowed by CORS'), false); // ✅ BLOCK with explicit second arg
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    });


    // 🔐 JWT setup
    await app.register(jwt, {
      secret: process.env.JWT_SECRET || 'supersecret',
    });

    // ✅ Expose jwtSign on request object
    app.addHook('onRequest', async (req) => {
      req.jwtSign = async (payload) => {
      return app.jwt.sign(payload); // ✅ wrapped in async
    };

    });

    // 📦 Other plugins
    await app.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } });
    await app.register(prismaPlugin);

    // 🛡️ Protect routes
    app.decorate('authenticate', async function (request, reply) {
      try {
        await request.jwtVerify(); // Provided by @fastify/jwt
      } catch {
        reply.code(401).send({ message: 'Unauthorized' });
      }
    });

    // 📂 Serve static assets
    await app.register(fastifyStatic, {
      root: path.join(__dirname, '../public'),
      prefix: '/public/',
    });

    // 🔗 Routes
    await app.register(authRoutes, { prefix: '/api/auth' });
    await app.register(vehicleRoutes, { prefix: '/api/vehicles' });
    await app.register(driverRoutes, { prefix: '/api/drivers' });
    await app.register(routeRoutes, { prefix: '/api/routes' });
    await app.register(routeStopRoutes, { prefix: '/api/stops' });
    await app.register(studentRoutes, { prefix: '/api/students' });
    await app.register(feeStructureRoutes, { prefix: '/api/fee-structures' });
    await app.register(transactionRoutes, { prefix: '/api/transactions' });
    await app.register(feeSummaryRoutes, { prefix: '/api/fee-summary' });
    await app.register(paymentRoutes, { prefix: '/api/payments' });
    await app.register(transportOrgRoutes, { prefix: '/api/transport-org' });
    await app.register(classRoutes, { prefix: '/api/classes' });
    await app.register(concessionRoutes, { prefix: '/api/concessions' });
    await app.register(fineSettingRoutes, { prefix: '/api/fine-settings' });
    await app.register(studentOptOutSlabRoutes, { prefix: '/api/opt-out-slabs' });

    // ✅ Health Check
    app.get('/', async () => ({ status: '✅ School Transport ERP API is running 🚍' }));

    // 🚀 Start Server
    console.log('⚙️ Starting server...');
    const PORT = parseInt(process.env.PORT || '3000', 10);
    await app.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  } catch (err) {
    console.error('❌ Server failed to start:', err);
    process.exit(1);
  }
};

start();
