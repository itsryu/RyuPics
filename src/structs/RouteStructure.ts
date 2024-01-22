import { RyuPics } from '../server';
import { HttpStatus } from '../types/HTTPInterfaces';
import { NextFunction, Request, Response } from 'express';

class HttpError extends Error {
    readonly code: HttpStatus;

    constructor(code: HttpStatus, message: string) {
        super(message);
        this.code = code;
    }
}

abstract class RouteStructure<T = Request, K = Response, N = NextFunction, V = void | any> {
    readonly client: RyuPics;

    constructor(client: RyuPics) {
        this.client = client;
    }

    abstract run(req: T, res: K, next: N): V;
}

export { HttpError, RouteStructure };