"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const fastify_multer_1 = __importDefault(require("fastify-multer"));
const student_controller_1 = require("./student.controller");
const import_controller_1 = require("./import.controller");
// 📦 Multer setup for file upload
const storage = fastify_multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const dir = path_1.default.resolve('public/uploads/profile'); // 🔥 FIXED
        fs_1.default.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path_1.default.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});
const upload = (0, fastify_multer_1.default)({ storage });
const studentRoutes = async (fastify) => {
    // 🔌 Register fastify-multer plugin (only once in your app if global)
    fastify.register(fastify_multer_1.default.contentParser);
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
    fastify.post('/import', import_controller_1.importStudentsFromExcel);
    // 📤 Sample Download
    fastify.get('/download-sample', import_controller_1.downloadSampleExcel);
    // 📸 Upload Profile Picture
    fastify.post('/upload-picture', { preHandler: upload.single('image') }, student_controller_1.uploadProfilePicture);
};
exports.default = studentRoutes;
