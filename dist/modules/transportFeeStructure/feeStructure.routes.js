"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const feeStructure_controller_1 = require("./feeStructure.controller");
const feeStructureRoutes = async (fastify) => {
    // Open route — koi authentication nahi
    fastify.get('/', feeStructure_controller_1.getFeeStructures);
    // Protected routes — require JWT authentication
    fastify.post('/', { preHandler: fastify.authenticate }, feeStructure_controller_1.createFeeStructure);
    fastify.put('/:id', { preHandler: fastify.authenticate }, feeStructure_controller_1.updateFeeStructure);
    fastify.delete('/:id', { preHandler: fastify.authenticate }, feeStructure_controller_1.deleteFeeStructure);
};
exports.default = feeStructureRoutes;
