import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const rootDir = path.resolve(import.meta.dirname, '..');
const vaultPath = path.join(rootDir, 'layla_exclusive', 'vault.js');
const command = process.argv[2];
const args = Object.fromEntries(process.argv.slice(3).map((value, index, all) => {
    if (!value.startsWith('--')) return null;
    return [value.slice(2), all[index + 1]];
}).filter(Boolean));
const kdf = { name: 'PBKDF2', hash: 'SHA-256', iterations: 600000 };
const prompt = readline.createInterface({ input, output });

function encode(value) { return Buffer.from(value).toString('base64'); }
function decode(value) { return Buffer.from(value, 'base64'); }
function normalizeUsername(value) { return String(value || '').trim().toLowerCase(); }
function deriveKey(password, salt) { return crypto.pbkdf2Sync(password, salt, kdf.iterations, 32, 'sha256'); }

function encrypt(data, key) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const ciphertext = Buffer.concat([cipher.update(data), cipher.final(), cipher.getAuthTag()]);
    return { iv: encode(iv), ciphertext: encode(ciphertext) };
}

function decrypt(ciphertext, key, iv) {
    const bytes = decode(ciphertext);
    const tag = bytes.subarray(bytes.length - 16);
    const encrypted = bytes.subarray(0, bytes.length - 16);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, decode(iv));
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

function wrapContentKey(contentKey, password) {
    const salt = crypto.randomBytes(16);
    const wrapped = encrypt(contentKey, deriveKey(password, salt));
    return { salt: encode(salt), wrapIv: wrapped.iv, wrappedKey: wrapped.ciphertext };
}

function loadVault() {
    const source = fs.readFileSync(vaultPath, 'utf8');
    const match = source.match(/window\.__LAYLA_VAULT__\s*=\s*Object\.freeze\((\{[\s\S]*\})\);/);
    if (!match) throw new Error('Cannot read vault.js');
    return JSON.parse(match[1]);
}

function saveVault(vault) {
    fs.writeFileSync(vaultPath, `window.__LAYLA_VAULT__ = Object.freeze(${JSON.stringify(vault)});\n`, 'utf8');
}

async function askSecret(label) {
    const value = await prompt.question(label);
    if (!value) throw new Error('Password cannot be empty.');
    return value;
}

async function unlock(vault) {
    const username = normalizeUsername(await prompt.question('Existing username: '));
    const password = await askSecret('Existing password: ');
    const user = vault.users.find((item) => item.username === username);
    if (!user) throw new Error('Account not found.');
    return decrypt(user.wrappedKey, deriveKey(password, decode(user.salt)), user.wrapIv);
}

async function askNewPassword() {
    const password = await askSecret('New password: ');
    const confirmation = await askSecret('Confirm password: ');
    if (password !== confirmation) throw new Error('Passwords do not match.');
    return password;
}

async function init() {
    if (fs.existsSync(vaultPath)) throw new Error('Vault already exists.');
    const username = normalizeUsername(args.username);
    const imagePath = path.resolve(args.image || '');
    if (!username || !fs.existsSync(imagePath)) throw new Error('Use init --username NAME --image FILE.');
    const password = await askNewPassword();
    const image = fs.readFileSync(imagePath);
    const extension = path.extname(imagePath).toLowerCase();
    const mimeType = extension === '.jpg' || extension === '.jpeg' ? 'image/jpeg' : 'image/png';
    const content = {
        pageTitle: 'Mike & Layla',
        title: 'Mike & Layla',
        subtitle: 'A little place that belongs only to us.',
        imageDataUrl: `data:${mimeType};base64,${encode(image)}`
    };
    const contentKey = crypto.randomBytes(32);
    const encrypted = encrypt(Buffer.from(JSON.stringify(content)), contentKey);
    const user = { username, ...wrapContentKey(contentKey, password) };
    saveVault({ version: 1, kdf, users: [user], content: { iv: encrypted.iv, ciphertext: encrypted.ciphertext } });
    console.log(`Initialized ${vaultPath} with account: ${username}`);
}

async function add() {
    const vault = loadVault();
    const username = normalizeUsername(args.username);
    if (!username || vault.users.some((item) => item.username === username)) throw new Error('Choose a new username.');
    const contentKey = await unlock(vault);
    const password = await askNewPassword();
    vault.users.push({ username, ...wrapContentKey(contentKey, password) });
    saveVault(vault);
    console.log(`Added account: ${username}`);
}

async function change() {
    const vault = loadVault();
    const username = normalizeUsername(args.username);
    const userIndex = vault.users.findIndex((item) => item.username === username);
    if (userIndex < 0) throw new Error('Account not found.');
    const currentPassword = await askSecret('Current password: ');
    const user = vault.users[userIndex];
    const contentKey = decrypt(user.wrappedKey, deriveKey(currentPassword, decode(user.salt)), user.wrapIv);
    const newPassword = await askNewPassword();
    vault.users[userIndex] = { username, ...wrapContentKey(contentKey, newPassword) };
    saveVault(vault);
    console.log(`Changed password for: ${username}`);
}

async function remove() {
    const vault = loadVault();
    const username = normalizeUsername(args.username);
    if (vault.users.length <= 1) throw new Error('The last account cannot be removed.');
    await unlock(vault);
    const nextUsers = vault.users.filter((item) => item.username !== username);
    if (nextUsers.length === vault.users.length) throw new Error('Account not found.');
    vault.users = nextUsers;
    saveVault(vault);
    console.log(`Removed account: ${username}`);
}

async function list() {
    const vault = loadVault();
    console.log(vault.users.map((user) => user.username).join('\n'));
}

async function verify() {
    const vault = loadVault();
    const contentKey = await unlock(vault);
    const clearContent = decrypt(vault.content.ciphertext, contentKey, vault.content.iv);
    const content = JSON.parse(clearContent.toString('utf8'));
    if (!content.title || !content.imageDataUrl?.startsWith('data:image/')) {
        throw new Error('Private content is incomplete.');
    }
    console.log('Login and encrypted content verified.');
}

try {
    if (command === 'init') await init();
    else if (command === 'add') await add();
    else if (command === 'change') await change();
    else if (command === 'remove') await remove();
    else if (command === 'list') await list();
    else if (command === 'verify') await verify();
    else throw new Error('Commands: init, add, change, remove, list, verify');
} catch (error) {
    console.error(error.message);
    process.exitCode = 1;
} finally {
    prompt.close();
}
