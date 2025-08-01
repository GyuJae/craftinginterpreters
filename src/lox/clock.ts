import { LoxCallable } from './lox-callable.ts';
import type { Interpreter } from './interpreter.ts';

export class Clock extends LoxCallable {
  arity(): number {
    return 0;
  }

  call(): unknown {
    return Date.now() / 1000;
  }

  toString(): string {
    return '<native fn>';
  }
}
