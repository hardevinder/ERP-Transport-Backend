"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const student_controller_1 = require("./student.controller");
const import_controller_1 = require("./import.controller"); // ✅ Excel routes
const studentRoutes = async (fastify) => {
    // 📌 Core CRUD
    fastify.post('/', student_controller_1.createStudent);
    fastify.put('/:id', student_controller_1.updateStudent);
    fastify.get('/:id', student_controller_1.getStudentById);
    fastify.get('/', student_controller_1.getAllStudents);
    fastify.delete('/:id', student_controller_1.deleteStudent);
    fastify.patch('/:id/toggle-status', student_controller_1.toggleStudentStatus);
    // 🔐 Login
    fastify.post('/login', student_controller_1.studentLogin);
    // 📥 Excel Import (Removed invalid `consumes` key)
    fastify.post('/import', import_controller_1.importStudentsFromExcel);
    // 📤 Sample Download
    fastify.get('/download-sample', import_controller_1.downloadSampleExcel);
};
exports.default = studentRoutes;
