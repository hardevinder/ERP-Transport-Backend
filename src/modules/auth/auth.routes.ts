import { FastifyInstance } from 'fastify';
import { login, register, getMe } from './auth.controller';

export default async function authRoutes(server: FastifyInstance) {
  server.post('/register', register); // <--- new
  server.post('/login', login);
  server.get('/me', { preHandler: [server.authenticate] }, getMe);
}
