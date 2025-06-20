import Razorpay from 'razorpay';
import crypto from 'crypto';
import { FastifyRequest, FastifyReply } from 'fastify';

// ✅ Razorpay instance setup
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// ✅ Create Order API (for opening Razorpay popup)
export const createRazorpayOrder = async (req: FastifyRequest, reply: FastifyReply) => {
  const { studentId, amount } = req.body as { studentId: string; amount: number };

  if (!studentId || !amount) {
    console.warn('❌ studentId or amount missing:', { studentId, amount });
    return reply.code(400).send({ message: 'studentId and amount are required' });
  }

  try {
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `rcpt_${studentId.slice(0, 8)}_${Date.now()}`, // ✅ Shorter receipt to stay under 40 chars
    };

    console.log('📦 Creating Razorpay order with options:', options);

    const order = await razorpay.orders.create(options);

    console.log('✅ Razorpay Order Created:', order);

    reply.send({
      id: order.id,
      currency: order.currency,
      amount: order.amount,
    });
  } catch (error) {
    console.error('❌ Razorpay Order Creation Error:', error);
    reply.code(500).send({
      message: 'Failed to create order',
      error: (error as Error).message,
    });
  }
};

// ✅ Verify Payment API (after payment success)
export const verifyRazorpayPayment = async (req: FastifyRequest, reply: FastifyReply) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    studentId,
    amount,
  } = req.body as {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    studentId: string;
    amount: number;
  };

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    console.warn('❌ Invalid signature:', { expectedSignature, razorpay_signature });
    return reply.code(400).send({ message: 'Invalid signature. Payment verification failed.' });
  }

  try {
    // ✅ Save successful payment
    await req.server.prisma.transportTransaction.create({
      data: {
        studentId,
        amount,
        mode: 'online',
        status: 'success',
        paymentDate: new Date(),
        createdAt: new Date(),
      },
    });

    reply.send({ message: 'Payment verified and recorded successfully.' });
  } catch (error) {
    console.error('❌ Failed to save payment:', error);
    reply.code(500).send({ message: 'Failed to save payment', error: (error as Error).message });
  }
};
