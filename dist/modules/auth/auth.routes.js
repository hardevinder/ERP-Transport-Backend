"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = authRoutes;
const auth_controller_1 = require("./auth.controller");
async function authRoutes(server) {
    server.post('/register', auth_controller_1.register); // <--- new
    server.post('/login', auth_controller_1.login);
    server.get('/me', { preHandler: [server.authenticate] }, auth_controller_1.getMe);
}
