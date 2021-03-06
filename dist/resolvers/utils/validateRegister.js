"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRegister = void 0;
exports.validateRegister = (options) => {
    if (!options.email.includes("@")) {
        return [
            {
                field: "email",
                message: "Invalid email",
            },
        ];
    }
    if (options.password.length < 3) {
        return [
            {
                field: "password",
                message: "Password must be at greater than 2",
            },
        ];
    }
    if (options.username.length < 3) {
        return [
            {
                field: "username",
                message: "Username must be at greater than 2",
            },
        ];
    }
    if (options.username.includes("@")) {
        return [
            {
                field: "username",
                message: "Cannot include an @",
            },
        ];
    }
    return null;
};
//# sourceMappingURL=validateRegister.js.map