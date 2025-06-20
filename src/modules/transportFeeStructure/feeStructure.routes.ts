import { FastifyPluginAsync } from 'fastify';
import {
  createFeeStructure,
  getFeeStructures,
  updateFeeStructure,
  deleteFeeStructure,
} from './feeStructure.controller';

const feeStructureRoutes: FastifyPluginAsync = async (fastify) => {
  // Open route — koi authentication nahi
  fastify.get('/', getFeeStructures);

  // Protected routes — require JWT authentication
  fastify.post('/', { preHandler: fastify.authenticate }, createFeeStructure);
  fastify.put('/:id', { preHandler: fastify.authenticate }, updateFeeStructure);
  fastify.delete('/:id', { preHandler: fastify.authenticate }, deleteFeeStructure);
};

export default feeStructureRoutes;
