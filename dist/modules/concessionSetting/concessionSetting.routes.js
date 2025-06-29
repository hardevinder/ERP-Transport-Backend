"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const concessionSetting_controller_1 = require("./concessionSetting.controller");
const concessionRoutes = async (fastify) => {
    // Protect all routes under /api/concessions
    fastify.addHook('onRequest', fastify.authenticate);
    fastify.get('/', concessionSetting_controller_1.getAllConcessions); // 🔐 GET all
    fastify.post('/', concessionSetting_controller_1.createConcession); // 🔐 POST new
    fastify.put('/:id', concessionSetting_controller_1.updateConcession); // 🔐 PUT update
    fastify.delete('/:id', concessionSetting_controller_1.deleteConcession); // 🔐 DELETE
};
exports.default = concessionRoutes;
