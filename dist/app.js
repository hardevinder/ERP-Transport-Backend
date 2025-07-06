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
const prisma_1 = __importDefault(require("./plugins/prisma"));
const static_1 = __importDefault(require("@fastify/static"));
const path_1 = __importDefault(require("path"));
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
        // 🔌 CORS
        await app.register(cors_1.default, {
            origin: (origin, cb) => {
                console.log('Origin:', origin);
                const allowedOrigins = [
                    'https://lstravel.edubridgeerp.in',
                    'http://localhost:3000',
                    'http://localhost:3001',
                ];
                if (!origin || allowedOrigins.includes(origin)) {
                    cb(null, true); // ✅ ALLOW
                }
                else {
                    cb(new Error('Not allowed by CORS'), false); // ✅ BLOCK with explicit second arg
                }
            },
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        });
        // 🔐 JWT setup
        await app.register(jwt_1.default, {
            secret: process.env.JWT_SECRET || 'supersecret',
        });
        // ✅ Expose jwtSign on request object
        app.addHook('onRequest', async (req) => {
            req.jwtSign = async (payload) => {
                return app.jwt.sign(payload); // ✅ wrapped in async
            };
        });
        // 📦 Other plugins
        await app.register(multipart_1.default, { limits: { fileSize: 10 * 1024 * 1024 } });
        await app.register(prisma_1.default);
        await app.register(static_1.default, {
            root: path_1.default.join(process.cwd(), 'public'), // ✅ This works in dev AND production
            prefix: '/public/',
            decorateReply: false,
        });
        // 🛡️ Protect routes
        app.decorate('authenticate', async function (request, reply) {
            try {
                await request.jwtVerify(); // Provided by @fastify/jwt
            }
            catch {
                reply.code(401).send({ message: 'Unauthorized' });
            }
        });
        // 📂 Serve static assets
        // 📂 Serve static assets from public folder
        // 🔗 Routes
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
        const PORT = parseInt(process.env.PORT || '3000', 10);
        await app.listen({ port: PORT, host: '0.0.0.0' });
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    }
    catch (err) {
        console.error('❌ Server failed to start:', err);
        process.exit(1);
    }
};
start();
