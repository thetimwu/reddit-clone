"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = void 0;
exports.sleep = (ms) => new Promise((resolve) => {
    setTimeout(resolve, ms);
});
//# sourceMappingURL=sleep.js.map