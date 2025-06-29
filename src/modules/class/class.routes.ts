import { FastifyPluginAsync } from 'fastify';
import {
  createClass,
  getAllClasses,
  getClassById,
  updateClass,
  deleteClass,
} from './class.controller';

import {
  importClassesFromExcel,
  downloadSampleClassExcel,
} from './import.controller';

const classRoutes: FastifyPluginAsync = async (fastify) => {
  // ✅ Apply JWT auth middleware to all routes
  fastify.addHook('onRequest', fastify.authenticate);

  // 🔁 CRUD Routes
  fastify.post('/', createClass);          // ➕ Create new class
  fastify.get('/', getAllClasses);         // 📋 Get all classes
  fastify.get('/:id', getClassById);       // 🔍 Get class by ID
  fastify.put('/:id', updateClass);        // ✏️ Update class
  fastify.delete('/:id', deleteClass);     // 🗑️ Delete class

  // 📤 Download Sample Excel
  fastify.get('/sample', downloadSampleClassExcel);

  // 📥 Import Classes via Excel
  fastify.post('/import', importClassesFromExcel); // ❌ Removed consumes to fix TS error
};

export default classRoutes;
