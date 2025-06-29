import { FastifyRequest, FastifyReply } from 'fastify';

// ✅ Create a new class
export const createClass = async (req: FastifyRequest, reply: FastifyReply) => {
  const { name } = req.body as { name: string };

  const exists = await req.server.prisma.schoolClass.findUnique({ where: { name } });
  if (exists) return reply.code(400).send({ message: 'Class already exists' });

  const newClass = await req.server.prisma.schoolClass.create({
    data: { name },
  });

  reply.code(201).send(newClass);
};

// ✅ Get all classes
export const getAllClasses = async (req: FastifyRequest, reply: FastifyReply) => {
  const classes = await req.server.prisma.schoolClass.findMany({
    orderBy: { name: 'asc' },
  });

  reply.send(classes);
};

// ✅ Get a class by ID
export const getClassById = async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const { id } = req.params;

  const classRecord = await req.server.prisma.schoolClass.findUnique({
    where: { id },
    include: { students: true },
  });

  if (!classRecord) {
    return reply.code(404).send({ message: 'Class not found' });
  }

  reply.send(classRecord);
};

// ✅ Update class
export const updateClass = async (
  req: FastifyRequest<{ Params: { id: string }; Body: { name: string } }>,
  reply: FastifyReply
) => {
  const { id } = req.params;
  const { name } = req.body;

  const existing = await req.server.prisma.schoolClass.findUnique({ where: { id } });
  if (!existing) return reply.code(404).send({ message: 'Class not found' });

  const updated = await req.server.prisma.schoolClass.update({
    where: { id },
    data: { name },
  });

  reply.send(updated);
};

// ✅ Delete class
export const deleteClass = async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const { id } = req.params;

  try {
    await req.server.prisma.schoolClass.delete({ where: { id } });
    reply.send({ message: 'Class deleted' });
  } catch (err) {
    reply.code(400).send({ message: 'Cannot delete class. It may have students.' });
  }
};