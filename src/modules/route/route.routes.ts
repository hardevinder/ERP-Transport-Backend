import { FastifyInstance } from 'fastify';
import {
  createRoute,
  getRoutes,
  getRouteById, // ✅ NEW
  updateRoute,
  deleteRoute,
  toggleRouteStatus,
  addRouteStopsBulk,
} from './route.controller';

export default async function routeRoutes(server: FastifyInstance) {
  // 📥 Get all routes
  server.get('/', {
    preHandler: [server.authenticate],
  }, getRoutes);

  // 📥 Get route by ID
  server.get('/:id', {
    preHandler: [server.authenticate],
  }, getRouteById); // ✅ NEW

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

  // ➕ Bulk add stops to a route
  server.post('/add-stops', {
    preHandler: [server.authenticate],
  }, addRouteStopsBulk);
}
