import { Binary, Expr, Grouping, type IExprVisitor, Literal, Unary } from './expr.ts';

export class AstPrinter implements IExprVisitor<string> {
  print(expr: Expr): string {
    return expr.accept(this);
  }

  visitBinaryExpr(expr: Binary): string {
    return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
  }

  visitGroupingExpr(expr: Grouping): string {
    return this.parenthesize('group', expr.expression);
  }

  visitLiteralExpr(expr: Literal): string {
    if (expr.value === undefined || expr.value === null) return 'nil';
    return expr.value.toString();
  }

  visitUnaryExpr(expr: Unary): string {
    return this.parenthesize(expr.operator.lexeme, expr.right);
  }

  private parenthesize(name: string, ...expressions: Expr[]): string {
    const result: string[] = [];

    result.push('(');
    result.push(name);
    for (const expr of expressions) {
      result.push(' ');
      result.push(expr.accept(this));
    }
    result.push(')');
    return result.join('');
  }
}
