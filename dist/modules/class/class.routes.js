"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const class_controller_1 = require("./class.controller");
const import_controller_1 = require("./import.controller");
const classRoutes = async (fastify) => {
    // ✅ Apply JWT auth middleware to all routes
    fastify.addHook('onRequest', fastify.authenticate);
    // 🔁 CRUD Routes
    fastify.post('/', class_controller_1.createClass); // ➕ Create new class
    fastify.get('/', class_controller_1.getAllClasses); // 📋 Get all classes
    fastify.get('/:id', class_controller_1.getClassById); // 🔍 Get class by ID
    fastify.put('/:id', class_controller_1.updateClass); // ✏️ Update class
    fastify.delete('/:id', class_controller_1.deleteClass); // 🗑️ Delete class
    // 📤 Download Sample Excel
    fastify.get('/sample', import_controller_1.downloadSampleClassExcel);
    // 📥 Import Classes via Excel
    fastify.post('/import', import_controller_1.importClassesFromExcel); // ❌ Removed consumes to fix TS error
};
exports.default = classRoutes;
