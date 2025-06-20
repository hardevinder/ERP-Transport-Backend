import { FastifyPluginAsync } from 'fastify';
import {
  createRazorpayOrder,
  verifyRazorpayPayment, // ✅ add import
} from './payment.controller';

const paymentRoutes: FastifyPluginAsync = async (fastify) => {
  // ✅ Step 1: Create Razorpay Order
  fastify.post(
    '/create-order',
    { preHandler: fastify.authenticate },
    createRazorpayOrder
  );

  // ✅ Step 2: Verify Razorpay Payment
  fastify.post(
    '/verify-payment',
    { preHandler: fastify.authenticate },
    verifyRazorpayPayment
  );
};

export default paymentRoutes;
