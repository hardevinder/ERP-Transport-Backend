import Razorpay from 'razorpay';
import crypto from 'crypto';
import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';

// Interfaces
interface CreateOrderBody {
  studentId: string;
  amount: number;        // Final amount in paise
  slab: string;
  feeStructureId: string;
}

interface VerifyPaymentBody {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  studentId: string;
  amount: number;        // Final amount in ₹
  slab: string;
  feeStructureId: string;
}

interface SlabPayment {
  feeStructureId: string;
  amount: number;            // Final paid ₹
  dueAmount: number;         // Original due ₹
  paymentDate?: string;
  concession?: number;
  fineConcession?: number;
  transactionId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  slab?: string;
  slipId?: string;
}

interface RecordTransactionBody {
  studentId: string;
  mode: string;
  status: 'success' | 'pending' | 'failed';
  slabs: SlabPayment[];
}

// 🔐 Razorpay Instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// 📦 Create Razorpay Order
export const createRazorpayOrder = async (
  req: FastifyRequest<{ Body: CreateOrderBody }>,
  reply: FastifyReply
) => {
  const { studentId, amount, slab, feeStructureId } = req.body;

  if (!studentId || !amount || !slab || !feeStructureId) {
    return reply.code(400).send({ message: 'Missing required fields' });
  }

  try {
    const order = await razorpay.orders.create({
      amount: Math.round(amount), // already in paise
      currency: 'INR',
      receipt: `rcpt_${studentId.slice(0, 6)}_${Date.now()}`,
      notes: { studentId, slab, feeStructureId },
    });

    return reply.send({
      id: order.id,
      currency: order.currency,
      amount: order.amount,
      receipt: order.receipt,
    });
  } catch (err: any) {
    console.error('❌ Razorpay Order Creation Error:', err.message);
    return reply.code(500).send({ message: 'Order creation failed' });
  }
};

// ✅ VERIFY Razorpay Payment & Save
export const verifyRazorpayPayment = async (
  req: FastifyRequest<{ Body: VerifyPaymentBody }>,
  reply: FastifyReply
) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    studentId,
    amount,
    slab,
    feeStructureId,
  } = req.body;

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !studentId ||
    !amount ||
    !slab ||
    !feeStructureId
  ) {
    return reply.code(400).send({ message: 'Missing required fields' });
  }

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest('hex');

  console.log("🔐 Verifying Razorpay Signature:", {
    received: razorpay_signature,
    expected: expectedSignature,
    match: expectedSignature === razorpay_signature,
  });

  if (expectedSignature !== razorpay_signature) {
    return reply.code(400).send({ message: 'Signature verification failed' });
  }

  try {
    // Get latest slipId
    const latestTxn = await req.server.prisma.transportTransaction.findFirst({
      orderBy: { slipId: 'desc' },
      select: { slipId: true },
    });

    let newSlipId = 1;
    if (latestTxn?.slipId) {
      const last = latestTxn.slipId; // or
      // const last = parseInt(String(latestTxn.slipId));

      if (!isNaN(last)) newSlipId = last + 1;
    }
    const slipId = newSlipId.toString();

    await recordTransaction(req.server.prisma, {
      studentId,
      mode: 'online',
      status: 'success',
      slabs: [
        {
          feeStructureId,
          amount,
          dueAmount: amount,
          slab,
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          transactionId: razorpay_payment_id,
          slipId,
        },
      ],
    });

    return reply.send({ message: '✅ Payment verified and recorded' });
  } catch (err: any) {
    console.error('❌ DB Save Error:', err.message);
    return reply.code(500).send({ message: 'DB save failed', error: err.message });
  }
};

// ✅ Transaction Save Logic
export const recordTransaction = async (
  prisma: PrismaClient,
  { studentId, mode, status, slabs }: RecordTransactionBody
): Promise<void> => {
  if (!studentId || !mode || !status || !Array.isArray(slabs) || slabs.length === 0) {
    throw new Error('Missing required fields or empty slabs');
  }

  for (const slab of slabs) {
    // 🔥 Auto-generate next slip ID
    const maxSlip = await prisma.transportTransaction.aggregate({
      _max: { slipId: true },
    });

    const newSlipId = (maxSlip._max.slipId || 0) + 1;

    await prisma.transportTransaction.create({
      data: {
        studentId,
        amount: slab.amount,
        dueAmount: slab.dueAmount,
        feeStructureId: slab.feeStructureId,
        slab: slab.slab || '',
        paymentDate: new Date(),
        status,
        mode,
        concession: slab.concession || 0,
        fineConcession: slab.fineConcession || 0,
        transactionId: slab.transactionId || undefined,
        razorpayOrderId: slab.razorpayOrderId || undefined,
        razorpayPaymentId: slab.razorpayPaymentId || undefined,
        slipId: newSlipId, // ✅ Correctly set slipId as number
        createdAt: new Date(),
      },
    });
  }
};
