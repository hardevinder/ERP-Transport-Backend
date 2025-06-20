import { FastifyRequest, FastifyReply } from 'fastify';

// Types
type ConcessionBody = {
  name: string;
  type: 'fixed' | 'percentage';
  value: number;
};

// 📌 Get all concession settings
export const getAllConcessions = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  const concessions = await req.server.prisma.concessionSetting.findMany();
  reply.send(concessions);
};

// ➕ Create a new concession
export const createConcession = async (
  req: FastifyRequest<{ Body: ConcessionBody }>,
  reply: FastifyReply
) => {
  const { name, type, value } = req.body;

  const concession = await req.server.prisma.concessionSetting.create({
    data: { name, type, value },
  });

  reply.send(concession);
};

// ✏️ Update an existing concession
export const updateConcession = async (
  req: FastifyRequest<{ Params: { id: string }; Body: ConcessionBody }>,
  reply: FastifyReply
) => {
  const { id } = req.params;
  const { name, type, value } = req.body;

  const updated = await req.server.prisma.concessionSetting.update({
    where: { id },
    data: { name, type, value },
  });

  reply.send(updated);
};

// ❌ Delete a concession
export const deleteConcession = async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const { id } = req.params;

  await req.server.prisma.concessionSetting.delete({ where: { id } });
  reply.send({ success: true });
};
