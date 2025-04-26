const { LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');
const path = require('path');

class CustomAuth extends LocalAuth {
    constructor() {
        super();
        this.sessionFile = path.join(__dirname, 'session.json');
    }

    async getSession() {
        if (fs.existsSync(this.sessionFile)) {
            const sessionData = fs.readFileSync(this.sessionFile);
            return JSON.parse(sessionData);
        }
        return null;
    }

    async saveSession(session) {
        fs.writeFileSync(this.sessionFile, JSON.stringify(session));
    }

    async deleteSession() {
        if (fs.existsSync(this.sessionFile)) {
            fs.unlinkSync(this.sessionFile);
        }
    }
}

module.exports = CustomAuth;
