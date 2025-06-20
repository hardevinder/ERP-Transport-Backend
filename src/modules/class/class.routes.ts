import { FastifyPluginAsync } from 'fastify';
import {
  createClass,
  getAllClasses,
  getClassById,
  updateClass,
  deleteClass,
} from './class.controller';

const classRoutes: FastifyPluginAsync = async (fastify) => {
  // Apply JWT authentication to all class routes
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.post('/', createClass);          // ➕ Create new class
  fastify.get('/', getAllClasses);         // 📋 Get all classes
  fastify.get('/:id', getClassById);       // 🔍 Get class by ID
  fastify.put('/:id', updateClass);        // ✏️ Update class
  fastify.delete('/:id', deleteClass);     // 🗑️ Delete class
};

export default classRoutes;
