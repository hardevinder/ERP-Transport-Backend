import { FastifyPluginAsync } from 'fastify';
import {
  getAllConcessions,
  createConcession,
  updateConcession,
  deleteConcession,
} from './concessionSetting.controller';

const concessionRoutes: FastifyPluginAsync = async (fastify) => {
  // Protect all routes under /api/concessions
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.get('/', getAllConcessions);         // 🔐 GET all
  fastify.post('/', createConcession);         // 🔐 POST new
  fastify.put('/:id', updateConcession);       // 🔐 PUT update
  fastify.delete('/:id', deleteConcession);    // 🔐 DELETE
};

export default concessionRoutes;
