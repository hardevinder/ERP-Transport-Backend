"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordTransaction = exports.verifyRazorpayPayment = exports.createRazorpayOrder = void 0;
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
// 🔐 Razorpay Instance
const razorpay = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
// 📦 Create Razorpay Order
const createRazorpayOrder = async (req, reply) => {
    const { studentId, amount, slabs } = req.body;
    if (!studentId || !amount || !Array.isArray(slabs) || slabs.length === 0) {
        return reply.code(400).send({ message: 'Missing required fields' });
    }
    try {
        const description = slabs.map(s => s.slab).join(', ');
        const order = await razorpay.orders.create({
            amount: Math.round(amount),
            currency: 'INR',
            receipt: `rcpt_${studentId.slice(0, 6)}_${Date.now()}`,
            notes: {
                studentId,
                slabs: JSON.stringify(slabs),
            },
        });
        return reply.send({
            id: order.id,
            currency: order.currency,
            amount: order.amount,
            receipt: order.receipt,
        });
    }
    catch (err) {
        console.error('❌ Razorpay Order Creation Error:', err.message);
        return reply.code(500).send({ message: 'Order creation failed' });
    }
};
exports.createRazorpayOrder = createRazorpayOrder;
// ✅ VERIFY Razorpay Payment & Save
const verifyRazorpayPayment = async (req, reply) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, studentId, amount, slabs, } = req.body;
    if (!razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature ||
        !studentId ||
        !amount ||
        !Array.isArray(slabs) ||
        slabs.length === 0) {
        return reply.code(400).send({ message: 'Missing required fields' });
    }
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto_1.default
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');
    console.log('🔐 Verifying Razorpay Signature:', {
        received: razorpay_signature,
        expected: expectedSignature,
        match: expectedSignature === razorpay_signature,
    });
    if (expectedSignature !== razorpay_signature) {
        return reply.code(400).send({ message: 'Signature verification failed' });
    }
    try {
        const latestTxn = await req.server.prisma.transportTransaction.findFirst({
            orderBy: { slipId: 'desc' },
            select: { slipId: true },
        });
        let newSlipId = 1;
        if (latestTxn?.slipId && !isNaN(latestTxn.slipId)) {
            newSlipId = latestTxn.slipId + 1;
        }
        const slabPayments = slabs.map(s => ({
            ...s,
            dueAmount: s.amount,
            transactionId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            slipId: newSlipId.toString(),
        }));
        await (0, exports.recordTransaction)(req.server.prisma, {
            studentId,
            mode: 'online',
            status: 'success',
            slabs: slabPayments,
        });
        return reply.send({ message: '✅ Payment verified and recorded' });
    }
    catch (err) {
        console.error('❌ DB Save Error:', err.message);
        return reply.code(500).send({ message: 'DB save failed', error: err.message });
    }
};
exports.verifyRazorpayPayment = verifyRazorpayPayment;
// 💾 Save Transactions for all slabs
const recordTransaction = async (prisma, { studentId, mode, status, slabs }) => {
    if (!studentId || !mode || !status || !Array.isArray(slabs) || slabs.length === 0) {
        throw new Error('Missing required fields or empty slabs');
    }
    for (const slab of slabs) {
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
                slipId: parseInt(slab.slipId || '0'),
                createdAt: new Date(),
            },
        });
    }
};
exports.recordTransaction = recordTransaction;
