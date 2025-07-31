import {Binary, Expr, Grouping, type IExprVisitor, Literal, Unary} from "./expr.ts";
import {TokenType} from "./token-type.ts";
import type {Token} from "./token.ts";
import {RuntimeException} from "./runtime-exception.ts";

export class Interpreter implements IExprVisitor<unknown> {
    interpret(expression: Expr): void {
        try {
            const value = this.evaluate(expression);
            console.log(value);
        } catch(error) {
            if(error instanceof RuntimeException) {
                // TODO REPORT
            }

            throw error;
        }
    }

    visitBinaryExpr(expr: Binary): unknown {
        const left = this.evaluate(expr.left);
        const right = this.evaluate(expr.right);

        switch(expr.operator.type) {
            case TokenType.BANG_EQUAL: return !this.isEqual(left, right);
            case TokenType.EQUAL_EQUAL: return this.isEqual(left, right);
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
                if(typeof left === 'number' && typeof right === 'number') return left + right;
                if(typeof left === 'string' || typeof right === 'string') return String(left) + String(right);
                throw new RuntimeException(expr.operator, 'Operands must be two numbers or two strings.')
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
        if(obj === undefined || obj === null) return false;
        if (typeof obj === 'boolean') return obj;
        return true;
    }

    private isEqual(a: unknown, b: unknown): boolean {
        if(a === undefined && b === undefined) return true;
        if(a === null && b === null) return true;
        return a === b;
    }

    private checkNumberOperand(operator: Token, operand: unknown): void {
        if(typeof operand === 'number') return;
        throw new RuntimeException(operator, "Operand must be a number")
    }

    private checkNumberOperands(operator: Token, left:unknown, right: unknown): void {
        if(typeof left === 'number' && typeof right === 'number') return;
        throw new RuntimeException(operator, "Operands must be a numbers")
    }
}