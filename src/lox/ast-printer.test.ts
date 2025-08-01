import { describe, expect, it } from 'vitest';
import { Binary, type Expr, Grouping, Literal, Unary } from './expr.ts';
import { Token } from './token.ts';
import { TokenType } from './token-type.ts';
import { AstPrinter } from './ast-printer.ts';

describe('AstPrinter', () => {
  it('(적당히) 예쁜 출력기', () => {
    const expression: Expr = new Binary(
      new Unary(new Token(TokenType.MINUS, '-', undefined, 1), new Literal(123)),
      new Token(TokenType.STAR, '*', undefined, 1),
      new Grouping(new Literal(45.67)),
    );

    const result = new AstPrinter().print(expression);

    expect(result).toBe('(* (- 123) (group 45.67))');
  });
});
