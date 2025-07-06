import { FastifyPluginAsync } from 'fastify';

import {
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentById,
  toggleStudentStatus,
  getAllStudents,
  studentLogin,
  uploadProfilePicture, // ✅ Will use req.file()
  getStudentCountByRoute,
  changePassword, 
} from './student.controller';

import {
  importStudentsFromExcel,
  downloadSampleExcel,
} from './import.controller';

const studentRoutes: FastifyPluginAsync = async (fastify) => {
  // ❌ No multer used, since we're using @fastify/multipart

  // 📌 Core CRUD
  fastify.post('/', createStudent);
  fastify.put('/:id', updateStudent);
  fastify.get('/:id', getStudentById);
  fastify.get('/', getAllStudents);
  fastify.delete('/:id', deleteStudent);
  fastify.patch('/:id/toggle-status', toggleStudentStatus);

  // 🔐 Login
  fastify.post('/login', studentLogin);

  fastify.post('/change-password', changePassword); // ✅ Register route here

  // 📥 Excel Import
  fastify.post('/import', importStudentsFromExcel); // ✅ req.file() works here

  // 📤 Sample Excel Template
  fastify.get('/download-sample', downloadSampleExcel);

  // 📸 Upload Profile Picture (you must use req.file('image') inside controller)
  fastify.post('/upload-picture', uploadProfilePicture);

  // 📊 Route-wise Student Count
  fastify.get('/count-by-route', getStudentCountByRoute);
};

export default studentRoutes;
