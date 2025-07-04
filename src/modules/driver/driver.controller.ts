import { FastifyRequest, FastifyReply } from 'fastify';

export const createDriver = async (req: FastifyRequest, reply: FastifyReply) => {
  const { name, phone, licenseNo } = req.body as {
    name: string;
    phone: string;
    licenseNo: string;
  };

  const existing = await req.server.prisma.driver.findUnique({ where: { phone } });
  if (existing) {
    return reply.code(400).send({ message: 'Driver with this phone already exists.' });
  }

  const driver = await req.server.prisma.driver.create({
    data: { name, phone, licenseNo, status: 'active' },
  });

  reply.code(201).send(driver);
};

export const getDrivers = async (req: FastifyRequest, reply: FastifyReply) => {
  const drivers = await req.server.prisma.driver.findMany();
  reply.send(drivers);
};

export const updateDriver = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as { id: string };
  const { name, phone, licenseNo } = req.body as {
    name: string;
    phone: string;
    licenseNo: string;
  };

  try {
    const updated = await req.server.prisma.driver.update({
      where: { id },
      data: { name, phone, licenseNo },
    });
    reply.send(updated);
  } catch (err) {
    reply.code(404).send({ message: 'Driver not found.' });
  }
};

export const deleteDriver = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as { id: string };

  try {
    await req.server.prisma.driver.delete({ where: { id } });
    reply.send({ message: 'Driver deleted successfully.' });
  } catch (err) {
    reply.code(404).send({ message: 'Driver not found.' });
  }
};

export const toggleDriverStatus = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as { id: string };

  const driver = await req.server.prisma.driver.findUnique({ where: { id } });
  if (!driver) {
    return reply.code(404).send({ message: 'Driver not found.' });
  }

  const newStatus = driver.status === 'active' ? 'inactive' : 'active';

  const updated = await req.server.prisma.driver.update({
    where: { id },
    data: { status: newStatus },
  });

  reply.send(updated);
};


export const countDrivers = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const totalDrivers = await req.server.prisma.driver.count();

    reply.send({
      status: 200,
      message: 'Total number of drivers',
      data: { totalDrivers },
    });
  } catch (error: any) {
    console.error('❌ Error counting drivers:', error);
    reply.code(500).send({
      status: 500,
      message: 'Error counting drivers',
      error: error.message,
    });
  }
};
