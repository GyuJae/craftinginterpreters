import type {Token} from "./token.ts";

export class RuntimeException extends Error {
    constructor(public readonly token: Token, message: string) {
        super(message);
    }
}