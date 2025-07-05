"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.countDrivers = exports.toggleDriverStatus = exports.deleteDriver = exports.updateDriver = exports.getDrivers = exports.createDriver = void 0;
const createDriver = async (req, reply) => {
    const { name, phone, licenseNo } = req.body;
    const existing = await req.server.prisma.driver.findUnique({ where: { phone } });
    if (existing) {
        return reply.code(400).send({ message: 'Driver with this phone already exists.' });
    }
    const driver = await req.server.prisma.driver.create({
        data: { name, phone, licenseNo, status: 'active' },
    });
    reply.code(201).send(driver);
};
exports.createDriver = createDriver;
const getDrivers = async (req, reply) => {
    const drivers = await req.server.prisma.driver.findMany();
    reply.send(drivers);
};
exports.getDrivers = getDrivers;
const updateDriver = async (req, reply) => {
    const { id } = req.params;
    const { name, phone, licenseNo } = req.body;
    try {
        const updated = await req.server.prisma.driver.update({
            where: { id },
            data: { name, phone, licenseNo },
        });
        reply.send(updated);
    }
    catch (err) {
        reply.code(404).send({ message: 'Driver not found.' });
    }
};
exports.updateDriver = updateDriver;
const deleteDriver = async (req, reply) => {
    const { id } = req.params;
    try {
        await req.server.prisma.driver.delete({ where: { id } });
        reply.send({ message: 'Driver deleted successfully.' });
    }
    catch (err) {
        reply.code(404).send({ message: 'Driver not found.' });
    }
};
exports.deleteDriver = deleteDriver;
const toggleDriverStatus = async (req, reply) => {
    const { id } = req.params;
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
exports.toggleDriverStatus = toggleDriverStatus;
const countDrivers = async (req, reply) => {
    try {
        const totalDrivers = await req.server.prisma.driver.count();
        reply.send({
            status: 200,
            message: 'Total number of drivers',
            data: { totalDrivers },
        });
    }
    catch (error) {
        console.error('❌ Error counting drivers:', error);
        reply.code(500).send({
            status: 500,
            message: 'Error counting drivers',
            error: error.message,
        });
    }
};
exports.countDrivers = countDrivers;
