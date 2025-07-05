"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const student_controller_1 = require("./student.controller");
const import_controller_1 = require("./import.controller");
const studentRoutes = async (fastify) => {
    // ❌ No multer used, since we're using @fastify/multipart
    // 📌 Core CRUD
    fastify.post('/', student_controller_1.createStudent);
    fastify.put('/:id', student_controller_1.updateStudent);
    fastify.get('/:id', student_controller_1.getStudentById);
    fastify.get('/', student_controller_1.getAllStudents);
    fastify.delete('/:id', student_controller_1.deleteStudent);
    fastify.patch('/:id/toggle-status', student_controller_1.toggleStudentStatus);
    // 🔐 Login
    fastify.post('/login', student_controller_1.studentLogin);
    // 📥 Excel Import
    fastify.post('/import', import_controller_1.importStudentsFromExcel); // ✅ req.file() works here
    // 📤 Sample Excel Template
    fastify.get('/download-sample', import_controller_1.downloadSampleExcel);
    // 📸 Upload Profile Picture (you must use req.file('image') inside controller)
    fastify.post('/upload-picture', student_controller_1.uploadProfilePicture);
    // 📊 Route-wise Student Count
    fastify.get('/count-by-route', student_controller_1.getStudentCountByRoute);
};
exports.default = studentRoutes;
