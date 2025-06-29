import { FastifyRequest, FastifyReply } from 'fastify';
import * as xlsx from 'xlsx';
import bcrypt from 'bcrypt';

// 📥 Upload & Import Students from Excel (Class Name Optional, Gender, Route, Stop Name Included)
export const importStudentsFromExcel = async (req: FastifyRequest, reply: FastifyReply) => {
  const data = await req.file();

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
    const errors: string[] = [];

    const validGenders = ['male', 'female', 'other'];

    for (const rowRaw of json) {
      const row = rowRaw as Record<string, any>; // ✅ TS18046 FIX

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

        let classId: string | undefined = undefined;
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

        let routeId: string | undefined = undefined;
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

        let stopId: string | undefined = undefined;
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
          const updateData: any = {};
          if (name && !existingStudent.name) updateData.name = name;
          if (phone && !existingStudent.phone) updateData.phone = phone;
          if (classId && !existingStudent.classId) updateData.classId = classId;
          if (routeId && !existingStudent.routeId) updateData.routeId = routeId;
          if (stopId && !existingStudent.stopId) updateData.stopId = stopId;
          if (addressLine && !existingStudent.addressLine) updateData.addressLine = addressLine;
          if (cityOrVillage && !existingStudent.cityOrVillage) updateData.cityOrVillage = cityOrVillage;
          if (gender && !existingStudent.gender) updateData.gender = gender;
          if (!existingStudent.password) updateData.password = await bcrypt.hash('123456', 10);

          if (Object.keys(updateData).length > 0) {
            await req.server.prisma.student.update({
              where: { admissionNumber },
              data: updateData,
            });
            updatedCount++;
          }
        } else {
          const defaultPassword = await bcrypt.hash('123456', 10);
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
      } catch (err: any) {
        console.error('❌ Error importing row:', row, err);
        errors.push(`Error importing row with ADM: ${row['ADM'] || 'unknown'} - ${err.message}`);
      }
    }

    return reply.send({
      message: `${createdCount} students created, ${updatedCount} students updated successfully.`,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err: any) {
    console.error('❌ Failed to parse Excel:', err);
    return reply.code(500).send({ message: 'Failed to process Excel file.', error: err.message });
  }
};

// 📤 Download Sample Excel Template (With Class Name, Route & Stop)
export const downloadSampleExcel = async (req: FastifyRequest, reply: FastifyReply) => {
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
  } catch (err: any) {
    console.error('❌ Failed to generate sample Excel:', err);
    return reply.code(500).send({ message: 'Failed to generate sample template.', error: err.message });
  }
};
