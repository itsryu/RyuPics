class Logger {
    private static Colors: { [key in 'RESET' | 'RED' | 'GREEN' | 'YELLOW' | 'BLUE']: string } = {
        RESET: '\x1b[0m',
        RED: '\x1b[31m',
        GREEN: '\x1b[32m',
        YELLOW: '\x1b[33m',
        BLUE: '\u001b[34m'
    };

    private static get currentTime() {
        return `${Logger.Colors.BLUE}[${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}]${Logger.Colors.RESET}`;
    }

    private static formatMessage(level: string, content: string, path?: string) {
        const color = Logger.Colors[level.toUpperCase() as 'RESET' | 'RED' | 'GREEN' | 'YELLOW' | 'BLUE'] || Logger.Colors.RESET;
        const label = path ? `[${path}]` : `[${level.toUpperCase()}]`;
        return `${Logger.currentTime} - ${color}${label}${Logger.Colors.RESET} ${content}`;
    }

    static error(content: string, path?: string) {
        console.error(Logger.formatMessage('RED', content, path));
    }

    static info(content: string, path?: string) {
        console.log(Logger.formatMessage('BLUE', content, path));
    }

    static success(content: string, path?: string) {
        console.log(Logger.formatMessage('GREEN', content, path));
    }

    static warn(content: string, path?: string) {
        console.warn(Logger.formatMessage('YELLOW', content, path));
    }

    static debug(content: string, path?: string) {
        console.debug(Logger.formatMessage('RESET', content, path));
    }

    static log(level: 'error' | 'info' | 'success' | 'warn' | 'debug', content: string, path?: string) {
        switch (level) {
            case 'error':
                Logger.error(content, path);
                break;
            case 'info':
                Logger.info(content, path);
                break;
            case 'success':
                Logger.success(content, path);
                break;
            case 'warn':
                Logger.warn(content, path);
                break;
            case 'debug':
                Logger.debug(content, path);
                break;
        }
    }
}

export { Logger };