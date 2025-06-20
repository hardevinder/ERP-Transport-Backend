import { FastifyRequest, FastifyReply } from 'fastify';

interface RecordTransactionBody {
  studentId: string;
  amount: number;
  mode: string; // "cash", "online", etc.
  status: 'success' | 'failed' | 'pending';
  paymentDate?: string;
  concession?: number;
  fineConcession?: number;
}

// 📌 CREATE
export const recordTransaction = async (req: FastifyRequest, reply: FastifyReply) => {
  const body = req.body as RecordTransactionBody;

  if (!body.studentId || !body.amount || !body.mode || !body.status) {
    return reply.code(400).send({ message: 'Missing required fields' });
  }

  const now = new Date();

  try {
    const student = await req.server.prisma.student.findUnique({
      where: { id: body.studentId },
      include: { route: true, stop: true, concession: true },
    });

    if (!student || !student.routeId) {
      return reply.code(404).send({ message: 'Student or route not found' });
    }

    const feeStructure = await req.server.prisma.transportFeeStructure.findFirst({
      where: {
        routeId: student.routeId,
        stopId: student.stopId || undefined,
        slab: student.feeSlab,
        effectiveFrom: { lte: now },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: now } }],
      },
      orderBy: { effectiveFrom: 'desc' },
    });

    const dueAmount = feeStructure?.amount || 0;

    let concession = 0;
    if (body.concession !== undefined) {
      concession = body.concession;
    } else if (student.concession) {
      concession = student.concession.type === 'percentage'
        ? (dueAmount * student.concession.value) / 100
        : student.concession.value;
    }

    const fineSetting = await req.server.prisma.fineSetting.findFirst();
    let fine = 0;
    if (fineSetting) {
      const applyDay = fineSetting.applyFrom;
      const today = new Date().getDate();
      if (today >= applyDay) {
        fine = fineSetting.duration === 'per_day'
          ? ((today - applyDay + 1) * fineSetting.amount)
          : fineSetting.amount;
      }
    }

    const fineConcession = body.fineConcession ?? null;
    const finalFine = fineConcession !== null ? 0 : fine;

    // 🔁 Check already paid this month
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const paid = await req.server.prisma.transportTransaction.aggregate({
      _sum: { amount: true },
      where: {
        studentId: body.studentId,
        status: 'success',
        paymentDate: { gte: monthStart, lt: monthEnd },
      },
    });

    const paidAmount = paid._sum.amount || 0;
    const pendingAmount = Math.max(dueAmount - concession + finalFine - paidAmount, 0);

    const transaction = await req.server.prisma.transportTransaction.create({
      data: {
        studentId: body.studentId,
        amount: body.amount,
        dueAmount,
        concession,
        fine: finalFine,
        fineConcession,
        mode: body.mode,
        status: body.status,
        paymentDate: body.paymentDate ? new Date(body.paymentDate) : now,
        createdAt: now,
      },
    });

    reply.code(201).send({
      message: 'Transaction recorded',
      transaction,
      summary: {
        dueAmount,
        concession,
        fine,
        fineConcession,
        finalFine,
        finalPayable: dueAmount - concession + finalFine,
        paidAmount,
        pendingAmount,
        receivedAmount: body.amount,
      },
    });
  } catch (error) {
    reply.code(500).send({ message: 'Failed to record transaction', error: (error as Error).message });
  }
};

// 📥 READ ALL
export const getTransactions = async (req: FastifyRequest, reply: FastifyReply) => {
  const query = req.query as { studentId?: string; limit?: string; offset?: string; status?: string };

  const whereClause: any = {};
  if (query.studentId) whereClause.studentId = query.studentId;
  if (query.status) whereClause.status = query.status;

  const take = query.limit ? Number(query.limit) : 50;
  const skip = query.offset ? Number(query.offset) : 0;

  try {
    const [transactions, totalCount] = await Promise.all([
      req.server.prisma.transportTransaction.findMany({
        where: whereClause,
        orderBy: { paymentDate: 'desc' },
        take,
        skip,
      }),
      req.server.prisma.transportTransaction.count({ where: whereClause }),
    ]);

    reply.send({ transactions, totalCount });
  } catch (error) {
    reply.code(500).send({ message: 'Failed to fetch transactions', error: (error as Error).message });
  }
};

// 📥 READ ONE
export const getTransactionById = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as { id: string };

  try {
    const transaction = await req.server.prisma.transportTransaction.findUnique({ where: { id } });
    if (!transaction) return reply.code(404).send({ message: 'Transaction not found' });
    reply.send(transaction);
  } catch (error) {
    reply.code(500).send({ message: 'Failed to fetch transaction', error: (error as Error).message });
  }
};

// ✏️ UPDATE
export const updateTransaction = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as { id: string };
  const body = req.body as Partial<RecordTransactionBody>;

  try {
    const updated = await req.server.prisma.transportTransaction.update({
      where: { id },
      data: {
        ...body,
        paymentDate: body.paymentDate ? new Date(body.paymentDate) : undefined,
      },
    });

    reply.send({ message: 'Transaction updated', transaction: updated });
  } catch (error) {
    reply.code(500).send({ message: 'Failed to update transaction', error: (error as Error).message });
  }
};

// ❌ DELETE
export const deleteTransaction = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as { id: string };

  try {
    await req.server.prisma.transportTransaction.delete({ where: { id } });
    reply.send({ message: 'Transaction deleted' });
  } catch (error) {
    reply.code(500).send({ message: 'Failed to delete transaction', error: (error as Error).message });
  }
};

// 📌 GET /fee-due/:studentId
export const getFeeDue = async (req: FastifyRequest, reply: FastifyReply) => {
  const { studentId } = req.params as { studentId: string };

  try {
    const student = await req.server.prisma.student.findUnique({
      where: { id: studentId },
      include: { route: true, stop: true, concession: true },
    });

    if (!student || !student.routeId) {
      return reply.code(404).send({ message: 'Student or route not found' });
    }

    const now = new Date();
    const feeStructure = await req.server.prisma.transportFeeStructure.findFirst({
      where: {
        routeId: student.routeId,
        stopId: student.stopId || undefined,
        slab: student.feeSlab,
        effectiveFrom: { lte: now },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: now } }],
      },
      orderBy: { effectiveFrom: 'desc' },
    });

    const dueAmount = feeStructure?.amount || 0;

    let concession = 0;
    if (student.concession) {
      concession = student.concession.type === 'percentage'
        ? (dueAmount * student.concession.value) / 100
        : student.concession.value;
    }

    const fineSetting = await req.server.prisma.fineSetting.findFirst();
    let fine = 0;
    if (fineSetting) {
      const applyDay = fineSetting.applyFrom;
      const today = new Date().getDate();
      if (today >= applyDay) {
        fine = fineSetting.duration === 'per_day'
          ? ((today - applyDay + 1) * fineSetting.amount)
          : fineSetting.amount;
      }
    }

    const totalReceived = await req.server.prisma.transportTransaction.aggregate({
      where: {
        studentId,
        status: 'success',
      },
      _sum: { amount: true },
    });

    const paidAmount = totalReceived._sum.amount ?? 0;
    const finalDue = dueAmount - concession + fine - paidAmount;

    reply.send({
      studentId,
      dueAmount,
      concession,
      fine,
      paidAmount,
      finalDue: Math.max(finalDue, 0),
    });
  } catch (error) {
    reply.code(500).send({ message: 'Failed to fetch due', error: (error as Error).message });
  }
};

