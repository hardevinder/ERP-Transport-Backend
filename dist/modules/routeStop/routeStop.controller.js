"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleStopStatus = exports.deleteStop = exports.updateStop = exports.createStop = exports.getAllStopsWithRouteName = exports.getStopsByRoute = void 0;
// ✅ Get stops by specific routeId
const getStopsByRoute = async (req, reply) => {
    const { routeId } = req.params;
    const stops = await req.server.prisma.routeStop.findMany({
        where: { routeId },
        orderBy: { stopOrder: 'asc' },
    });
    reply.send(stops);
};
exports.getStopsByRoute = getStopsByRoute;
// ✅ Get ALL stops with associated Route Name
const getAllStopsWithRouteName = async (req, reply) => {
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
        address: stop.address || '', // ✅ Include address
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
exports.getAllStopsWithRouteName = getAllStopsWithRouteName;
// ✅ Create a new stop
const createStop = async (req, reply) => {
    const { routeId, stopName, address, stopOrder, stopTime, latitude, longitude, feeAmount, } = req.body;
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
exports.createStop = createStop;
// ✅ Update a stop
const updateStop = async (req, reply) => {
    const { id } = req.params;
    const { stopName, address, stopOrder, stopTime, latitude, longitude, feeAmount, } = req.body;
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
    }
    catch {
        reply.code(404).send({ message: 'Stop not found' });
    }
};
exports.updateStop = updateStop;
// ✅ Delete a stop
const deleteStop = async (req, reply) => {
    const { id } = req.params;
    try {
        await req.server.prisma.routeStop.delete({ where: { id } });
        reply.send({ message: 'Stop deleted' });
    }
    catch {
        reply.code(404).send({ message: 'Stop not found' });
    }
};
exports.deleteStop = deleteStop;
// ✅ Toggle stop active/inactive
const toggleStopStatus = async (req, reply) => {
    const { id } = req.params;
    const stop = await req.server.prisma.routeStop.findUnique({ where: { id } });
    if (!stop)
        return reply.code(404).send({ message: 'Stop not found' });
    const updated = await req.server.prisma.routeStop.update({
        where: { id },
        data: { status: stop.status === 'active' ? 'inactive' : 'active' },
    });
    reply.send(updated);
};
exports.toggleStopStatus = toggleStopStatus;
