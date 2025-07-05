"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = driverRoutes;
const driver_controller_1 = require("./driver.controller");
async function driverRoutes(server) {
    // ➕ Create driver
    server.post('/', { preHandler: [server.authenticate] }, driver_controller_1.createDriver);
    // 📥 Get all drivers
    server.get('/', { preHandler: [server.authenticate] }, driver_controller_1.getDrivers);
    // 🔢 Get driver count
    server.get('/count', { preHandler: [server.authenticate] }, driver_controller_1.countDrivers); // ✅ Added
    // ✏️ Update driver
    server.put('/:id', { preHandler: [server.authenticate] }, driver_controller_1.updateDriver);
    // ❌ Delete driver
    server.delete('/:id', { preHandler: [server.authenticate] }, driver_controller_1.deleteDriver);
    // 🔁 Toggle driver status
    server.patch('/:id/status', { preHandler: [server.authenticate] }, driver_controller_1.toggleDriverStatus);
}
