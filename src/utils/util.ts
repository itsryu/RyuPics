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

export { Util };