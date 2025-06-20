import { FastifyInstance } from 'fastify';
import {
  createRoute,
  getRoutes,
  updateRoute,
  deleteRoute,
  toggleRouteStatus,
} from './route.controller';

export default async function routeRoutes(server: FastifyInstance) {
  // 📥 Get all routes
  server.get('/', {
    preHandler: [server.authenticate],
  }, getRoutes);

  // ➕ Create a new route
  server.post('/', {
    preHandler: [server.authenticate],
  }, createRoute);

  // ✏️ Update a route by ID
  server.put('/:id', {
    preHandler: [server.authenticate],
  }, updateRoute);

  // ❌ Delete a route by ID
  server.delete('/:id', {
    preHandler: [server.authenticate],
  }, deleteRoute);

  // 🔁 Toggle route status (active/inactive)
  server.patch('/:id/status', {
    preHandler: [server.authenticate],
  }, toggleRouteStatus);
}
