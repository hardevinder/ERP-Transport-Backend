// src/modules/fineSetting/fineSetting.controller.ts

import { FastifyRequest, FastifyReply } from 'fastify';

interface FineSettingBody {
  amount: number;
  duration: 'fixed' | 'per_day';
  applyFrom: number;
}

// ✅ CREATE
export const createFineSetting = async (req: FastifyRequest, reply: FastifyReply) => {
  const body = req.body as FineSettingBody;

  try {
    const setting = await req.server.prisma.fineSetting.create({ data: body });
    reply.code(201).send({ message: '✅ Fine setting created', setting });
  } catch (error) {
    reply.code(500).send({ message: '❌ Failed to create fine setting', error: (error as Error).message });
  }
};

// 🔁 UPDATE
export const updateFineSetting = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as { id: string };
  const body = req.body as Partial<FineSettingBody>;

  try {
    const updated = await req.server.prisma.fineSetting.update({
      where: { id },
      data: body,
    });
    reply.send({ message: '✅ Fine setting updated', updated });
  } catch (error) {
    reply.code(500).send({ message: '❌ Failed to update fine setting', error: (error as Error).message });
  }
};

// 📥 GET ALL
export const getFineSettings = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const settings = await req.server.prisma.fineSetting.findMany({ orderBy: { createdAt: 'desc' } });
    reply.send(settings);
  } catch (error) {
    reply.code(500).send({ message: '❌ Failed to fetch fine settings', error: (error as Error).message });
  }
};

// 📥 GET ONE
export const getFineSettingById = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as { id: string };

  try {
    const setting = await req.server.prisma.fineSetting.findUnique({ where: { id } });
    if (!setting) return reply.code(404).send({ message: '❌ Fine setting not found' });
    reply.send(setting);
  } catch (error) {
    reply.code(500).send({ message: '❌ Failed to fetch fine setting', error: (error as Error).message });
  }
};

// ❌ DELETE
export const deleteFineSetting = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as { id: string };

  try {
    await req.server.prisma.fineSetting.delete({ where: { id } });
    reply.send({ message: '🗑️ Fine setting deleted successfully' });
  } catch (error) {
    reply.code(500).send({ message: '❌ Failed to delete fine setting', error: (error as Error).message });
  }
};
