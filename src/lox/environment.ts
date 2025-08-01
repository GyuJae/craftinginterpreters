import type {Token} from "./token.ts";
import {RuntimeException} from "./runtime-exception.ts";

export class Environment {
    private readonly values = new Map<string, unknown>();
    private readonly enclosing: Environment | null = null;

    constructor(enclosing?: Environment) {
        this.enclosing = enclosing ?? null;
    }

    get(name: Token): unknown {
        if(this.values.has(name.lexeme)) {
            return this.values.get(name.lexeme)!;
        }

        if(this.enclosing) return this.enclosing.get(name);

        throw new RuntimeException(name, `Undefined variable ${name.lexeme}.`);
    }

    define(name: string, value: unknown): void {
        this.values.set(name, value);
    }

    assign(name: Token, value: unknown): void {
        if(this.values.has(name.lexeme)) {
            this.values.set(name.lexeme, value);
            return;
        }

        if(this.enclosing) {
            this.enclosing.assign(name, value);
            return;
        }

        throw new RuntimeException(name, `Undefined variable ${name.lexeme}.`);
    }
}