import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { PrismaClient } from '@prisma/client';

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

const app = Fastify();
const prisma = new PrismaClient();

// ✅ Register Plugins with CORS config
app.register(cors, {
  origin: 'http://localhost:3001', // allow frontend origin
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // ✅ allow all needed methods
});

app.register(jwt, {
  secret: process.env.JWT_SECRET || 'supersecret123',
});

// ✅ Decorators
app.decorate('prisma', prisma);
app.decorate('authenticate', async function (request, reply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.code(401).send({ message: 'Unauthorized' });
  }
});

// ✅ Register Routes
app.register(authRoutes, { prefix: '/api/auth' });
app.register(vehicleRoutes, { prefix: '/api/vehicles' });
app.register(driverRoutes, { prefix: '/api/drivers' });
app.register(routeRoutes, { prefix: '/api/routes' });
app.register(routeStopRoutes, { prefix: '/api/stops' });
app.register(studentRoutes, { prefix: '/api/students' });
app.register(feeStructureRoutes, { prefix: '/api/fee-structures' });
app.register(transactionRoutes, { prefix: '/api/transactions' });
app.register(feeSummaryRoutes, { prefix: '/api/fee-summary' });
app.register(paymentRoutes, { prefix: '/api/payments' });
app.register(transportOrgRoutes, { prefix: '/api/transport-org' });
app.register(classRoutes, { prefix: '/api/class' });
app.register(concessionRoutes, { prefix: '/api/concessions' });
app.register(fineSettingRoutes, { prefix: '/api/fine-settings' });

// ✅ Health Check Route
app.get('/', async () => {
  return { status: '✅ School Transport ERP API is running 🚍' };
});

// ✅ Start Server
const start = async () => {
  try {
    console.log('⚙️  Starting server...');
    await app.listen({ port: 3000, host: '0.0.0.0' });
    console.log('🚀 Server running on http://localhost:3000');
  } catch (err) {
    console.error('❌ Server failed to start:', err);
    process.exit(1);
  }
};

start();
