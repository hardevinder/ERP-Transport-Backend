import { FastifyPluginAsync } from 'fastify';
import {
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentById,
  toggleStudentStatus,
  getAllStudents,
  studentLogin,
} from './student.controller';

import {
  importStudentsFromExcel,
  downloadSampleExcel,
} from './import.controller'; // ✅ Excel routes

const studentRoutes: FastifyPluginAsync = async (fastify) => {
  // 📌 Core CRUD
  fastify.post('/', createStudent);
  fastify.put('/:id', updateStudent);
  fastify.get('/:id', getStudentById);
  fastify.get('/', getAllStudents);
  fastify.delete('/:id', deleteStudent);
  fastify.patch('/:id/toggle-status', toggleStudentStatus);

  // 🔐 Login
  fastify.post('/login', studentLogin);

  // 📥 Excel Import (Removed invalid `consumes` key)
  fastify.post('/import', importStudentsFromExcel);

  // 📤 Sample Download
  fastify.get('/download-sample', downloadSampleExcel);
};

export default studentRoutes;
