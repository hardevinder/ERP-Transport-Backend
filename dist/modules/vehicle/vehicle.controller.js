"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleVehicleStatus = exports.deleteVehicle = exports.updateVehicle = exports.createVehicle = exports.getVehicles = void 0;
// GET all vehicles
const getVehicles = async (req, reply) => {
    const vehicles = await req.server.prisma.vehicle.findMany();
    reply.send(vehicles);
};
exports.getVehicles = getVehicles;
// CREATE a new vehicle
const createVehicle = async (req, reply) => {
    const { busNo, capacity, driverId } = req.body;
    try {
        const vehicle = await req.server.prisma.vehicle.create({
            data: { busNo, capacity, driverId },
        });
        reply.code(201).send(vehicle);
    }
    catch (error) {
        reply.code(400).send({ message: 'Vehicle creation failed', error });
    }
};
exports.createVehicle = createVehicle;
// UPDATE a vehicle
const updateVehicle = async (req, reply) => {
    const { id } = req.params;
    const { busNo, capacity, driverId } = req.body;
    try {
        const vehicle = await req.server.prisma.vehicle.update({
            where: { id },
            data: { busNo, capacity, driverId },
        });
        reply.send(vehicle);
    }
    catch (error) {
        reply.code(404).send({ message: 'Vehicle not found', error });
    }
};
exports.updateVehicle = updateVehicle;
// DELETE a vehicle
const deleteVehicle = async (req, reply) => {
    const { id } = req.params;
    try {
        await req.server.prisma.vehicle.delete({ where: { id } });
        reply.send({ message: 'Vehicle deleted successfully' });
    }
    catch (error) {
        reply.code(404).send({ message: 'Vehicle not found', error });
    }
};
exports.deleteVehicle = deleteVehicle;
// TOGGLE STATUS of a vehicle (activate/deactivate)
const toggleVehicleStatus = async (req, reply) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const updated = await req.server.prisma.vehicle.update({
            where: { id },
            data: { status },
        });
        reply.send(updated);
    }
    catch (error) {
        reply.code(404).send({ message: 'Vehicle not found', error });
    }
};
exports.toggleVehicleStatus = toggleVehicleStatus;
