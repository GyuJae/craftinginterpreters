import {
  Assign,
  Binary,
  Call,
  Expr,
  Grouping,
  type IExprVisitor,
  Literal,
  Logical,
  Unary,
  Variable,
} from './expr.ts';
import { TokenType } from './token-type.ts';
import type { Token } from './token.ts';
import { RuntimeException } from './runtime-exception.ts';
import {
  Block,
  Expression,
  FunctionStmt,
  If,
  type IStmtVisitor,
  Return,
  Stmt,
  Var,
  While,
} from './stmt.ts';
import { Environment } from './environment.ts';
import { LoxCallable } from './lox-callable.ts';
import { Clock } from './clock.ts';
import { LoxFunction } from './lox-function.ts';
import { ReturnException } from './return-exception.ts';

export class Interpreter implements IExprVisitor<unknown>, IStmtVisitor<void> {
  private environment = new Environment();
  public readonly globals: Environment = this.environment;

  constructor() {
    this.environment.define('clock', new Clock());
  }

  interpret(statements: Array<Stmt>): void {
    try {
      for (const statement of statements) {
        this.execute(statement);
      }
    } catch (error) {
      if (error instanceof RuntimeException) {
        // TODO REPORT runtime error
      }
    }
  }

  visitBinaryExpr(expr: Binary): unknown {
    const left = this.evaluate(expr.left);
    const right = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenType.BANG_EQUAL:
        return !this.isEqual(left, right);
      case TokenType.EQUAL_EQUAL:
        return this.isEqual(left, right);
      case TokenType.GREATER:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) > Number(right);
      case TokenType.GREATER_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) >= Number(right);
      case TokenType.LESS:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) < Number(right);
      case TokenType.LESS_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) <= Number(right);
      case TokenType.MINUS:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) - Number(right);
      case TokenType.PLUS: {
        if (typeof left === 'number' && typeof right === 'number') return left + right;
        if (typeof left === 'string' || typeof right === 'string')
          return String(left) + String(right);
        throw new RuntimeException(expr.operator, 'Operands must be two numbers or two strings.');
      }
      case TokenType.SLASH:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) / Number(right);
      case TokenType.STAR:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) * Number(right);
    }

    return undefined;
  }

  visitGroupingExpr(expr: Grouping): unknown {
    return this.evaluate(expr.expression);
  }

  visitLiteralExpr(expr: Literal): unknown {
    return expr.value;
  }

  visitUnaryExpr(expr: Unary): unknown {
    const right: unknown = this.evaluate(expr.right);
    switch (expr.operator.type) {
      case TokenType.BANG:
        return !this.isTruthy(right);
      case TokenType.MINUS:
        this.checkNumberOperand(expr.operator, right);
        return -Number(right);
    }

    return undefined;
  }

  private evaluate(expr: Expr): unknown {
    return expr.accept(this);
  }

  private isTruthy(obj: unknown): boolean {
    if (obj === undefined || obj === null) return false;
    if (typeof obj === 'boolean') return obj;
    return true;
  }

  private isEqual(a: unknown, b: unknown): boolean {
    if (a === undefined && b === undefined) return true;
    if (a === null && b === null) return true;
    return a === b;
  }

  private checkNumberOperand(operator: Token, operand: unknown): void {
    if (typeof operand === 'number') return;
    throw new RuntimeException(operator, 'Operand must be a number');
  }

  private checkNumberOperands(operator: Token, left: unknown, right: unknown): void {
    if (typeof left === 'number' && typeof right === 'number') return;
    throw new RuntimeException(operator, 'Operands must be a numbers');
  }

  visitExpressionStmt(stmt: Expression): void {
    this.evaluate(stmt.expression);
  }

  visitPrintStmt(stmt: Expression): void {
    const value = this.evaluate(stmt.expression);
    console.log(value);
  }

  private execute(stmt: Stmt) {
    stmt.accept(this);
  }

  visitVarStmt(stmt: Var): void {
    let value: unknown;
    if (stmt.initializer) {
      value = this.evaluate(stmt.initializer);
    }
    this.environment.define(stmt.name.lexeme, value);
  }

  visitVariableExpr(expr: Variable): unknown {
    return this.environment.get(expr.name);
  }

  visitAssignExpr(expr: Assign): unknown {
    const value = this.evaluate(expr.value);
    this.environment.assign(expr.name, value);
    return value;
  }

  visitBlockStmt(stmt: Block): void {
    this.executeBlock(stmt.statements, new Environment(this.environment));
  }

  executeBlock(statements: Array<Stmt>, environment: Environment): void {
    const previous: Environment = this.environment;
    try {
      this.environment = environment;

      for (const statement of statements) {
        this.execute(statement);
      }
    } finally {
      this.environment = previous;
    }
  }

  visitIfStmt(stmt: If): void {
    if (this.isTruthy(this.evaluate(stmt.condition))) {
      this.execute(stmt.thenBranch);
    } else if (stmt.elseBranch) {
      this.execute(stmt.elseBranch);
    }
  }

  visitLogicalExpr(expr: Logical): unknown {
    const left: unknown = this.evaluate(expr.left);

    if (expr.operator.type === TokenType.OR) {
      if (this.isTruthy(left)) return left;
    } else {
      if (!this.isTruthy(left)) return left;
    }

    return this.evaluate(expr.right);
  }

  visitWhileStmt(stmt: While): void {
    while (this.isTruthy(this.evaluate(stmt.condition))) {
      this.execute(stmt.body);
    }
  }

  visitCallExpr(expr: Call): unknown {
    const callee = this.evaluate(expr.callee);

    const args: Array<unknown> = [];
    for (const arg of expr.args) {
      args.push(this.evaluate(arg));
    }

    if (!(callee instanceof LoxCallable)) {
      throw new RuntimeException(expr.paren, 'Can only call functions and classes.');
    }

    const fun: LoxCallable = callee as LoxCallable;
    if (args.length != fun.arity()) {
      throw new RuntimeException(
        expr.paren,
        `Expected ${fun.arity()} arguments but got ${args.length}.`,
      );
    }
    return fun.call(this, args);
  }

  visitFunctionStmt(stmt: FunctionStmt): void {
    const fun: LoxFunction = new LoxFunction(stmt, this.environment);
    this.environment.define(stmt.name.lexeme, fun);
  }

  visitReturnStmt(stmt: Return): void {
    let value: unknown;
    if (stmt.value) value = this.evaluate(stmt.value);

    throw new ReturnException(value);
  }
}
