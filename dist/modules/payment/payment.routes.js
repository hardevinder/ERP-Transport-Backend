"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const payment_controller_1 = require("./payment.controller");
// ✅ Define schema for Razorpay Order Creation
const createOrderSchema = {
    body: {
        type: 'object',
        required: ['studentId', 'amount', 'slab', 'feeStructureId'],
        properties: {
            studentId: { type: 'string', minLength: 1 },
            amount: { type: 'number', minimum: 0 },
            slab: { type: 'string', minLength: 1 },
            feeStructureId: { type: 'string', minLength: 1 },
        },
        additionalProperties: false,
    },
};
// ✅ Define schema for Razorpay Payment Verification
const verifyPaymentSchema = {
    body: {
        type: 'object',
        required: [
            'razorpay_order_id',
            'razorpay_payment_id',
            'razorpay_signature',
            'studentId',
            'amount',
            'slab',
            'feeStructureId',
        ],
        properties: {
            razorpay_order_id: { type: 'string', minLength: 1 },
            razorpay_payment_id: { type: 'string', minLength: 1 },
            razorpay_signature: { type: 'string', minLength: 1 },
            studentId: { type: 'string', minLength: 1 },
            amount: { type: 'number', minimum: 0 },
            slab: { type: 'string', minLength: 1 },
            feeStructureId: { type: 'string', minLength: 1 },
        },
        additionalProperties: false,
    },
};
// ✅ Register public payment routes (no JWT required)
const paymentRoutes = async (fastify) => {
    // 🧾 Razorpay Order Creation Route (for student)
    fastify.post('/create-order', {
        schema: createOrderSchema,
    }, payment_controller_1.createRazorpayOrder);
    // ✅ Razorpay Payment Verification Route (for student)
    fastify.post('/verify-payment', {
        schema: verifyPaymentSchema,
    }, payment_controller_1.verifyRazorpayPayment);
};
exports.default = paymentRoutes;
