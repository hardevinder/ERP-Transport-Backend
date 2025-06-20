import { FastifyRequest, FastifyReply } from 'fastify';

interface TransportOrgProfileInput {
  name: string;
  address: string;
  contact: string;
  email: string;
  website?: string;
}

// GET: /profile
export const getTransportProfile = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const profiles = await req.server.prisma.transportOrgProfile.findMany();
    reply.send(profiles);
  } catch (error) {
    console.error('❌ Error fetching profiles:', error);
    reply.code(500).send({ message: 'Failed to fetch profiles' });
  }
};

// POST: /profile
export const createTransportProfile = async (req: FastifyRequest, reply: FastifyReply) => {
  const { name, address, contact, email, website } = req.body as TransportOrgProfileInput;

  try {
    const created = await req.server.prisma.transportOrgProfile.create({
      data: { name, address, contact, email, website },
    });

    reply.code(201).send(created);
  } catch (error) {
    console.error('❌ Error creating profile:', error);
    reply.code(500).send({ message: 'Failed to create profile' });
  }
};

// PUT: /profile/:id
export const updateTransportProfile = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as { id: string }; // ✅ get ID from URL
  const { name, address, contact, email, website } = req.body as TransportOrgProfileInput;

  try {
    const existing = await req.server.prisma.transportOrgProfile.findUnique({ where: { id } });
    if (!existing) {
      return reply.code(404).send({ message: 'Profile not found' });
    }

    const updated = await req.server.prisma.transportOrgProfile.update({
      where: { id },
      data: { name, address, contact, email, website },
    });

    reply.send(updated);
  } catch (error) {
    console.error('❌ Error updating transport profile:', error);
    reply.code(500).send({ message: 'Failed to update transport profile' });
  }
};

// DELETE: /profile/:id
export const deleteTransportProfile = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as { id: string };

  try {
    const existing = await req.server.prisma.transportOrgProfile.findUnique({ where: { id } });
    if (!existing) {
      return reply.code(404).send({ message: 'Profile not found' });
    }

    await req.server.prisma.transportOrgProfile.delete({ where: { id } });
    reply.send({ message: 'Profile deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting profile:', error);
    reply.code(500).send({ message: 'Failed to delete profile' });
  }
};
