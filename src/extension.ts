import * as vscode from 'vscode';
import * as fs from 'fs';
import * as crypto from 'crypto-js';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.workspace.onWillSaveTextDocument(async event => {
        console.log('文件即将保存');
        // 获取文件路径和内容
        const filePath = event.document.uri.fsPath;
        const fileContent = event.document.getText();

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

        const hashedPassword = crypto.MD5(secretKey).toString();

        // 使用md5散列后的密码作为iv参数
        const iv = crypto.enc.Hex.parse(hashedPassword);
        console.log('iv: ', iv);
        console.log('hashedPassword: ', hashedPassword);
        // 使用AES加密内容
        const encryptedContent = encrypt(fileContent, hashedPassword, iv);

        // 使用同步方式将加密后的内容保存到文件
        fs.writeFileSync(filePath, encryptedContent);

        // 取消保存操作（避免原文件被保存）
        // event.waitUntil(Promise.reject());
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        const { selection } = editor;

        editor.edit(editBuilder => {
            editBuilder.replace(selection, fileContent);
        });
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

    context.subscriptions.push(disposable);
    context.subscriptions.push(disposable1);
}

export function deactivate() {}

function encrypt(text: string, secretKey: string, iv: crypto.lib.WordArray): string {
    // 使用AES加密文本
    const encryptedText = crypto.AES.encrypt(text, secretKey, { iv }).toString();

    return encryptedText;
}
