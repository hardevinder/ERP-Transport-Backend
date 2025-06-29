"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const multipart_1 = __importDefault(require("@fastify/multipart"));
// Plugin
const prisma_1 = __importDefault(require("./plugins/prisma"));
// Route Modules
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const vehicle_routes_1 = __importDefault(require("./modules/vehicle/vehicle.routes"));
const driver_routes_1 = __importDefault(require("./modules/driver/driver.routes"));
const route_routes_1 = __importDefault(require("./modules/route/route.routes"));
const routeStop_routes_1 = __importDefault(require("./modules/routeStop/routeStop.routes"));
const student_routes_1 = __importDefault(require("./modules/student/student.routes"));
const feeStructure_routes_1 = __importDefault(require("./modules/transportFeeStructure/feeStructure.routes"));
const transaction_routes_1 = __importDefault(require("./modules/transportTransaction/transaction.routes"));
const feeSummary_routes_1 = __importDefault(require("./modules/transportFeeSummary/feeSummary.routes"));
const payment_routes_1 = __importDefault(require("./modules/payment/payment.routes"));
const transportOrg_routes_1 = __importDefault(require("./modules/transportOrg/transportOrg.routes"));
const class_routes_1 = __importDefault(require("./modules/class/class.routes"));
const concessionSetting_routes_1 = __importDefault(require("./modules/concessionSetting/concessionSetting.routes"));
const fineSetting_routes_1 = __importDefault(require("./modules/fineSetting/fineSetting.routes"));
const studentOptOutSlab_routes_1 = __importDefault(require("./modules/studentOptOutSlab/studentOptOutSlab.routes"));
const app = (0, fastify_1.default)();
const start = async () => {
    try {
        // 🔌 Plugins
        await app.register(multipart_1.default, { limits: { fileSize: 10 * 1024 * 1024 } });
        await app.register(cors_1.default, {
            origin: [
                'http://localhost:3001', // keep for local dev
                'https://transport.edubridgeerp.in', // allow your live frontend
            ],
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        });
        await app.register(jwt_1.default, {
            secret: process.env.JWT_SECRET || 'supersecret123',
        });
        // 🔌 Register Prisma Plugin (✅ important!)
        await app.register(prisma_1.default);
        // 🛡️ JWT Decorator
        app.decorate('authenticate', async function (request, reply) {
            try {
                await request.jwtVerify();
            }
            catch {
                reply.code(401).send({ message: 'Unauthorized' });
            }
        });
        // 📦 Routes
        await app.register(auth_routes_1.default, { prefix: '/api/auth' });
        await app.register(vehicle_routes_1.default, { prefix: '/api/vehicles' });
        await app.register(driver_routes_1.default, { prefix: '/api/drivers' });
        await app.register(route_routes_1.default, { prefix: '/api/routes' });
        await app.register(routeStop_routes_1.default, { prefix: '/api/stops' });
        await app.register(student_routes_1.default, { prefix: '/api/students' });
        await app.register(feeStructure_routes_1.default, { prefix: '/api/fee-structures' });
        await app.register(transaction_routes_1.default, { prefix: '/api/transactions' });
        await app.register(feeSummary_routes_1.default, { prefix: '/api/fee-summary' });
        await app.register(payment_routes_1.default, { prefix: '/api/payments' });
        await app.register(transportOrg_routes_1.default, { prefix: '/api/transport-org' });
        await app.register(class_routes_1.default, { prefix: '/api/classes' });
        await app.register(concessionSetting_routes_1.default, { prefix: '/api/concessions' });
        await app.register(fineSetting_routes_1.default, { prefix: '/api/fine-settings' });
        await app.register(studentOptOutSlab_routes_1.default, { prefix: '/api/opt-out-slabs' });
        // ✅ Health Check
        app.get('/', async () => ({ status: '✅ School Transport ERP API is running 🚍' }));
        // 🚀 Start Server
        console.log('⚙️ Starting server...');
        await app.listen({ port: 3000, host: '0.0.0.0' });
        console.log('🚀 Server running on http://localhost:3000');
    }
    catch (err) {
        console.error('❌ Server failed to start:', err);
        process.exit(1);
    }
};
start();
