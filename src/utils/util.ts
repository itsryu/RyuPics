class Util {
    public formatFileSize(bytes: number): number {
        if (bytes < 1024) {
            return bytes;
        } else if (bytes < 1024 * 1024) {
            return (bytes / 1024);
        } else {
            return (bytes / (1024 * 1024));
        }
    }

    public generateShortId(): string {
        const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        
        let shortId = '';
        for (let i = 0; i < 6; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            shortId += characters[randomIndex];
        }
        return shortId;
    };
    
}

class Logger {
    static Colors = {
        RESET: '\x1b[0m',
        RED: '\x1b[31m',
        GREEN: '\x1b[32m',
        YELLOW: '\x1b[33m',
        BLUE: '\u001b[34m'
    };

    static get currentTime() {
        return `${Logger.Colors.BLUE}[${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}]${Logger.Colors.RESET}`;
    }

    error(content: string, path: string) {
        return console.error(`${Logger.currentTime} - ${Logger.Colors.RED}[${path ?? 'ERROR'}]${Logger.Colors.RESET} ${content}`);
    }

    info(content: string, path: string) {
        return console.log(`${Logger.currentTime} - ${Logger.Colors.BLUE}[${path ?? 'INFO'}]${Logger.Colors.RESET} ${content}`);
    }

    success(content: string, path: string) {
        return console.log(`${Logger.currentTime} - ${Logger.Colors.GREEN}[${path ?? 'SUCCESS'}]${Logger.Colors.RESET} ${content}`);
    }

    warn(content: string, path: string) {
        return console.warn(`${Logger.currentTime} - ${Logger.Colors.YELLOW}[${path ?? 'WARN'}]${Logger.Colors.RESET} ${content}`);
    }
}

export { Logger, Util };