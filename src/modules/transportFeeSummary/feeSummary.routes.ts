// src/modules/transportFeeSummary/feeSummary.routes.ts

import { FastifyPluginAsync } from 'fastify';
import { getFeeSummaries, getStudentsByVehicle } from './feeSummary.controller'; // ✅ Import new controller

const feeSummaryRoutes: FastifyPluginAsync = async (fastify) => {
  // 🔹 Monthly/Quarterly Summary (All Students)
  fastify.get('/', {
    preHandler: [fastify.authenticate],
  }, getFeeSummaries);

  // 🔹 Vehicle-wise Summary
  fastify.get('/by-vehicle/:vehicleId', {
    preHandler: [fastify.authenticate],
  }, getStudentsByVehicle); // ✅ New route
};

export default feeSummaryRoutes;
