"use strict";
// src/modules/fineSetting/fineSetting.routes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const fineSetting_controller_1 = require("./fineSetting.controller");
const fineSettingRoutes = async (fastify) => {
    const auth = { preHandler: [fastify.authenticate] };
    fastify.post('/', auth, fineSetting_controller_1.createFineSetting); // ✅ Create new fine setting
    fastify.get('/', auth, fineSetting_controller_1.getFineSettings); // 📥 Get all
    fastify.get('/:id', auth, fineSetting_controller_1.getFineSettingById); // 📥 Get one by ID
    fastify.put('/:id', auth, fineSetting_controller_1.updateFineSetting); // 🔁 Update
    fastify.delete('/:id', auth, fineSetting_controller_1.deleteFineSetting); // ❌ Delete
};
exports.default = fineSettingRoutes;
