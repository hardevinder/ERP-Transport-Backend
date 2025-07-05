import { FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcrypt';
import path from 'path';
import fs from 'fs/promises';

// Utility to get current month if needed
function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// 🚀 Create a new student
export const createStudent = async (req: FastifyRequest, reply: FastifyReply) => {
  const {
    name,
    phone,
    admissionNumber,
    password,
    classId,
    routeId,
    stopId,
    concessionId,
    addressLine,
    cityOrVillage,
    gender, // ✅ added
  } = req.body as {
    name: string;
    phone: string;
    admissionNumber?: string;
    password?: string;
    classId?: string;
    routeId?: string;
    stopId?: string;
    concessionId?: string;
    addressLine?: string;
    cityOrVillage?: string;
    gender?: string;
  };

  let feeAmount = 0;
  let feeSlab = 'custom';

  if (stopId) {
    const stop = await req.server.prisma.routeStop.findUnique({ where: { id: stopId } });
    if (stop?.feeAmount) feeAmount = stop.feeAmount;
  }

  const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

  const student = await req.server.prisma.student.create({
    data: {
      name,
      phone,
      admissionNumber,
      password: hashedPassword,
      classId,
      routeId,
      stopId,
      feeSlab,
      concessionId,
      addressLine,
      cityOrVillage,
      gender, // ✅ saved
    },
    include: {
      route: true,
      stop: true,
      class: true,
      transactions: true,
    },
  });

  reply.code(201).send({ ...student, expectedFee: feeAmount });
};

// 🛠️ Update existing student
export const updateStudent = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as { id: string };
  const {
    name,
    phone,
    admissionNumber,
    password,
    classId,
    routeId,
    stopId,
    concessionId,
    addressLine,
    cityOrVillage,
    gender, // ✅ added
  } = req.body as {
    name?: string;
    phone?: string;
    admissionNumber?: string;
    password?: string;
    classId?: string;
    routeId?: string;
    stopId?: string;
    concessionId?: string;
    addressLine?: string;
    cityOrVillage?: string;
    gender?: string;
  };

  const existing = await req.server.prisma.student.findUnique({ where: { id } });
  if (!existing) return reply.code(404).send({ message: 'Student not found' });

  const updatedData: any = {
    name,
    phone,
    admissionNumber,
    classId,
    routeId,
    stopId,
    concessionId,
    addressLine,
    cityOrVillage,
    gender, // ✅ updated
  };

  if (password) {
    updatedData.password = await bcrypt.hash(password, 10);
  }

  const updated = await req.server.prisma.student.update({
    where: { id },
    data: updatedData,
    include: { route: true, stop: true, class: true, transactions: true },
  });

  reply.send(updated);
};

// 🔍 Get one student
export const getStudentById = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as { id: string };

  const student = await req.server.prisma.student.findUnique({
    where: { id },
    include: {
      route: true,
      stop: true,
      class: true,
      transactions: {
        orderBy: { paymentDate: 'desc' },
      },
    },
  });

  if (!student) {
    return reply.code(404).send({ message: 'Student not found' });
  }

  reply.send(student);
};

// ❌ Delete student
export const deleteStudent = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as { id: string };

  try {
    await req.server.prisma.student.delete({ where: { id } });
    reply.send({ message: 'Student deleted' });
  } catch {
    reply.code(404).send({ message: 'Student not found' });
  }
};

// 🔁 Toggle student status
export const toggleStudentStatus = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as { id: string };

  const student = await req.server.prisma.student.findUnique({ where: { id } });
  if (!student) return reply.code(404).send({ message: 'Student not found' });

  const updated = await req.server.prisma.student.update({
    where: { id },
    data: {
      status: student.status === 'active' ? 'inactive' : 'active',
    },
  });

  reply.send(updated);
};

// 📋 Get all students
export const getAllStudents = async (req: FastifyRequest, reply: FastifyReply) => {
  const students = await req.server.prisma.student.findMany({
    include: {
      route: true,
      stop: true,
      class: true,
      transactions: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  reply.send(students);
};

// 🔐 Student Login
export const studentLogin = async (req: FastifyRequest, reply: FastifyReply) => {
  const { admissionNumber, password } = req.body as {
    admissionNumber: string;
    password: string;
  };

  if (!admissionNumber || !password) {
    return reply.code(400).send({ message: 'Admission number and password are required' });
  }

  const student = await req.server.prisma.student.findUnique({
    where: { admissionNumber },
    include: {
      route: { include: { driver: true } },
      stop: true,
      class: true,
      transactions: {
        orderBy: { paymentDate: 'desc' },
      },
    },
  });

  if (!student || !student.password) {
    return reply.code(401).send({ message: 'Invalid admission number or password' });
  }

  const isValid = await bcrypt.compare(password, student.password);
  if (!isValid) {
    return reply.code(401).send({ message: 'Invalid admission number or password' });
  }

  const token = req.server.jwt.sign({ studentId: student.id, role: 'student' });

  return reply.send({
    token,
    student: {
      id: student.id,
      name: student.name,
      phone: student.phone,
      admissionNumber: student.admissionNumber,
      class: student.class,
      route: student.route,
      stop: student.stop,
      addressLine: student.addressLine,
      cityOrVillage: student.cityOrVillage,
      gender: student.gender,
      transactions: student.transactions,
    },
  });
};

export const uploadProfilePicture = async (req: FastifyRequest, reply: FastifyReply) => {
    // ✅ Fix TypeScript error using "as any"
    const file = await (req.file as any)('image');

    if (!file) {
      return reply.code(400).send({ message: 'No image file uploaded.' });
    }

    const ext = path.extname(file.filename);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const savePath = path.join(__dirname, '../../public/uploads/profile', uniqueName);

    const buffer = await file.toBuffer();
    await fs.mkdir(path.dirname(savePath), { recursive: true });
    await fs.writeFile(savePath, buffer);

    return reply.send({ message: 'Upload successful', filename: uniqueName });
  };

// 📊 Get student count per route and total
export const getStudentCountByRoute = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    // 1️⃣ Group students by routeId and count
    const routeWiseCounts = await req.server.prisma.student.groupBy({
      by: ['routeId'],
      where: {
        status: 'active',
        routeId: {
          not: null,
        },
      },
      _count: {
        id: true,
      },
    });

    // 2️⃣ Fetch route names
    const routeIds = routeWiseCounts.map((r) => r.routeId!);
    const routes = await req.server.prisma.route.findMany({
      where: {
        id: { in: routeIds },
      },
    });

    const routeMap = new Map(routes.map(r => [r.id, r.name]));

    // 3️⃣ Format data with route names
    const result = routeWiseCounts.map(r => ({
      routeId: r.routeId,
      routeName: routeMap.get(r.routeId!) || 'Unknown',
      studentCount: r._count.id,
    }));

    // 4️⃣ Total count
    const total = result.reduce((sum, r) => sum + r.studentCount, 0);

    return reply.send({
      status: 200,
      message: 'Student count by route',
      data: {
        routes: result,
        total,
      },
    });
  } catch (err: any) {
    console.error("STUDENT COUNT ROUTEWISE ERROR:", err);
    return reply.code(500).send({
      message: 'Failed to fetch student count by route',
      error: err.message,
    });
  }
};

