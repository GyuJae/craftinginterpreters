/*
    expression -> literal | unary | binary | grouping ;

    literal     -> NUMBER | STRING | "true" | "false" | "nil" ;
    grouping    -> "(" expression ")" ;
    unary       -> ( "-" | "!" ) expression ;
    binary      -> expression operator expression ;
    operator    -> "==" | "!=" | "<" | "<=" | ">" | ">=" | "+" | "-" | "*" | "/" ;
 */

import type {Token} from "./token.ts";

export interface IExprVisitor<R> {
    visitBinaryExpr(expr: Binary): R;
    visitGroupingExpr(expr: Grouping): R;
    visitLiteralExpr(expr: Literal): R;
    visitUnaryExpr(expr: Unary): R;
}

export abstract class Expr {
    abstract accept<R>(visitor: IExprVisitor<R>): R;
}

export class Binary extends Expr {
    constructor(public readonly left: Expr, public readonly operator: Token, public readonly right: Expr) {
        super();
    }

    accept<R>(visitor: IExprVisitor<R>): R {
        return visitor.visitBinaryExpr(this);
    }
}

export class Grouping extends Expr {
    constructor(public readonly expression: Expr) {
        super();
    }

    accept<R>(visitor: IExprVisitor<R>): R {
        return visitor.visitGroupingExpr(this);
    }
}

export class Literal extends Expr {
   constructor(public readonly value: unknown) {
       super();
   }
    accept<R>(visitor: IExprVisitor<R>): R {
       return visitor.visitLiteralExpr(this);
    }
}

export class Unary extends Expr {
    constructor(public readonly operator: Token, public readonly right: Expr) {
        super();
    }

    accept<R>(visitor: IExprVisitor<R>): R {
        return visitor.visitUnaryExpr(this);
    }
}