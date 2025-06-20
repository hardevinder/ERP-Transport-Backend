// src/modules/routeStop/routeStop.routes.ts
import { FastifyInstance } from 'fastify';
import {
  createStop,
  getStopsByRoute,
  getAllStopsWithRouteName, // ✅ Import the new controller
  updateStop,
  deleteStop,
  toggleStopStatus,
} from './routeStop.controller';

export default async function routeStopRoutes(server: FastifyInstance) {
  server.get('/all-with-route-name', { preHandler: [server.authenticate] }, getAllStopsWithRouteName); // ✅ New route
  server.get('/:routeId', { preHandler: [server.authenticate] }, getStopsByRoute);
  server.post('/', { preHandler: [server.authenticate] }, createStop);
  server.put('/:id', { preHandler: [server.authenticate] }, updateStop);
  server.delete('/:id', { preHandler: [server.authenticate] }, deleteStop);
  server.patch('/:id/toggle-status', { preHandler: [server.authenticate] }, toggleStopStatus);
}
