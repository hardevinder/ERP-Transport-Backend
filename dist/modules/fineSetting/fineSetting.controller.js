"use strict";
// src/modules/fineSetting/fineSetting.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFineSetting = exports.getFineSettingById = exports.getFineSettings = exports.updateFineSetting = exports.createFineSetting = void 0;
// ✅ CREATE
const createFineSetting = async (req, reply) => {
    const body = req.body;
    try {
        const setting = await req.server.prisma.fineSetting.create({ data: body });
        reply.code(201).send({ message: '✅ Fine setting created', setting });
    }
    catch (error) {
        reply.code(500).send({ message: '❌ Failed to create fine setting', error: error.message });
    }
};
exports.createFineSetting = createFineSetting;
// 🔁 UPDATE
const updateFineSetting = async (req, reply) => {
    const { id } = req.params;
    const body = req.body;
    try {
        const updated = await req.server.prisma.fineSetting.update({
            where: { id },
            data: body,
        });
        reply.send({ message: '✅ Fine setting updated', updated });
    }
    catch (error) {
        reply.code(500).send({ message: '❌ Failed to update fine setting', error: error.message });
    }
};
exports.updateFineSetting = updateFineSetting;
// 📥 GET ALL
const getFineSettings = async (req, reply) => {
    try {
        const settings = await req.server.prisma.fineSetting.findMany({ orderBy: { createdAt: 'desc' } });
        reply.send(settings);
    }
    catch (error) {
        reply.code(500).send({ message: '❌ Failed to fetch fine settings', error: error.message });
    }
};
exports.getFineSettings = getFineSettings;
// 📥 GET ONE
const getFineSettingById = async (req, reply) => {
    const { id } = req.params;
    try {
        const setting = await req.server.prisma.fineSetting.findUnique({ where: { id } });
        if (!setting)
            return reply.code(404).send({ message: '❌ Fine setting not found' });
        reply.send(setting);
    }
    catch (error) {
        reply.code(500).send({ message: '❌ Failed to fetch fine setting', error: error.message });
    }
};
exports.getFineSettingById = getFineSettingById;
// ❌ DELETE
const deleteFineSetting = async (req, reply) => {
    const { id } = req.params;
    try {
        await req.server.prisma.fineSetting.delete({ where: { id } });
        reply.send({ message: '🗑️ Fine setting deleted successfully' });
    }
    catch (error) {
        reply.code(500).send({ message: '❌ Failed to delete fine setting', error: error.message });
    }
};
exports.deleteFineSetting = deleteFineSetting;
