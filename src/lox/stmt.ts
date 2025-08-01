import type { Expr } from './expr.ts';
import type { Token } from './token.ts';

export interface IStmtVisitor<R> {
  visitBlockStmt(stmt: Block): R;
  visitExpressionStmt(stmt: Expression): R;
  visitPrintStmt(stmt: Print): R;
  visitVarStmt(stmt: Var): R;
  visitIfStmt(stmt: If): R;
  visitWhileStmt(stmt: While): R;
}

export abstract class Stmt {
  abstract accept<R>(visitor: IStmtVisitor<R>): R;
}

export class Block extends Stmt {
  constructor(public readonly statements: Array<Stmt>) {
    super();
  }

  accept<R>(visitor: IStmtVisitor<R>): R {
    return visitor.visitBlockStmt(this);
  }
}

export class Expression extends Stmt {
  constructor(public readonly expression: Expr) {
    super();
  }

  accept<R>(visitor: IStmtVisitor<R>): R {
    return visitor.visitExpressionStmt(this);
  }
}

export class If extends Stmt {
  constructor(
    public readonly condition: Expr,
    public readonly thenBranch: Stmt,
    public readonly elseBranch: Stmt,
  ) {
    super();
  }

  accept<R>(visitor: IStmtVisitor<R>): R {
    return visitor.visitIfStmt(this);
  }
}

export class Print extends Stmt {
  constructor(public readonly expression: Expr) {
    super();
  }

  accept<R>(visitor: IStmtVisitor<R>): R {
    return visitor.visitPrintStmt(this);
  }
}

export class Var extends Stmt {
  constructor(
    public readonly name: Token,
    public readonly initializer: Expr,
  ) {
    super();
  }

  accept<R>(visitor: IStmtVisitor<R>): R {
    return visitor.visitVarStmt(this);
  }
}

export class While extends Stmt {
  constructor(
    public readonly condition: Expr,
    public readonly body: Stmt,
  ) {
    super();
  }

  accept<R>(visitor: IStmtVisitor<R>): R {
    return visitor.visitWhileStmt(this);
  }
}
