import { FastifyPluginAsync } from 'fastify';
import {
  createOptOutSlab,
  getOptOutSlabs,
  getOptOutSlabById,
  updateOptOutSlab,
  deleteOptOutSlab,
} from './studentOptOutSlab.controller';

const studentOptOutSlabRoutes: FastifyPluginAsync = async (fastify) => {
  // Protect all routes in this module
  fastify.addHook('preHandler', fastify.authenticate);

  // POST   /api/opt-out-slabs        Create a new opt-out
  fastify.post('/', createOptOutSlab);
  
  // GET    /api/opt-out-slabs        List all opt-outs
  fastify.get('/', getOptOutSlabs);

  // GET    /api/opt-out-slabs/:id    Get a single opt-out by ID
  fastify.get('/:id', getOptOutSlabById);

  // PUT    /api/opt-out-slabs/:id    Update an opt-out
  fastify.put('/:id', updateOptOutSlab);

  // DELETE /api/opt-out-slabs/:id    Delete an opt-out
  fastify.delete('/:id', deleteOptOutSlab);
};

export default studentOptOutSlabRoutes;
