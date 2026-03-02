"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCoordinator = exports.isAdmin = exports.requireRole = void 0;
const client_1 = require("@prisma/client");
const errors_1 = require("../errors");
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Authentication required',
                },
            });
        }
        if (!allowedRoles.includes(user.role)) {
            throw new errors_1.ForbiddenError('You do not have permission to access this resource');
        }
        next();
    };
};
exports.requireRole = requireRole;
exports.isAdmin = (0, exports.requireRole)(client_1.UserRole.ADMIN);
exports.isCoordinator = (0, exports.requireRole)(client_1.UserRole.COORDINATOR, client_1.UserRole.ADMIN);
