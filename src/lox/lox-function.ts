import { LoxCallable } from './lox-callable.ts';
import type { Interpreter } from './interpreter.ts';
import { Environment } from './environment.ts';
import { FunctionStmt } from './stmt.ts';
import { ReturnException } from './return-exception.ts';

export class LoxFunction extends LoxCallable {
  constructor(
    public readonly declaration: FunctionStmt,
    public readonly closure: Environment,
  ) {
    super();
  }

  arity(): number {
    return this.declaration.params.length;
  }

  call(interpreter: Interpreter, args: Array<unknown>): unknown {
    const environment: Environment = new Environment(this.closure);
    for (let i = 0; i < this.declaration.params.length; i++) {
      environment.define(this.declaration.params[i].lexeme, args[i]);
    }

    try {
      interpreter.executeBlock(this.declaration.body, environment);
    } catch (error) {
      if (error instanceof ReturnException) {
        return error.value;
      }
    }
    return undefined;
  }

  toString(): string {
    return `<fn ${this.declaration.name.lexeme} >`;
  }
}
