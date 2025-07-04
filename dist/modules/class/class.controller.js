"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteClass = exports.updateClass = exports.getClassById = exports.getAllClasses = exports.createClass = void 0;
// ✅ Create a new class
const createClass = async (req, reply) => {
    const { name } = req.body;
    const exists = await req.server.prisma.schoolClass.findUnique({ where: { name } });
    if (exists)
        return reply.code(400).send({ message: 'Class already exists' });
    const newClass = await req.server.prisma.schoolClass.create({
        data: { name },
    });
    reply.code(201).send(newClass);
};
exports.createClass = createClass;
// ✅ Get all classes
const getAllClasses = async (req, reply) => {
    const classes = await req.server.prisma.schoolClass.findMany({
        orderBy: { name: 'asc' },
    });
    reply.send(classes);
};
exports.getAllClasses = getAllClasses;
// ✅ Get a class by ID
const getClassById = async (req, reply) => {
    const { id } = req.params;
    const classRecord = await req.server.prisma.schoolClass.findUnique({
        where: { id },
        include: { students: true },
    });
    if (!classRecord) {
        return reply.code(404).send({ message: 'Class not found' });
    }
    reply.send(classRecord);
};
exports.getClassById = getClassById;
// ✅ Update class
const updateClass = async (req, reply) => {
    const { id } = req.params;
    const { name } = req.body;
    const existing = await req.server.prisma.schoolClass.findUnique({ where: { id } });
    if (!existing)
        return reply.code(404).send({ message: 'Class not found' });
    const updated = await req.server.prisma.schoolClass.update({
        where: { id },
        data: { name },
    });
    reply.send(updated);
};
exports.updateClass = updateClass;
// ✅ Delete class
const deleteClass = async (req, reply) => {
    const { id } = req.params;
    try {
        await req.server.prisma.schoolClass.delete({ where: { id } });
        reply.send({ message: 'Class deleted' });
    }
    catch (err) {
        reply.code(400).send({ message: 'Cannot delete class. It may have students.' });
    }
};
exports.deleteClass = deleteClass;
