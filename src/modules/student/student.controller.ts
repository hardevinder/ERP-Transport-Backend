import { FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcrypt';

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

  reply.send({
    token,
    student: {
      id: student.id,
      name: student.name,
      phone: student.phone,
      class: student.class,
      route: student.route,
      stop: student.stop,
      addressLine: student.addressLine,
      cityOrVillage: student.cityOrVillage,
      gender: student.gender, // ✅ include in login response
      transactions: student.transactions,
    },
  });
};
