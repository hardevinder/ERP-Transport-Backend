import { FastifyRequest, FastifyReply } from 'fastify';

// GET all vehicles
export const getVehicles = async (req: FastifyRequest, reply: FastifyReply) => {
  const vehicles = await req.server.prisma.vehicle.findMany();
  reply.send(vehicles);
};

// CREATE a new vehicle
export const createVehicle = async (req: FastifyRequest, reply: FastifyReply) => {
  const { busNo, capacity, driverId } = req.body as {
    busNo: string;
    capacity: number;
    driverId?: string;
  };

  try {
    const vehicle = await req.server.prisma.vehicle.create({
      data: { busNo, capacity, driverId },
    });

    reply.code(201).send(vehicle);
  } catch (error) {
    reply.code(400).send({ message: 'Vehicle creation failed', error });
  }
};

// UPDATE a vehicle
export const updateVehicle = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as { id: string };
  const { busNo, capacity, driverId } = req.body as {
    busNo?: string;
    capacity?: number;
    driverId?: string;
  };

  try {
    const vehicle = await req.server.prisma.vehicle.update({
      where: { id },
      data: { busNo, capacity, driverId },
    });

    reply.send(vehicle);
  } catch (error) {
    reply.code(404).send({ message: 'Vehicle not found', error });
  }
};

// DELETE a vehicle
export const deleteVehicle = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as { id: string };

  try {
    await req.server.prisma.vehicle.delete({ where: { id } });
    reply.send({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    reply.code(404).send({ message: 'Vehicle not found', error });
  }
};

// TOGGLE STATUS of a vehicle (activate/deactivate)
export const toggleVehicleStatus = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as { id: string };
  const { status } = req.body as { status: 'active' | 'inactive' };

  try {
    const updated = await req.server.prisma.vehicle.update({
      where: { id },
      data: { status },
    });
    reply.send(updated);
  } catch (error) {
    reply.code(404).send({ message: 'Vehicle not found', error });
  }
};
