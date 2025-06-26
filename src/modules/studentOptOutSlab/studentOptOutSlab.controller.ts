import { FastifyRequest, FastifyReply } from 'fastify';

interface OptOutEntry {
  studentId: string;
  feeStructureId: string;
}

type OptOutBody = OptOutEntry | OptOutEntry[];

export const createOptOutSlab = async (req: FastifyRequest, reply: FastifyReply) => {
  // Accept either one object or an array of objects
  const body = req.body as OptOutBody;
  const entries = Array.isArray(body) ? body : [body];

  // Validate
  for (const { studentId, feeStructureId } of entries) {
    if (!studentId || !feeStructureId) {
      return reply
        .code(400)
        .send({ message: 'Each entry requires studentId and feeStructureId' });
    }
  }

  try {
    // Bulk create all entries in a transaction
    const created = await req.server.prisma.$transaction(
      entries.map(e =>
        req.server.prisma.studentOptOutSlab.create({
          data: {
            studentId: e.studentId,
            feeStructureId: e.feeStructureId,
          },
        })
      )
    );
    return reply.code(201).send(created);
  } catch (err: any) {
    req.log.error(err);
    if (err.code === 'P2002') {
      // Unique constraint failure (duplicate student+slab)
      return reply
        .code(409)
        .send({ message: 'One or more opt-out entries already exist' });
    }
    return reply
      .code(500)
      .send({ message: 'Could not create opt-out records', error: err.message });
  }
};

export const getOptOutSlabs = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const records = await req.server.prisma.studentOptOutSlab.findMany({
      include: { student: true, feeStructure: true },
    });
    return reply.send(records);
  } catch (err: any) {
    req.log.error(err);
    return reply
      .code(500)
      .send({ message: 'Could not fetch opt-out records', error: err.message });
  }
};

export const getOptOutSlabById = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as { id: string };
  try {
    const record = await req.server.prisma.studentOptOutSlab.findUnique({
      where: { id },
      include: { student: true, feeStructure: true },
    });
    if (!record) {
      return reply.code(404).send({ message: 'Opt-out record not found' });
    }
    return reply.send(record);
  } catch (err: any) {
    req.log.error(err);
    return reply
      .code(500)
      .send({ message: 'Could not fetch opt-out record', error: err.message });
  }
};

export const updateOptOutSlab = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as { id: string };
  const { studentId, feeStructureId } = req.body as Partial<OptOutEntry>;

  try {
    const existing = await req.server.prisma.studentOptOutSlab.findUnique({
      where: { id },
    });
    if (!existing) {
      return reply.code(404).send({ message: 'Opt-out record not found' });
    }

    const updated = await req.server.prisma.studentOptOutSlab.update({
      where: { id },
      data: {
        studentId: studentId ?? existing.studentId,
        feeStructureId: feeStructureId ?? existing.feeStructureId,
      },
    });
    return reply.send(updated);
  } catch (err: any) {
    req.log.error(err);
    return reply
      .code(500)
      .send({ message: 'Could not update opt-out record', error: err.message });
  }
};

export const deleteOptOutSlab = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as { id: string };
  try {
    await req.server.prisma.studentOptOutSlab.delete({
      where: { id },
    });
    return reply.send({ message: 'Opt-out record deleted' });
  } catch (err: any) {
    req.log.error(err);
    return reply
      .code(500)
      .send({ message: 'Could not delete opt-out record', error: err.message });
  }
};
