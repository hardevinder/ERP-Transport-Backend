"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = driverRoutes;
const driver_controller_1 = require("./driver.controller");
async function driverRoutes(server) {
    server.post('/', { preHandler: [server.authenticate] }, driver_controller_1.createDriver);
    server.get('/', { preHandler: [server.authenticate] }, driver_controller_1.getDrivers);
    server.put('/:id', { preHandler: [server.authenticate] }, driver_controller_1.updateDriver);
    server.delete('/:id', { preHandler: [server.authenticate] }, driver_controller_1.deleteDriver);
    server.patch('/:id/status', { preHandler: [server.authenticate] }, driver_controller_1.toggleDriverStatus);
}
