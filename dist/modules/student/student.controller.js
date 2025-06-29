"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentLogin = exports.getAllStudents = exports.toggleStudentStatus = exports.deleteStudent = exports.getStudentById = exports.updateStudent = exports.createStudent = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
// Utility to get current month if needed
function getCurrentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}
// 🚀 Create a new student
const createStudent = async (req, reply) => {
    const { name, phone, admissionNumber, password, classId, routeId, stopId, concessionId, addressLine, cityOrVillage, gender, // ✅ added
     } = req.body;
    let feeAmount = 0;
    let feeSlab = 'custom';
    if (stopId) {
        const stop = await req.server.prisma.routeStop.findUnique({ where: { id: stopId } });
        if (stop?.feeAmount)
            feeAmount = stop.feeAmount;
    }
    const hashedPassword = password ? await bcrypt_1.default.hash(password, 10) : undefined;
    const student = await req.server.prisma.student.create({
        data: {
            name,
            phone,
            admissionNumber,
            password: hashedPassword,
            classId,
            routeId,
            stopId,
            feeSlab,
            concessionId,
            addressLine,
            cityOrVillage,
            gender, // ✅ saved
        },
        include: {
            route: true,
            stop: true,
            class: true,
            transactions: true,
        },
    });
    reply.code(201).send({ ...student, expectedFee: feeAmount });
};
exports.createStudent = createStudent;
// 🛠️ Update existing student
const updateStudent = async (req, reply) => {
    const { id } = req.params;
    const { name, phone, admissionNumber, password, classId, routeId, stopId, concessionId, addressLine, cityOrVillage, gender, // ✅ added
     } = req.body;
    const existing = await req.server.prisma.student.findUnique({ where: { id } });
    if (!existing)
        return reply.code(404).send({ message: 'Student not found' });
    const updatedData = {
        name,
        phone,
        admissionNumber,
        classId,
        routeId,
        stopId,
        concessionId,
        addressLine,
        cityOrVillage,
        gender, // ✅ updated
    };
    if (password) {
        updatedData.password = await bcrypt_1.default.hash(password, 10);
    }
    const updated = await req.server.prisma.student.update({
        where: { id },
        data: updatedData,
        include: { route: true, stop: true, class: true, transactions: true },
    });
    reply.send(updated);
};
exports.updateStudent = updateStudent;
// 🔍 Get one student
const getStudentById = async (req, reply) => {
    const { id } = req.params;
    const student = await req.server.prisma.student.findUnique({
        where: { id },
        include: {
            route: true,
            stop: true,
            class: true,
            transactions: {
                orderBy: { paymentDate: 'desc' },
            },
        },
    });
    if (!student) {
        return reply.code(404).send({ message: 'Student not found' });
    }
    reply.send(student);
};
exports.getStudentById = getStudentById;
// ❌ Delete student
const deleteStudent = async (req, reply) => {
    const { id } = req.params;
    try {
        await req.server.prisma.student.delete({ where: { id } });
        reply.send({ message: 'Student deleted' });
    }
    catch {
        reply.code(404).send({ message: 'Student not found' });
    }
};
exports.deleteStudent = deleteStudent;
// 🔁 Toggle student status
const toggleStudentStatus = async (req, reply) => {
    const { id } = req.params;
    const student = await req.server.prisma.student.findUnique({ where: { id } });
    if (!student)
        return reply.code(404).send({ message: 'Student not found' });
    const updated = await req.server.prisma.student.update({
        where: { id },
        data: {
            status: student.status === 'active' ? 'inactive' : 'active',
        },
    });
    reply.send(updated);
};
exports.toggleStudentStatus = toggleStudentStatus;
// 📋 Get all students
const getAllStudents = async (req, reply) => {
    const students = await req.server.prisma.student.findMany({
        include: {
            route: true,
            stop: true,
            class: true,
            transactions: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
    reply.send(students);
};
exports.getAllStudents = getAllStudents;
// 🔐 Student Login
const studentLogin = async (req, reply) => {
    const { admissionNumber, password } = req.body;
    if (!admissionNumber || !password) {
        return reply.code(400).send({ message: 'Admission number and password are required' });
    }
    const student = await req.server.prisma.student.findUnique({
        where: { admissionNumber },
        include: {
            route: { include: { driver: true } },
            stop: true,
            class: true,
            transactions: {
                orderBy: { paymentDate: 'desc' },
            },
        },
    });
    if (!student || !student.password) {
        return reply.code(401).send({ message: 'Invalid admission number or password' });
    }
    const isValid = await bcrypt_1.default.compare(password, student.password);
    if (!isValid) {
        return reply.code(401).send({ message: 'Invalid admission number or password' });
    }
    const token = req.server.jwt.sign({ studentId: student.id, role: 'student' });
    return reply.send({
        token,
        student: {
            id: student.id,
            name: student.name,
            phone: student.phone,
            admissionNumber: student.admissionNumber,
            class: student.class,
            route: student.route,
            stop: student.stop,
            addressLine: student.addressLine,
            cityOrVillage: student.cityOrVillage,
            gender: student.gender,
            transactions: student.transactions,
        },
    });
};
exports.studentLogin = studentLogin;
