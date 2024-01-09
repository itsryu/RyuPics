import { HttpStatus } from '../types/HTTPInterfaces';

class HttpError extends Error {
    code: HttpStatus;

    constructor(code: HttpStatus, message: string) {
        super(message);
        this.code = code;
    }
}

export { HttpError };