"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addRouteStopsBulk = exports.toggleRouteStatus = exports.deleteRoute = exports.updateRoute = exports.getRouteById = exports.getRoutes = exports.createRoute = void 0;
const createRoute = async (req, reply) => {
    const { name, startPoint, endPoint, driverId, vehicleId, stops, override } = req.body;
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
                        message: `Vehicle already assigned to Route: ${existingVehicleRoute.name}. Proceed with override?`,
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
                        message: `Driver already assigned to Route: ${existingDriverRoute.name}. Proceed with override?`,
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
                stops: stops && stops.length > 0
                    ? {
                        create: stops.map((stop) => ({
                            stopName: stop.stopName,
                            stopOrder: Number(stop.stopOrder),
                            stopTime: stop.stopTime,
                            address: stop.address || null,
                            feeAmount: stop.feeAmount !== undefined && stop.feeAmount !== '' ? Number(stop.feeAmount) : null,
                            latitude: stop.latitude !== undefined && stop.latitude !== '' ? Number(stop.latitude) : null,
                            longitude: stop.longitude !== undefined && stop.longitude !== '' ? Number(stop.longitude) : null,
                            status: 'active',
                        })),
                    }
                    : undefined,
            },
            include: {
                stops: true,
                vehicle: true,
                driver: true,
            },
        });
        reply.code(201).send(route);
    }
    catch (err) {
        console.error('❌ Error creating route with stops:', err);
        reply.code(500).send({ message: 'Error creating route with stops', error: err.message });
    }
};
exports.createRoute = createRoute;
const getRoutes = async (req, reply) => {
    const routes = await req.server.prisma.route.findMany({
        include: {
            driver: true,
            vehicle: true,
        },
    });
    reply.send(routes);
};
exports.getRoutes = getRoutes;
const getRouteById = async (req, res) => {
    const { id } = req.params;
    try {
        const route = await req.server.prisma.route.findUnique({
            where: { id },
            include: {
                driver: true,
                vehicle: true,
                stops: { orderBy: { stopOrder: 'asc' } },
            },
        });
        if (!route) {
            return res.code(404).send({ message: 'Route not found' });
        }
        return res.send(route);
    }
    catch (error) {
        console.error('❌ Error fetching route:', error);
        return res.code(500).send({ message: 'Internal Server Error', error: error.message });
    }
};
exports.getRouteById = getRouteById;
const updateRoute = async (req, reply) => {
    const { id } = req.params;
    const { name, startPoint, endPoint, driverId, vehicleId, stops, override } = req.body;
    if (!name || !startPoint || !endPoint) {
        return reply.code(400).send({ message: 'Please provide name, startPoint, and endPoint.' });
    }
    try {
        if (!override) {
            if (vehicleId) {
                const existingVehicleRoute = await req.server.prisma.route.findFirst({
                    where: {
                        AND: [
                            { vehicleId },
                            { id: { not: id } },
                        ],
                    },
                });
                if (existingVehicleRoute) {
                    return reply.code(409).send({
                        warning: true,
                        message: `Vehicle already assigned to Route: ${existingVehicleRoute.name}. Proceed with override?`,
                    });
                }
            }
            if (driverId) {
                const existingDriverRoute = await req.server.prisma.route.findFirst({
                    where: {
                        AND: [
                            { driverId },
                            { id: { not: id } },
                        ],
                    },
                });
                if (existingDriverRoute) {
                    return reply.code(409).send({
                        warning: true,
                        message: `Driver already assigned to Route: ${existingDriverRoute.name}. Proceed with override?`,
                    });
                }
            }
        }
        // Update route basic info
        await req.server.prisma.route.update({
            where: { id },
            data: {
                name,
                startPoint,
                endPoint,
                driverId,
                vehicleId,
            },
        });
        // Remove old stops
        await req.server.prisma.routeStop.deleteMany({ where: { routeId: id } });
        // Add new stops
        if (stops && stops.length > 0) {
            await req.server.prisma.routeStop.createMany({
                data: stops.map((stop) => ({
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
    }
    catch (err) {
        console.error('❌ Error updating route:', err);
        reply.code(500).send({ message: 'Error updating route', error: err.message });
    }
};
exports.updateRoute = updateRoute;
const deleteRoute = async (req, reply) => {
    const { id } = req.params;
    try {
        await req.server.prisma.route.delete({ where: { id } });
        reply.send({ message: 'Route deleted' });
    }
    catch {
        reply.code(404).send({ message: 'Route not found' });
    }
};
exports.deleteRoute = deleteRoute;
const toggleRouteStatus = async (req, reply) => {
    const { id } = req.params;
    const route = await req.server.prisma.route.findUnique({ where: { id } });
    if (!route)
        return reply.code(404).send({ message: 'Route not found' });
    const updated = await req.server.prisma.route.update({
        where: { id },
        data: { status: route.status === 'active' ? 'inactive' : 'active' },
    });
    reply.send(updated);
};
exports.toggleRouteStatus = toggleRouteStatus;
const addRouteStopsBulk = async (req, reply) => {
    const { routeId, stops } = req.body;
    if (!routeId || !Array.isArray(stops) || stops.length === 0) {
        return reply.code(400).send({ message: 'routeId and stops are required.' });
    }
    try {
        const created = await req.server.prisma.routeStop.createMany({
            data: stops.map((stop) => ({
                stopName: stop.stopName,
                stopOrder: Number(stop.stopOrder),
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
    }
    catch (error) {
        console.error('❌ Error adding stops in bulk:', error);
        reply.code(500).send({ message: 'Error adding stops', error: error.message });
    }
};
exports.addRouteStopsBulk = addRouteStopsBulk;
