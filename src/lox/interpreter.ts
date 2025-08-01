import {
  Assign,
  Binary,
  Expr,
  Grouping,
  type IExprVisitor,
  Literal,
  Unary,
  Variable,
} from './expr.ts';
import { TokenType } from './token-type.ts';
import type { Token } from './token.ts';
import { RuntimeException } from './runtime-exception.ts';
import { Block, Expression, type IStmtVisitor, Stmt, Var } from './stmt.ts';
import { Environment } from './environment.ts';

export class Interpreter implements IExprVisitor<unknown>, IStmtVisitor<void> {
  private environment = new Environment();

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
}
