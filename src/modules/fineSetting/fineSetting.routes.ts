// src/modules/fineSetting/fineSetting.routes.ts

import { FastifyPluginAsync } from 'fastify';
import {
  createFineSetting,
  getFineSettings,
  getFineSettingById,
  updateFineSetting,
  deleteFineSetting,
} from './fineSetting.controller';

const fineSettingRoutes: FastifyPluginAsync = async (fastify) => {
  const auth = { preHandler: [fastify.authenticate] };

  fastify.post('/', auth, createFineSetting);        // ✅ Create new fine setting
  fastify.get('/', auth, getFineSettings);           // 📥 Get all
  fastify.get('/:id', auth, getFineSettingById);     // 📥 Get one by ID
  fastify.put('/:id', auth, updateFineSetting);      // 🔁 Update
  fastify.delete('/:id', auth, deleteFineSetting);   // ❌ Delete
};

export default fineSettingRoutes;
