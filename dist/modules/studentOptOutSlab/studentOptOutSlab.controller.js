"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOptOutSlab = exports.updateOptOutSlab = exports.getOptOutSlabById = exports.getOptOutSlabs = exports.createOptOutSlab = void 0;
const createOptOutSlab = async (req, reply) => {
    // Accept either one object or an array of objects
    const body = req.body;
    const entries = Array.isArray(body) ? body : [body];
    // Validate
    for (const { studentId, feeStructureId } of entries) {
        if (!studentId || !feeStructureId) {
            return reply
                .code(400)
                .send({ message: 'Each entry requires studentId and feeStructureId' });
        }
    }
    try {
        // Bulk create all entries in a transaction
        const created = await req.server.prisma.$transaction(entries.map(e => req.server.prisma.studentOptOutSlab.create({
            data: {
                studentId: e.studentId,
                feeStructureId: e.feeStructureId,
            },
        })));
        return reply.code(201).send(created);
    }
    catch (err) {
        req.log.error(err);
        if (err.code === 'P2002') {
            // Unique constraint failure (duplicate student+slab)
            return reply
                .code(409)
                .send({ message: 'One or more opt-out entries already exist' });
        }
        return reply
            .code(500)
            .send({ message: 'Could not create opt-out records', error: err.message });
    }
};
exports.createOptOutSlab = createOptOutSlab;
const getOptOutSlabs = async (req, reply) => {
    try {
        const records = await req.server.prisma.studentOptOutSlab.findMany({
            include: { student: true, feeStructure: true },
        });
        return reply.send(records);
    }
    catch (err) {
        req.log.error(err);
        return reply
            .code(500)
            .send({ message: 'Could not fetch opt-out records', error: err.message });
    }
};
exports.getOptOutSlabs = getOptOutSlabs;
const getOptOutSlabById = async (req, reply) => {
    const { id } = req.params;
    try {
        const record = await req.server.prisma.studentOptOutSlab.findUnique({
            where: { id },
            include: { student: true, feeStructure: true },
        });
        if (!record) {
            return reply.code(404).send({ message: 'Opt-out record not found' });
        }
        return reply.send(record);
    }
    catch (err) {
        req.log.error(err);
        return reply
            .code(500)
            .send({ message: 'Could not fetch opt-out record', error: err.message });
    }
};
exports.getOptOutSlabById = getOptOutSlabById;
const updateOptOutSlab = async (req, reply) => {
    const { id } = req.params;
    const { studentId, feeStructureId } = req.body;
    try {
        const existing = await req.server.prisma.studentOptOutSlab.findUnique({
            where: { id },
        });
        if (!existing) {
            return reply.code(404).send({ message: 'Opt-out record not found' });
        }
        const updated = await req.server.prisma.studentOptOutSlab.update({
            where: { id },
            data: {
                studentId: studentId ?? existing.studentId,
                feeStructureId: feeStructureId ?? existing.feeStructureId,
            },
        });
        return reply.send(updated);
    }
    catch (err) {
        req.log.error(err);
        return reply
            .code(500)
            .send({ message: 'Could not update opt-out record', error: err.message });
    }
};
exports.updateOptOutSlab = updateOptOutSlab;
const deleteOptOutSlab = async (req, reply) => {
    const { id } = req.params;
    try {
        await req.server.prisma.studentOptOutSlab.delete({
            where: { id },
        });
        return reply.send({ message: 'Opt-out record deleted' });
    }
    catch (err) {
        req.log.error(err);
        return reply
            .code(500)
            .send({ message: 'Could not delete opt-out record', error: err.message });
    }
};
exports.deleteOptOutSlab = deleteOptOutSlab;
