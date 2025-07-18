import { FastifyRequest, FastifyReply } from 'fastify';

enum Frequency {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  CUSTOM = 'custom',
}

interface CreateFeeStructureBody {
  routeId: string;
  stopId?: string;
  slab: string;
  amount: number;
  frequency: Frequency;
  installments: string[]; // e.g. ["January", "February"], ["Quarter-1"], ["1st Installment"]
  effectiveFrom: string; // ISO date string
  effectiveTo?: string;  // Optional ISO date string
}

// 🧠 Helper: Prevent "Apr - Apr"
const formatSlab = (prefix: string, label: string) => {
  return prefix === label ? label : `${prefix} - ${label}`;
};

export const createFeeStructure = async (req: FastifyRequest, reply: FastifyReply) => {
  const body = req.body as CreateFeeStructureBody;

  if (!Object.values(Frequency).includes(body.frequency)) {
    return reply.code(400).send({ message: 'Invalid frequency value' });
  }

  if (!body.installments || body.installments.length === 0) {
    return reply.code(400).send({ message: 'At least one installment is required' });
  }

  try {
    const createdStructures = [];

    for (const installment of body.installments) {
      const slabText = formatSlab(body.slab, installment);

      const record = await req.server.prisma.transportFeeStructure.create({
        data: {
          routeId: body.routeId,
          stopId: body.stopId || null,
          slab: slabText,
          amount: body.amount,
          frequency: body.frequency,
          effectiveFrom: new Date(body.effectiveFrom),
          effectiveTo: body.effectiveTo ? new Date(body.effectiveTo) : null,
          createdAt: new Date(),
        },
      });
      createdStructures.push(record);
    }

    reply.code(201).send({ message: 'Fee structure created', data: createdStructures });
  } catch (error) {
    reply.code(500).send({
      message: 'Failed to create fee structure',
      error: (error as Error).message,
    });
  }
};

export const getFeeStructures = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const feeStructures = await req.server.prisma.transportFeeStructure.findMany({
      orderBy: { effectiveFrom: 'desc' },
    });

    // Optional: clean "Apr - Apr" to "Apr" while sending response
    const cleaned = feeStructures.map((fee) => {
      const parts = fee.slab.split(' - ');
      return {
        ...fee,
        slab: parts.length === 2 && parts[0] === parts[1] ? parts[0] : fee.slab,
      };
    });

    reply.send(cleaned);
  } catch (err) {
    reply.code(500).send({ message: 'Error fetching fee structures' });
  }
};

export const updateFeeStructure = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as { id: string };
  const body = req.body as Partial<CreateFeeStructureBody>;

  if (body.frequency && !Object.values(Frequency).includes(body.frequency)) {
    return reply.code(400).send({ message: 'Invalid frequency value' });
  }

  try {
    let updatedSlab = body.slab;

    // Optional: If updating `slab` and only one installment is passed, avoid duplication
    if (body.slab && body.installments?.length === 1) {
      updatedSlab = formatSlab(body.slab, body.installments[0]);
    }

    const updated = await req.server.prisma.transportFeeStructure.update({
      where: { id },
      data: {
        routeId: body.routeId,
        stopId: body.stopId || null,
        slab: updatedSlab,
        amount: body.amount,
        frequency: body.frequency,
        effectiveFrom: body.effectiveFrom ? new Date(body.effectiveFrom) : undefined,
        effectiveTo: body.effectiveTo ? new Date(body.effectiveTo) : undefined,
      },
    });

    reply.send({ message: 'Fee structure updated', data: updated });
  } catch {
    reply.code(404).send({ message: 'Fee structure not found' });
  }
};

export const deleteFeeStructure = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as { id: string };

  try {
    await req.server.prisma.transportFeeStructure.delete({ where: { id } });
    reply.send({ message: 'Fee structure deleted' });
  } catch {
    reply.code(404).send({ message: 'Fee structure not found' });
  }
};
