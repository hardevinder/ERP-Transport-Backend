"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const register = async (req, reply) => {
    try {
        const { email, password } = req.body;
        const existing = await req.server.prisma.admin.findUnique({ where: { email } });
        if (existing)
            return reply.code(400).send({ message: 'Email already exists' });
        const hashed = await bcrypt_1.default.hash(password, 10);
        const user = await req.server.prisma.admin.create({
            data: { email, password: hashed }
        });
        const token = req.server.jwt.sign({ id: user.id, email: user.email, role: user.role });
        reply.code(201).send({ token });
    }
    catch (err) {
        reply.code(500).send({ message: 'Internal server error' });
    }
};
exports.register = register;
const login = async (req, reply) => {
    try {
        const { email, password } = req.body;
        const user = await req.server.prisma.admin.findUnique({ where: { email } });
        if (!user)
            return reply.code(401).send({ message: 'Invalid email or password' });
        const valid = await bcrypt_1.default.compare(password, user.password);
        if (!valid)
            return reply.code(401).send({ message: 'Invalid email or password' });
        const token = await req.jwtSign({ id: user.id, email: user.email, role: user.role });
        reply.send({ token });
    }
    catch (err) {
        console.error('🔥 Login Error:', err); // <== Add this
        reply.code(500).send({ message: 'Internal server error' });
    }
};
exports.login = login;
const getMe = async (req, reply) => {
    // This assumes JWT has been verified and payload is attached
    const user = req.user;
    reply.send({ user });
};
exports.getMe = getMe;
