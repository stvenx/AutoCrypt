import * as vscode from 'vscode';
import * as fs from 'fs';
import * as crypto from 'crypto';
let planText = "";
export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.workspace.onWillSaveTextDocument(async event => {
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

    let disposable2 = vscode.workspace.onDidSaveTextDocument(async event => {
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

export function deactivate() {}

interface KeyIvPair {
  iv: Buffer,
  key: Buffer,
}

function makeKeyIv(password: string): KeyIvPair {
	const hash = crypto.createHash('sha512');
	hash.update(password);
	const passphraseKey = hash.digest();
	let iv = passphraseKey.subarray(0, 16);
	let key = passphraseKey.subarray(16, 48);
	return { iv, key };
}

function encrypt(str: string, password: string): string {
	const { iv, key } = makeKeyIv(password);
	const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
	cipher.setAutoPadding(true);
	let crypt = cipher.update(str, 'utf8', 'base64');
	crypt += cipher.final("base64");
	return crypt;
}

function decrypt(str: string, password: string): string {
	const { iv, key } = makeKeyIv(password);
	const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
	decipher.setAutoPadding(true);
	let decrypt = decipher.update(str, 'base64', 'utf8');
	decrypt += decipher.final();
	return decrypt;
}
