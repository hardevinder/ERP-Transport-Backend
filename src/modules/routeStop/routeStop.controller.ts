import { FastifyRequest, FastifyReply } from 'fastify';

// ✅ Get stops by specific routeId
export const getStopsByRoute = async (req: FastifyRequest, reply: FastifyReply) => {
  const { routeId } = req.params as { routeId: string };
  const stops = await req.server.prisma.routeStop.findMany({
    where: { routeId },
    orderBy: { stopOrder: 'asc' },
  });
  reply.send(stops);
};

// ✅ Get ALL stops with associated Route Name
export const getAllStopsWithRouteName = async (req: FastifyRequest, reply: FastifyReply) => {
  const stops = await req.server.prisma.routeStop.findMany({
    include: {
      route: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      stopOrder: 'asc',
    },
  });

  const formatted = stops.map(stop => ({
    id: stop.id,
    stopName: stop.stopName,
    address: stop.address || '',  // ✅ Include address
    stopOrder: stop.stopOrder,
    stopTime: stop.stopTime,
    latitude: stop.latitude,
    longitude: stop.longitude,
    feeAmount: stop.feeAmount,
    status: stop.status,
    routeName: stop.route?.name || '',
    routeId: stop.routeId,
  }));

  reply.send(formatted);
};

// ✅ Create a new stop
export const createStop = async (req: FastifyRequest, reply: FastifyReply) => {
  const {
    routeId,
    stopName,
    address,
    stopOrder,
    stopTime,
    latitude,
    longitude,
    feeAmount,
  } = req.body as {
    routeId: string;
    stopName: string;
    address?: string;
    stopOrder: number;
    stopTime: string;
    latitude?: number;
    longitude?: number;
    feeAmount?: number;
  };

  const stop = await req.server.prisma.routeStop.create({
    data: {
      routeId,
      stopName,
      address,
      stopOrder,
      stopTime,
      latitude,
      longitude,
      feeAmount,
      status: 'active',
    },
  });
  reply.code(201).send(stop);
};

// ✅ Update a stop
export const updateStop = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as { id: string };
  const {
    stopName,
    address,
    stopOrder,
    stopTime,
    latitude,
    longitude,
    feeAmount,
  } = req.body as {
    stopName: string;
    address?: string;
    stopOrder: number;
    stopTime: string;
    latitude?: number;
    longitude?: number;
    feeAmount?: number;
  };

  try {
    const updated = await req.server.prisma.routeStop.update({
      where: { id },
      data: {
        stopName,
        address,
        stopOrder,
        stopTime,
        latitude,
        longitude,
        feeAmount,
      },
    });
    reply.send(updated);
  } catch {
    reply.code(404).send({ message: 'Stop not found' });
  }
};

// ✅ Delete a stop
export const deleteStop = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as { id: string };
  try {
    await req.server.prisma.routeStop.delete({ where: { id } });
    reply.send({ message: 'Stop deleted' });
  } catch {
    reply.code(404).send({ message: 'Stop not found' });
  }
};

// ✅ Toggle stop active/inactive
export const toggleStopStatus = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as { id: string };

  const stop = await req.server.prisma.routeStop.findUnique({ where: { id } });
  if (!stop) return reply.code(404).send({ message: 'Stop not found' });

  const updated = await req.server.prisma.routeStop.update({
    where: { id },
    data: { status: stop.status === 'active' ? 'inactive' : 'active' },
  });

  reply.send(updated);
};
