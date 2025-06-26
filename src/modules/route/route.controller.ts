import { FastifyRequest, FastifyReply } from 'fastify';

export const createRoute = async (req: FastifyRequest, reply: FastifyReply) => {
  const { name, startPoint, endPoint, driverId, vehicleId, stops, override } = req.body as any;

  if (!name || !startPoint || !endPoint) {
    return reply.code(400).send({ message: 'Please provide name, startPoint, and endPoint.' });
  }

  try {
    if (!override) {
      if (vehicleId) {
        const existingVehicleRoute = await req.server.prisma.route.findFirst({
          where: { vehicleId },
        });
        if (existingVehicleRoute) {
          return reply.code(409).send({
            warning: true,
            message: `Vehicle already assigned to Route: ${existingVehicleRoute.name}`,
          });
        }
      }

      if (driverId) {
        const existingDriverRoute = await req.server.prisma.route.findFirst({
          where: { driverId },
        });
        if (existingDriverRoute) {
          return reply.code(409).send({
            warning: true,
            message: `Driver already assigned to Route: ${existingDriverRoute.name}`,
          });
        }
      }
    }

    const route = await req.server.prisma.route.create({
      data: {
        name,
        startPoint,
        endPoint,
        driverId,
        vehicleId,
        status: 'active',
        stops: stops && stops.length > 0 ? {
          create: stops.map((stop: any) => ({
            stopName: stop.stopName,
            stopOrder: Number(stop.stopOrder),
            stopTime: stop.stopTime,
            address: stop.address || null,
            feeAmount: stop.feeAmount !== undefined && stop.feeAmount !== '' ? Number(stop.feeAmount) : null,
            latitude: stop.latitude !== undefined && stop.latitude !== '' ? Number(stop.latitude) : null,
            longitude: stop.longitude !== undefined && stop.longitude !== '' ? Number(stop.longitude) : null,
            status: 'active',
          })),
        } : undefined,
      },
      include: {
        stops: true,
        vehicle: true,
      },
    });

    reply.code(201).send(route);
  } catch (err: any) {
    console.error('❌ Error creating route with stops:', err);
    reply.code(500).send({ message: 'Error creating route with stops', error: err.message });
  }
};

export const getRoutes = async (req: FastifyRequest, reply: FastifyReply) => {
  const routes = await req.server.prisma.route.findMany({
    include: {
      driver: true,
      vehicle: true,
    },
  });
  reply.send(routes);
};

export const updateRoute = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as { id: string };
  const { name, startPoint, endPoint, driverId, vehicleId, stops, override } = req.body as any;

  if (!name || !startPoint || !endPoint) {
    return reply.code(400).send({ message: 'Please provide name, startPoint, and endPoint.' });
  }

  try {
    if (!override) {
      if (vehicleId) {
        const existingVehicleRoute = await req.server.prisma.route.findFirst({
          where: {
            vehicleId,
            id: { not: id },
          },
        });
        if (existingVehicleRoute) {
          return reply.code(409).send({
            warning: true,
            message: `Vehicle already assigned to Route: ${existingVehicleRoute.name}`,
          });
        }
      }

      if (driverId) {
        const existingDriverRoute = await req.server.prisma.route.findFirst({
          where: {
            driverId,
            id: { not: id },
          },
        });
        if (existingDriverRoute) {
          return reply.code(409).send({
            warning: true,
            message: `Driver already assigned to Route: ${existingDriverRoute.name}`,
          });
        }
      }
    }

    const updated = await req.server.prisma.route.update({
      where: { id },
      data: {
        name,
        startPoint,
        endPoint,
        driverId,
        vehicleId,
      },
    });

    await req.server.prisma.routeStop.deleteMany({ where: { routeId: id } });

    if (stops && stops.length > 0) {
      await req.server.prisma.routeStop.createMany({
        data: stops.map((stop: any) => ({
          stopName: stop.stopName,
          stopOrder: Number(stop.stopOrder),
          stopTime: stop.stopTime,
          address: stop.address || null,
          feeAmount: stop.feeAmount !== undefined && stop.feeAmount !== '' ? Number(stop.feeAmount) : null,
          latitude: stop.latitude !== undefined && stop.latitude !== '' ? Number(stop.latitude) : null,
          longitude: stop.longitude !== undefined && stop.longitude !== '' ? Number(stop.longitude) : null,
          routeId: id,
          status: 'active',
        })),
      });
    }

    reply.send({ message: 'Route updated successfully' });
  } catch (err: any) {
    console.error('❌ Error updating route:', err);
    reply.code(500).send({ message: 'Error updating route', error: err.message });
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

export const addRouteStopsBulk = async (req: FastifyRequest, reply: FastifyReply) => {
  const { routeId, stops } = req.body as any;

  if (!routeId || !Array.isArray(stops) || stops.length === 0) {
    return reply.code(400).send({ message: 'routeId and stops are required.' });
  }

  try {
    const created = await req.server.prisma.routeStop.createMany({
      data: stops.map((stop: any) => ({
        stopName: stop.stopName,
        stopOrder: stop.stopOrder,
        stopTime: stop.stopTime,
        address: stop.address || null,
        feeAmount: stop.feeAmount !== undefined && stop.feeAmount !== '' ? Number(stop.feeAmount) : null,
        latitude: stop.latitude !== undefined && stop.latitude !== '' ? Number(stop.latitude) : null,
        longitude: stop.longitude !== undefined && stop.longitude !== '' ? Number(stop.longitude) : null,
        routeId,
        status: 'active',
      })),
    });

    reply.code(201).send({ message: 'Stops added', count: created.count });
  } catch (error: any) {
    console.error(error);
    reply.code(500).send({ message: 'Error adding stops', error: error.message });
  }
};

export const getRouteById = async (req: FastifyRequest<{ Params: { id: string } }>, res: FastifyReply) => {
  try {
    const { id } = req.params;

    const route = await req.server.prisma.route.findUnique({
      where: { id },
      include: {
        driver: true,
        vehicle: true,
        stops: {
          orderBy: { stopOrder: 'asc' },
        },
      },
    });

    if (!route) {
      return res.code(404).send({ message: 'Route not found' });
    }

    return res.send(route);
  } catch (error: any) {
    console.error('❌ Error fetching route:', error);
    return res.code(500).send({ message: 'Internal Server Error', error: error.message });
  }
};
