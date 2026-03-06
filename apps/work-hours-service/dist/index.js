"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_js_1 = __importDefault(require("./app.js"));
const port = process.env.PORT || 8081;
// サーバー起動
app_js_1.default.listen(port, () => {
    console.log(`Work Hours Service listening at http://localhost:${port}`);
});
