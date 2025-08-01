/*
    expression -> literal | unary | binary | grouping ;

    literal     -> NUMBER | STRING | "true" | "false" | "nil" ;
    grouping    -> "(" expression ")" ;
    unary       -> ( "-" | "!" ) expression ;
    binary      -> expression operator expression ;
    operator    -> "==" | "!=" | "<" | "<=" | ">" | ">=" | "+" | "-" | "*" | "/" ;
 */

import type { Token } from './token.ts';

export interface IExprVisitor<R> {
  visitAssignExpr(expr: Assign): R;
  visitBinaryExpr(expr: Binary): R;
  visitGroupingExpr(expr: Grouping): R;
  visitLiteralExpr(expr: Literal): R;
  visitUnaryExpr(expr: Unary): R;
  visitVariableExpr(expr: Variable): R;
}

export abstract class Expr {
  abstract accept<R>(visitor: IExprVisitor<R>): R;
}

export class Assign extends Expr {
  constructor(
    public readonly name: Token,
    public readonly value: Expr,
  ) {
    super();
  }

  accept<R>(visitor: IExprVisitor<R>): R {
    return visitor.visitAssignExpr(this);
  }
}

export class Binary extends Expr {
  constructor(
    public readonly left: Expr,
    public readonly operator: Token,
    public readonly right: Expr,
  ) {
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
  constructor(
    public readonly operator: Token,
    public readonly right: Expr,
  ) {
    super();
  }

  accept<R>(visitor: IExprVisitor<R>): R {
    return visitor.visitUnaryExpr(this);
  }
}

export class Variable extends Expr {
  constructor(public readonly name: Token) {
    super();
  }

  accept<R>(visitor: IExprVisitor<R>): R {
    return visitor.visitVariableExpr(this);
  }
}
