const crypto = require('crypto');
// openssl aes-256-cbc -a -d -nosalt -K 9008dd09b3befd1b5e07394c706a8bb980b1d7785e5976ec049b46df5f1326af  -iv b109f3bbbc244eb82441917ed06d618b
function makeKeyIv(password) {
	const hash = crypto.createHash('sha512');
	hash.update(password);
	const passphraseKey = hash.digest();
	let iv = passphraseKey.subarray(0, 16);
	let key = passphraseKey.subarray(16, 48);
	return { iv, key };
}

const password = 'password';

const { iv, key } = makeKeyIv(password);
console.log(iv.toString('hex'), key.toString('hex'));

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
const enc = encrypt("ball", password);
const dec = decrypt(enc, password);
console.log(enc, dec);
