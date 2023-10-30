/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("fs");

/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("crypto");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.deactivate = exports.activate = void 0;
const vscode = __webpack_require__(1);
const fs = __webpack_require__(2);
const crypto = __webpack_require__(3);
let planText = "";
function activate(context) {
    let disposable = vscode.workspace.onWillSaveTextDocument(async (event) => {
        console.log('文件即将保存');
        // 获取文件路径和内容
        const filePath = event.document.uri.fsPath;
        planText = event.document.getText();
        // 弹出输入框，让用户输入密钥
        const secretKey = await vscode.window.showInputBox({
            prompt: '请输入密钥',
            password: true
        });
        if (!secretKey) {
            vscode.window.showErrorMessage('未提供有效的密钥，文件未加密');
            return;
        }
        console.log('密钥', secretKey);
        // 使用AES加密内容
        const encryptedContent = encrypt(planText, secretKey);
        // 使用同步方式将加密后的内容保存到文件
        fs.writeFileSync(filePath, encryptedContent);
    });
    let disposable1 = vscode.commands.registerCommand('autocrypt.autoCrypt', () => {
        const editor = vscode.window.activeTextEditor;
        console.log("test autoEncrypt");
        if (!editor) {
            return;
        }
        const { document } = editor;
        const { selection } = editor;
        editor.edit(editBuilder => {
            editBuilder.replace(selection, "encryptedText");
        });
    });
    let disposable2 = vscode.workspace.onDidSaveTextDocument(async (event) => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        const { selection } = editor;
        editor.edit(editBuilder => {
            editBuilder.replace(selection, planText);
        });
    });
    context.subscriptions.push(disposable);
    context.subscriptions.push(disposable1);
    context.subscriptions.push(disposable2);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
function makeKeyIv(password) {
    const hash = crypto.createHash('sha512');
    hash.update(password);
    const passphraseKey = hash.digest();
    let iv = passphraseKey.subarray(0, 16);
    let key = passphraseKey.subarray(16, 48);
    return { iv, key };
}
function encrypt(str, password) {
    const { iv, key } = makeKeyIv(password);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    cipher.setAutoPadding(true);
    let crypt = cipher.update(str, 'utf8', 'base64');
    crypt += cipher.final("base64");
    return crypt;
}
function decrypt(str, password) {
    const { iv, key } = makeKeyIv(password);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    decipher.setAutoPadding(true);
    let decrypt = decipher.update(str, 'base64', 'utf8');
    decrypt += decipher.final();
    return decrypt;
}

})();

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=extension.js.map