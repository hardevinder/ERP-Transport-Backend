import { FastifyPluginAsync } from 'fastify';
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from './payment.controller';

// ✅ Define schema for Razorpay Order Creation
const createOrderSchema = {
  body: {
    type: 'object',
    required: ['studentId', 'amount', 'slabs'],
    properties: {
      studentId: { type: 'string', minLength: 1 },
      amount: { type: 'number', minimum: 0 },
      slabs: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          required: ['slab', 'amount', 'feeStructureId'],
          properties: {
            slab: { type: 'string', minLength: 1 },
            amount: { type: 'number', minimum: 0 },
            feeStructureId: { type: 'string', minLength: 1 },
          },
          additionalProperties: false,
        },
      },
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
      'slabs',
    ],
    properties: {
      razorpay_order_id: { type: 'string', minLength: 1 },
      razorpay_payment_id: { type: 'string', minLength: 1 },
      razorpay_signature: { type: 'string', minLength: 1 },
      studentId: { type: 'string', minLength: 1 },
      amount: { type: 'number', minimum: 0 },
      slabs: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          required: ['slab', 'amount', 'feeStructureId'],
          properties: {
            slab: { type: 'string', minLength: 1 },
            amount: { type: 'number', minimum: 0 },
            feeStructureId: { type: 'string', minLength: 1 },
          },
          additionalProperties: false,
        },
      },
    },
    additionalProperties: false,
  },
};


// ✅ Register public payment routes (no JWT required)
const paymentRoutes: FastifyPluginAsync = async (fastify) => {
  // 🧾 Razorpay Order Creation Route (for student)
  fastify.post(
    '/create-order',
    {
      schema: createOrderSchema,
    },
    createRazorpayOrder
  );

  // ✅ Razorpay Payment Verification Route (for student)
  fastify.post(
    '/verify-payment',
    {
      schema: verifyPaymentSchema,
    },
    verifyRazorpayPayment
  );
};

export default paymentRoutes;
