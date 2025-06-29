"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTransportProfile = exports.updateTransportProfile = exports.createTransportProfile = exports.getTransportProfile = void 0;
// GET: /profile
const getTransportProfile = async (req, reply) => {
    try {
        const profiles = await req.server.prisma.transportOrgProfile.findMany();
        reply.send(profiles);
    }
    catch (error) {
        console.error('❌ Error fetching profiles:', error);
        reply.code(500).send({ message: 'Failed to fetch profiles' });
    }
};
exports.getTransportProfile = getTransportProfile;
// POST: /profile
const createTransportProfile = async (req, reply) => {
    const { name, address, contact, email, website } = req.body;
    try {
        const created = await req.server.prisma.transportOrgProfile.create({
            data: { name, address, contact, email, website },
        });
        reply.code(201).send(created);
    }
    catch (error) {
        console.error('❌ Error creating profile:', error);
        reply.code(500).send({ message: 'Failed to create profile' });
    }
};
exports.createTransportProfile = createTransportProfile;
// PUT: /profile/:id
const updateTransportProfile = async (req, reply) => {
    const { id } = req.params; // ✅ get ID from URL
    const { name, address, contact, email, website } = req.body;
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
    }
    catch (error) {
        console.error('❌ Error updating transport profile:', error);
        reply.code(500).send({ message: 'Failed to update transport profile' });
    }
};
exports.updateTransportProfile = updateTransportProfile;
// DELETE: /profile/:id
const deleteTransportProfile = async (req, reply) => {
    const { id } = req.params;
    try {
        const existing = await req.server.prisma.transportOrgProfile.findUnique({ where: { id } });
        if (!existing) {
            return reply.code(404).send({ message: 'Profile not found' });
        }
        await req.server.prisma.transportOrgProfile.delete({ where: { id } });
        reply.send({ message: 'Profile deleted successfully' });
    }
    catch (error) {
        console.error('❌ Error deleting profile:', error);
        reply.code(500).send({ message: 'Failed to delete profile' });
    }
};
exports.deleteTransportProfile = deleteTransportProfile;
