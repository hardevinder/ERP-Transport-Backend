"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = routeRoutes;
const route_controller_1 = require("./route.controller");
async function routeRoutes(server) {
    // 📥 Get all routes
    server.get('/', {
        preHandler: [server.authenticate],
    }, route_controller_1.getRoutes);
    // 📥 Get route by ID
    server.get('/:id', {
        preHandler: [server.authenticate],
    }, route_controller_1.getRouteById);
    // ➕ Create a new route
    server.post('/', {
        preHandler: [server.authenticate],
    }, route_controller_1.createRoute);
    // ✏️ Update a route by ID
    server.put('/:id', {
        preHandler: [server.authenticate],
    }, route_controller_1.updateRoute);
    // ❌ Delete a route by ID
    server.delete('/:id', {
        preHandler: [server.authenticate],
    }, route_controller_1.deleteRoute);
    // 🔁 Toggle route status (active/inactive)
    server.patch('/:id/status', {
        preHandler: [server.authenticate],
    }, route_controller_1.toggleRouteStatus);
    // ➕ Bulk add stops to a route
    server.post('/add-stops', {
        preHandler: [server.authenticate],
    }, route_controller_1.addRouteStopsBulk);
}
