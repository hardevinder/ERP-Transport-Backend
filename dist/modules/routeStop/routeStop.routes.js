"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = routeStopRoutes;
const routeStop_controller_1 = require("./routeStop.controller");
async function routeStopRoutes(server) {
    server.get('/all', { preHandler: [server.authenticate] }, routeStop_controller_1.getAllStopsWithRouteName); // ✅ New route
    server.get('/:routeId', { preHandler: [server.authenticate] }, routeStop_controller_1.getStopsByRoute);
    server.post('/', { preHandler: [server.authenticate] }, routeStop_controller_1.createStop);
    server.put('/:id', { preHandler: [server.authenticate] }, routeStop_controller_1.updateStop);
    server.delete('/:id', { preHandler: [server.authenticate] }, routeStop_controller_1.deleteStop);
    server.patch('/:id/toggle-status', { preHandler: [server.authenticate] }, routeStop_controller_1.toggleStopStatus);
}
