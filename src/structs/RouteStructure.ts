import { RyuPics } from '../server';
import { HTTPStatus } from '../types/HTTPInterfaces';
import { NextFunction, Request, Response } from 'express';

interface JSONObjectResponse {
    code: number,
    message: string,
    data?: any
}

class JSONResponse {
    constructor(
        private readonly code: HTTPStatus,
        private readonly message: string,
        private readonly data?: any
    ) { }

    toJSON(): JSONObjectResponse {
        const object = { code: this.code, message: this.message };

        this.data && this.data.length > 0 ? Object.defineProperty(object, 'data', {
            value: this.data,
            writable: true,
            configurable: true,
            enumerable: true
        }) : null;

        return object;
    }

    fromObject(obj: { code: HTTPStatus; message: string; data?: any }): JSONResponse {
        return new JSONResponse(obj.code, obj.message, obj.data);
    }

    getStatusCode(): HTTPStatus {
        return this.code;
    }

    getMessage(): string {
        return this.message;
    }

    getData(): any[] | undefined {
        return this.data;
    }
}

abstract class RouteStructure<T = Request, K = Response, N = NextFunction, V = void | any> {
    public readonly client: RyuPics;

    public constructor(client: RyuPics) {
        this.client = client;
    }

    public abstract run(req: T, res: K, next: N): V;
}

export { JSONResponse, RouteStructure };