"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const studentOptOutSlab_controller_1 = require("./studentOptOutSlab.controller");
const studentOptOutSlabRoutes = async (fastify) => {
    // Protect all routes in this module
    fastify.addHook('preHandler', fastify.authenticate);
    // POST   /api/opt-out-slabs        Create a new opt-out
    fastify.post('/', studentOptOutSlab_controller_1.createOptOutSlab);
    // GET    /api/opt-out-slabs        List all opt-outs
    fastify.get('/', studentOptOutSlab_controller_1.getOptOutSlabs);
    // GET    /api/opt-out-slabs/:id    Get a single opt-out by ID
    fastify.get('/:id', studentOptOutSlab_controller_1.getOptOutSlabById);
    // PUT    /api/opt-out-slabs/:id    Update an opt-out
    fastify.put('/:id', studentOptOutSlab_controller_1.updateOptOutSlab);
    // DELETE /api/opt-out-slabs/:id    Delete an opt-out
    fastify.delete('/:id', studentOptOutSlab_controller_1.deleteOptOutSlab);
};
exports.default = studentOptOutSlabRoutes;
