"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.getStudentCountByRoute = exports.uploadProfilePicture = exports.studentLogin = exports.getAllStudents = exports.toggleStudentStatus = exports.deleteStudent = exports.getStudentById = exports.updateStudent = exports.createStudent = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
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
            profilePicture: student.profilePicture, // ✅ ADD THIS LINE
            gender: student.gender,
            transactions: student.transactions,
        },
    });
};
exports.studentLogin = studentLogin;
const uploadProfilePicture = async (req, reply) => {
    try {
        const parts = req.parts();
        let studentId;
        let uploadedFile;
        for await (const part of parts) {
            if (part.type === 'file') {
                uploadedFile = part;
            }
            else if (part.type === 'field' && part.fieldname === 'id') {
                studentId = part.value;
            }
        }
        if (!studentId || !uploadedFile) {
            return reply.code(400).send({ message: 'Missing student ID or file.' });
        }
        const ext = path_1.default.extname(uploadedFile.filename);
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        const relativePath = `/uploads/profile/${uniqueName}`;
        const savePath = path_1.default.join(process.cwd(), 'public', 'uploads', 'profile', uniqueName);
        const buffer = await uploadedFile.toBuffer();
        await promises_1.default.mkdir(path_1.default.dirname(savePath), { recursive: true });
        await promises_1.default.writeFile(savePath, buffer);
        const updatedStudent = await req.server.prisma.student.update({
            where: { id: studentId },
            data: { profilePicture: relativePath },
        });
        return reply.send({
            message: 'Profile photo uploaded successfully',
            student: updatedStudent,
        });
    }
    catch (error) {
        console.error('❌ Upload error:', error);
        return reply.code(500).send({ message: 'Failed to upload profile picture' });
    }
};
exports.uploadProfilePicture = uploadProfilePicture;
// 📊 Get student count per route and total
const getStudentCountByRoute = async (req, reply) => {
    try {
        // 1️⃣ Group students by routeId and count
        const routeWiseCounts = await req.server.prisma.student.groupBy({
            by: ['routeId'],
            where: {
                status: 'active',
                routeId: {
                    not: null,
                },
            },
            _count: {
                id: true,
            },
        });
        // 2️⃣ Fetch route names
        const routeIds = routeWiseCounts.map((r) => r.routeId);
        const routes = await req.server.prisma.route.findMany({
            where: {
                id: { in: routeIds },
            },
        });
        const routeMap = new Map(routes.map(r => [r.id, r.name]));
        // 3️⃣ Format data with route names
        const result = routeWiseCounts.map(r => ({
            routeId: r.routeId,
            routeName: routeMap.get(r.routeId) || 'Unknown',
            studentCount: r._count.id,
        }));
        // 4️⃣ Total count
        const total = result.reduce((sum, r) => sum + r.studentCount, 0);
        return reply.send({
            status: 200,
            message: 'Student count by route',
            data: {
                routes: result,
                total,
            },
        });
    }
    catch (err) {
        console.error("STUDENT COUNT ROUTEWISE ERROR:", err);
        return reply.code(500).send({
            message: 'Failed to fetch student count by route',
            error: err.message,
        });
    }
};
exports.getStudentCountByRoute = getStudentCountByRoute;
// 🔒 Change student password
const changePassword = async (req, reply) => {
    const { studentId, currentPassword, newPassword } = req.body;
    if (!studentId || !currentPassword || !newPassword) {
        return reply.code(400).send({ message: 'All fields are required' });
    }
    const student = await req.server.prisma.student.findUnique({ where: { id: studentId } });
    if (!student || !student.password) {
        return reply.code(404).send({ message: 'Student not found or password not set' });
    }
    const isMatch = await bcrypt_1.default.compare(currentPassword, student.password);
    if (!isMatch) {
        return reply.code(401).send({ message: 'Current password is incorrect' });
    }
    const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
    await req.server.prisma.student.update({
        where: { id: studentId },
        data: { password: hashedPassword },
    });
    reply.send({ message: 'Password changed successfully' });
};
exports.changePassword = changePassword;
