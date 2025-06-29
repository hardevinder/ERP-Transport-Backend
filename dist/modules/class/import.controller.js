"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadSampleClassExcel = exports.importClassesFromExcel = void 0;
const xlsx = __importStar(require("xlsx"));
// 📥 Import Classes from Excel
const importClassesFromExcel = async (req, reply) => {
    const data = await req.file();
    if (!data)
        return reply.code(400).send({ message: 'No file uploaded' });
    if (data.mimetype !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        return reply.code(400).send({ message: 'Invalid file format. Please upload an .xlsx file.' });
    }
    try {
        const buffer = await data.toBuffer();
        const workbook = xlsx.read(buffer, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = xlsx.utils.sheet_to_json(sheet);
        let count = 0;
        const errors = [];
        for (const row of rows) {
            const typedRow = row;
            const name = String(typedRow['Class'] || '').trim();
            if (!name) {
                errors.push('Skipped a row due to missing Class name');
                continue;
            }
            const exists = await req.server.prisma.schoolClass.findUnique({ where: { name } });
            if (exists) {
                errors.push(`Class "${name}" already exists`);
                continue;
            }
            await req.server.prisma.schoolClass.create({ data: { name } });
            count++;
        }
        reply.send({ message: `${count} classes imported`, errors });
    }
    catch (err) {
        console.error('❌ Error importing classes:', err);
        reply.code(500).send({ message: 'Failed to import classes.', error: err.message });
    }
};
exports.importClassesFromExcel = importClassesFromExcel;
// 📤 Download Class Sample Template
const downloadSampleClassExcel = async (req, reply) => {
    try {
        const headers = ['Class'];
        const rows = [['Class 1'], ['Class 2']];
        const sheet = xlsx.utils.aoa_to_sheet([headers, ...rows]);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, sheet, 'Classes');
        const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        return reply
            .header('Content-Disposition', 'attachment; filename="class_sample.xlsx"')
            .header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            .send(buffer);
    }
    catch (err) {
        console.error('❌ Failed to generate sample Excel:', err);
        return reply.code(500).send({ message: 'Failed to generate sample template.', error: err.message });
    }
};
exports.downloadSampleClassExcel = downloadSampleClassExcel;
