import { FastifyPluginAsync } from 'fastify';
import path from 'path';
import fs from 'fs';
import multer from 'fastify-multer';

import {
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentById,
  toggleStudentStatus,
  getAllStudents,
  studentLogin,
  uploadProfilePicture, // ✅ Upload profile controller
  getStudentCountByRoute, // ✅ New routewise count controller
} from './student.controller';

import {
  importStudentsFromExcel,
  downloadSampleExcel,
} from './import.controller';

// 📦 Multer setup for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.resolve('public/uploads/profile');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

const studentRoutes: FastifyPluginAsync = async (fastify) => {
  // 🔌 Register multer parser once
  fastify.register(multer.contentParser);

  // 📌 Core CRUD
  fastify.post('/', createStudent);
  fastify.put('/:id', updateStudent);
  fastify.get('/:id', getStudentById);
  fastify.get('/', getAllStudents);
  fastify.delete('/:id', deleteStudent);
  fastify.patch('/:id/toggle-status', toggleStudentStatus);

  // 🔐 Login
  fastify.post('/login', studentLogin);

  // 📥 Excel Import
  fastify.post('/import', importStudentsFromExcel);

  // 📤 Sample Excel Template
  fastify.get('/download-sample', downloadSampleExcel);

  // 📸 Upload Profile Picture
  fastify.post('/upload-picture', { preHandler: upload.single('image') }, uploadProfilePicture);

  // 📊 New: Route-wise Student Count
  fastify.get('/count-by-route', getStudentCountByRoute);
};

export default studentRoutes;
