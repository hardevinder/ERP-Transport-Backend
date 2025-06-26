// src/modules/class/import.controller.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import * as xlsx from 'xlsx';

// 📥 Import Classes from Excel
export const importClassesFromExcel = async (req: FastifyRequest, reply: FastifyReply) => {
  const data = await req.file();
  if (!data) return reply.code(400).send({ message: 'No file uploaded' });

  if (data.mimetype !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
    return reply.code(400).send({ message: 'Invalid file format. Please upload an .xlsx file.' });
  }

  try {
    const buffer = await data.toBuffer();
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    let count = 0;
    const errors: string[] = [];

    for (const row of rows) {
      const name = String(row['Class'] || '').trim();
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
  } catch (err: any) {
    console.error('❌ Error importing classes:', err);
    reply.code(500).send({ message: 'Failed to import classes.', error: err.message });
  }
};

// 📤 Download Class Sample Template
export const downloadSampleClassExcel = async (req: FastifyRequest, reply: FastifyReply) => {
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
  } catch (err: any) {
    console.error('❌ Failed to generate sample Excel:', err);
    return reply.code(500).send({ message: 'Failed to generate sample template.', error: err.message });
  }
};
