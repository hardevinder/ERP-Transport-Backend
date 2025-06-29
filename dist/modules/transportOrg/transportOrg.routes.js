"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const transportOrg_controller_1 = require("./transportOrg.controller");
const transportOrgRoutes = async (fastify) => {
    // ✅ Get all profiles
    fastify.get('/profile', { preHandler: [fastify.authenticate] }, transportOrg_controller_1.getTransportProfile);
    // ✅ Create new profile
    fastify.post('/profile', { preHandler: [fastify.authenticate] }, transportOrg_controller_1.createTransportProfile);
    // ✅ Update existing profile by ID
    fastify.put('/profile/:id', { preHandler: [fastify.authenticate] }, transportOrg_controller_1.updateTransportProfile);
    // ✅ Delete profile by ID
    fastify.delete('/profile/:id', { preHandler: [fastify.authenticate] }, transportOrg_controller_1.deleteTransportProfile);
};
exports.default = transportOrgRoutes;
