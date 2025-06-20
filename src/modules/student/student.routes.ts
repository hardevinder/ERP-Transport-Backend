import { FastifyPluginAsync } from 'fastify';
import {
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentById,
  toggleStudentStatus,
  getAllStudents,
  studentLogin, // ✅ Import login handler
} from './student.controller';

const studentRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/', createStudent);
  fastify.put('/:id', updateStudent);
  fastify.get('/:id', getStudentById);
  fastify.get('/', getAllStudents);
  fastify.delete('/:id', deleteStudent);
  fastify.patch('/:id/toggle-status', toggleStudentStatus);

  // ✅ Login route
  fastify.post('/login', studentLogin);
};

export default studentRoutes;
