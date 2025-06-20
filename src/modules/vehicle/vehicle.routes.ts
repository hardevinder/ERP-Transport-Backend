import { FastifyInstance } from 'fastify';
import {
  createVehicle,
  getVehicles,
  updateVehicle,
  deleteVehicle,
  toggleVehicleStatus,
} from './vehicle.controller';

export default async function vehicleRoutes(server: FastifyInstance) {
  server.get('/', { preHandler: [server.authenticate] }, getVehicles);
  server.post('/', { preHandler: [server.authenticate] }, createVehicle);
  server.put('/:id', { preHandler: [server.authenticate] }, updateVehicle);
  server.delete('/:id', { preHandler: [server.authenticate] }, deleteVehicle);
  server.patch('/:id/status', { preHandler: [server.authenticate] }, toggleVehicleStatus);
}
