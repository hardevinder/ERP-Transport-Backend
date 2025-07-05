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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadSampleExcel = exports.importStudentsFromExcel = void 0;
const xlsx = __importStar(require("xlsx"));
const bcrypt_1 = __importDefault(require("bcrypt"));
// 📥 Upload & Import Students from Excel (Class Name Optional, Gender, Route, Stop Name Included)
const importStudentsFromExcel = async (req, reply) => {
    // console.log('📥 Request Headers:', req.headers); // ✅ ADD THIS
    const data = await req.file();
    // console.log('🔍 Incoming file details:', data?.filename, data?.mimetype);
    if (!data) {
        return reply.code(400).send({ message: 'No file uploaded' });
    }
    if (data.mimetype !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        return reply.code(400).send({ message: 'Invalid file format. Please upload an .xlsx file.' });
    }
    try {
        const buffer = await data.toBuffer();
        const workbook = xlsx.read(buffer, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = xlsx.utils.sheet_to_json(sheet);
        let createdCount = 0;
        let updatedCount = 0;
        const errors = [];
        const validGenders = ['male', 'female', 'other'];
        for (const rowRaw of json) {
            const row = rowRaw; // ✅ TS18046 FIX
            try {
                const admissionNumber = String(row['ADM'] || '').trim();
                const name = String(row['Name'] || '').trim();
                const className = String(row['Class'] || '').trim();
                const routeName = String(row['Route'] || '').trim();
                const stopName = String(row['Stop'] || '').trim();
                const addressLine = String(row['Address'] || '').trim();
                const cityOrVillage = String(row['Location'] || '').trim();
                const phone = String(row['Phone'] || '9999999999').trim();
                const genderRaw = String(row['Gender'] || '').trim();
                const gender = genderRaw.toLowerCase();
                if (!admissionNumber || !name) {
                    errors.push(`Skipping row with ADM: ${row['ADM'] || 'unknown'} - Missing name or admission number`);
                    continue;
                }
                if (gender && !validGenders.includes(gender)) {
                    errors.push(`Skipping row with ADM: ${admissionNumber} - Invalid gender: ${genderRaw}. Expected: ${validGenders.join(', ')}`);
                    continue;
                }
                let classId = undefined;
                if (className) {
                    const classObj = await req.server.prisma.schoolClass.findFirst({
                        where: { name: className },
                    });
                    if (!classObj) {
                        errors.push(`Skipping row with ADM: ${admissionNumber} - Invalid class name: ${className}`);
                        continue;
                    }
                    classId = classObj.id;
                }
                let routeId = undefined;
                if (routeName) {
                    const route = await req.server.prisma.route.findFirst({
                        where: { name: routeName },
                    });
                    if (!route) {
                        errors.push(`Skipping row with ADM: ${admissionNumber} - Invalid route name: ${routeName}`);
                        continue;
                    }
                    routeId = route.id;
                }
                let stopId = undefined;
                if (stopName && routeId) {
                    const stop = await req.server.prisma.routeStop.findFirst({
                        where: {
                            stopName: stopName,
                            routeId: routeId,
                        },
                    });
                    if (!stop) {
                        errors.push(`Skipping row with ADM: ${admissionNumber} - Stop "${stopName}" not found in route "${routeName}"`);
                        continue;
                    }
                    stopId = stop.id;
                }
                const existingStudent = await req.server.prisma.student.findUnique({
                    where: { admissionNumber },
                });
                if (existingStudent) {
                    const updateData = {};
                    if (name && !existingStudent.name)
                        updateData.name = name;
                    if (phone && !existingStudent.phone)
                        updateData.phone = phone;
                    if (classId && !existingStudent.classId)
                        updateData.classId = classId;
                    if (routeId && !existingStudent.routeId)
                        updateData.routeId = routeId;
                    if (stopId && !existingStudent.stopId)
                        updateData.stopId = stopId;
                    if (addressLine && !existingStudent.addressLine)
                        updateData.addressLine = addressLine;
                    if (cityOrVillage && !existingStudent.cityOrVillage)
                        updateData.cityOrVillage = cityOrVillage;
                    if (gender && !existingStudent.gender)
                        updateData.gender = gender;
                    if (!existingStudent.password)
                        updateData.password = await bcrypt_1.default.hash('123456', 10);
                    if (Object.keys(updateData).length > 0) {
                        await req.server.prisma.student.update({
                            where: { admissionNumber },
                            data: updateData,
                        });
                        updatedCount++;
                    }
                }
                else {
                    const defaultPassword = await bcrypt_1.default.hash('123456', 10);
                    await req.server.prisma.student.create({
                        data: {
                            name,
                            phone,
                            admissionNumber,
                            password: defaultPassword,
                            classId,
                            routeId,
                            stopId,
                            addressLine,
                            cityOrVillage,
                            gender: gender || undefined,
                            feeSlab: 'custom',
                        },
                    });
                    createdCount++;
                }
            }
            catch (err) {
                console.error('❌ Error importing row:', row, err);
                errors.push(`Error importing row with ADM: ${row['ADM'] || 'unknown'} - ${err.message}`);
            }
        }
        return reply.send({
            message: `${createdCount} students created, ${updatedCount} students updated successfully.`,
            errors: errors.length > 0 ? errors : undefined,
        });
    }
    catch (err) {
        console.error('❌ Failed to parse Excel:', err);
        return reply.code(500).send({ message: 'Failed to process Excel file.', error: err.message });
    }
};
exports.importStudentsFromExcel = importStudentsFromExcel;
// 📤 Download Sample Excel Template (With Class Name, Route & Stop)
const downloadSampleExcel = async (req, reply) => {
    try {
        const headers = ['ADM', 'Name', 'Class', 'Route', 'Stop', 'Address', 'Location', 'Phone', 'Gender'];
        const rows = [
            ['STU001', 'Sample Student', 'Class 1', 'City Route 1', 'Main Gate', 'H.No 123 Street', 'Patiala', '9876543210', 'Male'],
        ];
        const sheet = xlsx.utils.aoa_to_sheet([headers, ...rows]);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, sheet, 'Students');
        const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        return reply
            .header('Content-Disposition', 'attachment; filename="student_sample.xlsx"')
            .header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            .send(buffer);
    }
    catch (err) {
        console.error('❌ Failed to generate sample Excel:', err);
        return reply.code(500).send({ message: 'Failed to generate sample template.', error: err.message });
    }
};
exports.downloadSampleExcel = downloadSampleExcel;
