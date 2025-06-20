// src/modules/transportFeeSummary/feeSummary.routes.ts

import { FastifyPluginAsync } from 'fastify';
import { getFeeSummaries } from './feeSummary.controller';

const feeSummaryRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', {
    preHandler: [fastify.authenticate], // ✅ Protected route
  }, getFeeSummaries);
};

export default feeSummaryRoutes;
