import type { Interpreter } from './interpreter.ts';

export abstract class LoxCallable {
  abstract arity(): number;
  abstract call(interpreter: Interpreter, args: Array<unknown>): unknown;
}
