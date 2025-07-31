import type {TokenType} from "./token-type.ts";

export class Token {
    constructor(
        public readonly type: TokenType,
        public readonly lexeme: string,
        public readonly literal: any,
        public readonly line: number
    ) {}

    public toString(): string {
        return this.type + " " + this.lexeme + " " + this.literal;
    }
}