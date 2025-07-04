"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = vehicleRoutes;
const vehicle_controller_1 = require("./vehicle.controller");
async function vehicleRoutes(server) {
    server.get('/', { preHandler: [server.authenticate] }, vehicle_controller_1.getVehicles);
    server.post('/', { preHandler: [server.authenticate] }, vehicle_controller_1.createVehicle);
    server.put('/:id', { preHandler: [server.authenticate] }, vehicle_controller_1.updateVehicle);
    server.delete('/:id', { preHandler: [server.authenticate] }, vehicle_controller_1.deleteVehicle);
    server.patch('/:id/status', { preHandler: [server.authenticate] }, vehicle_controller_1.toggleVehicleStatus);
}
