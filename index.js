const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const fs = require('fs');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const sock = makeWASocket({ auth: state, printQRInTerminal: true });

    sock.ev.on('creds.update', saveCreds);

    let gameData = { jawaban: null };

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message || m.key.fromMe) return;

        const chatId = m.key.remoteJid;
        const text = m.message.conversation || m.message.extendedTextMessage?.text || "";

        // 1. GAME TEBAK KATA
        if (text === '.tebak') {
            gameData.jawaban = "kucing";
            await sock.sendMessage(chatId, { text: "Game dimulai! Apa hewan yang mengeong?" });
        }

        if (text.toLowerCase() === gameData.jawaban && gameData.jawaban !== null) {
            await sock.sendMessage(chatId, { text: "Selamat! Jawaban Anda benar!" });
            gameData.jawaban = null;
        }

        // 2. FITUR LAINNYA
        if (text === '.me') {
            await sock.sendMessage(chatId, { text: "Bot aktif! Gunakan .tebak untuk bermain." });
        }

        // 3. KEAMANAN: Hapus Link
        if (text.includes('http') || text.includes('https')) {
            await sock.sendMessage(chatId, { delete: m.key });
            await sock.sendMessage(chatId, { text: "Link tidak diperbolehkan." });
        }
    });
}

startBot();
