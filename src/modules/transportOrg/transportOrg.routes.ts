import { FastifyPluginAsync } from 'fastify';
import {
  getTransportProfile,
  createTransportProfile,
  updateTransportProfile,
  deleteTransportProfile,
} from './transportOrg.controller';

const transportOrgRoutes: FastifyPluginAsync = async (fastify) => {
  // ✅ Get all profiles
  fastify.get('/profile', { preHandler: [fastify.authenticate] }, getTransportProfile);

  // ✅ Create new profile
  fastify.post('/profile', { preHandler: [fastify.authenticate] }, createTransportProfile);

  // ✅ Update existing profile by ID
  fastify.put('/profile/:id', { preHandler: [fastify.authenticate] }, updateTransportProfile);

  // ✅ Delete profile by ID
  fastify.delete('/profile/:id', { preHandler: [fastify.authenticate] }, deleteTransportProfile);
};

export default transportOrgRoutes;
