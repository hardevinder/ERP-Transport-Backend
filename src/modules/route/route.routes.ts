import { FastifyInstance } from 'fastify';
import {
  createRoute,
  getRoutes,
  getRouteById,
  updateRoute,
  deleteRoute,
  toggleRouteStatus,
  addRouteStopsBulk,
  countRoutes, // ✅ Import the new function
} from './route.controller';

export default async function routeRoutes(server: FastifyInstance) {
  // 📥 Get all routes
  server.get('/', {
    preHandler: [server.authenticate],
  }, getRoutes);

  // 🔢 Get total route count
  server.get('/count', {
    preHandler: [server.authenticate],
  }, countRoutes); // ✅ New route added

  // 📥 Get route by ID
  server.get('/:id', {
    preHandler: [server.authenticate],
  }, getRouteById);

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
