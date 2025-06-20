import { FastifyInstance } from 'fastify';
import {
  createDriver,
  getDrivers,
  updateDriver,
  deleteDriver,
  toggleDriverStatus,
} from './driver.controller';

export default async function driverRoutes(server: FastifyInstance) {
  server.post('/', { preHandler: [server.authenticate] }, createDriver);
  server.get('/', { preHandler: [server.authenticate] }, getDrivers);
  server.put('/:id', { preHandler: [server.authenticate] }, updateDriver);
  server.delete('/:id', { preHandler: [server.authenticate] }, deleteDriver);
  server.patch('/:id/status', { preHandler: [server.authenticate] }, toggleDriverStatus);
}
