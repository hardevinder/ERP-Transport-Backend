"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteConcession = exports.updateConcession = exports.createConcession = exports.getAllConcessions = void 0;
// 📌 Get all concession settings
const getAllConcessions = async (req, reply) => {
    const concessions = await req.server.prisma.concessionSetting.findMany();
    reply.send(concessions);
};
exports.getAllConcessions = getAllConcessions;
// ➕ Create a new concession
const createConcession = async (req, reply) => {
    const { name, type, value } = req.body;
    const concession = await req.server.prisma.concessionSetting.create({
        data: { name, type, value },
    });
    reply.send(concession);
};
exports.createConcession = createConcession;
// ✏️ Update an existing concession
const updateConcession = async (req, reply) => {
    const { id } = req.params;
    const { name, type, value } = req.body;
    const updated = await req.server.prisma.concessionSetting.update({
        where: { id },
        data: { name, type, value },
    });
    reply.send(updated);
};
exports.updateConcession = updateConcession;
// ❌ Delete a concession
const deleteConcession = async (req, reply) => {
    const { id } = req.params;
    await req.server.prisma.concessionSetting.delete({ where: { id } });
    reply.send({ success: true });
};
exports.deleteConcession = deleteConcession;
