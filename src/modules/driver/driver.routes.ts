import { FastifyInstance } from 'fastify';
import {
  createDriver,
  getDrivers,
  updateDriver,
  deleteDriver,
  toggleDriverStatus,
  countDrivers, // ✅ Import the new count function
} from './driver.controller';

export default async function driverRoutes(server: FastifyInstance) {
  // ➕ Create driver
  server.post('/', { preHandler: [server.authenticate] }, createDriver);

  // 📥 Get all drivers
  server.get('/', { preHandler: [server.authenticate] }, getDrivers);

  // 🔢 Get driver count
  server.get('/count', { preHandler: [server.authenticate] }, countDrivers); // ✅ Added

  // ✏️ Update driver
  server.put('/:id', { preHandler: [server.authenticate] }, updateDriver);

  // ❌ Delete driver
  server.delete('/:id', { preHandler: [server.authenticate] }, deleteDriver);

  // 🔁 Toggle driver status
  server.patch('/:id/status', { preHandler: [server.authenticate] }, toggleDriverStatus);
}
