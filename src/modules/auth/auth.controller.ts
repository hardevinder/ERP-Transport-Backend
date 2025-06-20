// src/modules/auth/auth.controller.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcrypt';

export const register = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const existing = await req.server.prisma.admin.findUnique({ where: { email } });
    if (existing) return reply.code(400).send({ message: 'Email already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await req.server.prisma.admin.create({
      data: { email, password: hashed }
    });

    const token = req.server.jwt.sign({ id: user.id, email: user.email, role: user.role });
    reply.code(201).send({ token });
  } catch (err) {
    reply.code(500).send({ message: 'Internal server error' });
  }
};

export const login = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const user = await req.server.prisma.admin.findUnique({ where: { email } });
    if (!user) return reply.code(401).send({ message: 'Invalid email or password' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return reply.code(401).send({ message: 'Invalid email or password' });

    const token = req.server.jwt.sign({ id: user.id, email: user.email, role: user.role });
    reply.send({ token });
  } catch (err) {
    reply.code(500).send({ message: 'Internal server error' });
  }
};

export const getMe = async (req: FastifyRequest, reply: FastifyReply) => {
  // This assumes JWT has been verified and payload is attached
  const user = req.user;
  reply.send({ user });
};
