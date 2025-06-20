import { FastifyRequest, FastifyReply } from 'fastify';

export const createRoute = async (req: FastifyRequest, reply: FastifyReply) => {
  const { name, startPoint, endPoint, driverId } = req.body as {
    name?: string;
    startPoint?: string;
    endPoint?: string;
    driverId?: string;
  };

  // ✅ Validate required fields
  if (!name || !startPoint || !endPoint) {
    return reply.code(400).send({ message: 'Please provide name, startPoint, and endPoint.' });
  }

  const route = await req.server.prisma.route.create({
    data: {
      name,
      startPoint,
      endPoint,
      driverId,
      status: 'active',
    },
  });

  reply.code(201).send(route);
};

export const getRoutes = async (req: FastifyRequest, reply: FastifyReply) => {
  const routes = await req.server.prisma.route.findMany({
    include: { driver: true },
  });
  reply.send(routes);
};

export const updateRoute = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as { id: string };
  const { name, startPoint, endPoint, driverId } = req.body as {
    name?: string;
    startPoint?: string;
    endPoint?: string;
    driverId?: string;
  };

  // ✅ Validate required fields
  if (!name || !startPoint || !endPoint) {
    return reply.code(400).send({ message: 'Please provide name, startPoint, and endPoint.' });
  }

  try {
    const updated = await req.server.prisma.route.update({
      where: { id },
      data: { name, startPoint, endPoint, driverId },
    });
    reply.send(updated);
  } catch {
    reply.code(404).send({ message: 'Route not found' });
  }
};

export const deleteRoute = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as { id: string };
  try {
    await req.server.prisma.route.delete({ where: { id } });
    reply.send({ message: 'Route deleted' });
  } catch {
    reply.code(404).send({ message: 'Route not found' });
  }
};

export const toggleRouteStatus = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as { id: string };

  const route = await req.server.prisma.route.findUnique({ where: { id } });
  if (!route) return reply.code(404).send({ message: 'Route not found' });

  const updated = await req.server.prisma.route.update({
    where: { id },
    data: { status: route.status === 'active' ? 'inactive' : 'active' },
  });

  reply.send(updated);
};
