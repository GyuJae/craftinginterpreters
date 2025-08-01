/*
    expression          -> assignment;
    assignment          -> IDENTIFIER "=" assignment | equality ;
    equality(동등)       -> comparison ( ( "!=" | "*" ) unary )* ;
    comparison(비교)     -> term ( ( ">" | ">=" | "<" | "<=" ) term )* ;
    term(항)             -> factor ( ("-" | "+") factor )* ;
    factor(인수)         -> unary ( ( "/" | "*" ) unary )* ;
    unary(단항)          -> ( "!" | "-" ) unary | primary;
    primary(기본식)       -> NUMBER | STRING | "true" | "false" | "nil" | "(" expression ")" ;
*/

/*
    문법 표기          |   코드 표현
    터미널            |   토큰을 매치하여 소비하는 코드
    넌터미널           |   해당 규칙의 함수를 호출
    |                |  if 또는 switch 문
    * 또는 +          |  while 또는 for 루프
    ?                |   if 문
 */

// TODO https://github.com/munificent/craftinginterpreters/blob/master/note/answers/chapter06_parsing.md

/*
program     -> declaration* EOF ;
declaration -> varDecl | statement ;
varDecl     -> "var" IDENTIFIER ( "=" expression )? ";" ;
statement   -> exprStmt | printStmt | block ;
exprStmt    -> expression ";" ;
printStmt   -> "print" expression ";" ;
block       -> "{" declaration* "}" ;
 */

import type { Token } from './token.ts';
import { Assign, Binary, type Expr, Grouping, Literal, Unary, Variable } from './expr.ts';
import { TokenType } from './token-type.ts';
import { Block, Expression, Print, type Stmt, Var } from './stmt.ts';

class ParserError extends Error {}

export class Parser {
  private current: number = 0;

  constructor(private readonly tokens: Token[]) {}

  parse(): Array<Stmt> {
    const statements: Array<Stmt> = [];
    while (!this.isAtEnd()) {
      statements.push(this.declaration());
    }
    return statements;
  }

  private declaration(): Stmt {
    try {
      if (this.match(TokenType.VAR)) return this.varDeclaration();
      return this.statement();
    } catch (error) {
      this.synchronize();
      throw error;
    }
  }

  private varDeclaration(): Stmt {
    const name: Token = this.consume(TokenType.IDENTIFIER, 'Expect variable name.');

    let initializer: Expr;
    if (this.match(TokenType.EQUAL)) {
      initializer = this.expression();
    }
    this.consume(TokenType.SEMICOLON, "Expect ';' after variable declaration.");
    return new Var(name, initializer!);
  }

  private expression(): Expr {
    return this.assignment();
  }

  private assignment(): Expr {
    const expr: Expr = this.equality();

    if (this.match(TokenType.EQUAL)) {
      const equals: Token = this.previous();
      const value: Expr = this.assignment();

      if (expr instanceof Variable) {
        return new Assign(expr.name, value);
      }

      this.error(equals, 'Invalid assignment target.');
    }

    return expr;
  }

  // comparison ( ( "!=" | "*" ) unary )* ;
  private equality(): Expr {
    let expr: Expr = this.comparison();
    while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
      const operator: Token = this.previous();
      const right: Expr = this.comparison();
      expr = new Binary(expr, operator, right);
    }
    return expr;
  }

  // term ( ( ">" | ">=" | "<" | "<=" ) term )* ;
  private comparison(): Expr {
    let expr: Expr = this.term();

    while (
      this.match(TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL)
    ) {
      const operator: Token = this.previous();
      const right: Expr = this.term();
      expr = new Binary(expr, operator, right);
    }
    return expr;
  }

  // factor ( ("-" | "+") factor )*
  private term(): Expr {
    let expr: Expr = this.factor();

    while (this.match(TokenType.MINUS, TokenType.PLUS)) {
      const operator: Token = this.previous();
      const right: Expr = this.factor();
      expr = new Binary(expr, operator, right);
    }
    return expr;
  }

  // unary ( ( "/" | "*" ) unary )*
  private factor(): Expr {
    let expr: Expr = this.unary();

    while (this.match(TokenType.SLASH, TokenType.STAR)) {
      const operator: Token = this.previous();
      const right: Expr = this.unary();
      expr = new Binary(expr, operator, right);
    }
    return expr;
  }

  // ( "!" | "-" ) unary | primary;
  private unary(): Expr {
    if (this.match(TokenType.BANG, TokenType.MINUS)) {
      const operator: Token = this.previous();
      const right: Expr = this.unary();
      return new Unary(operator, right);
    }
    return this.primary();
  }

  // NUMBER | STRING | "true" | "false" | "nil" | "(" expression ")" ;
  private primary(): Expr {
    if (this.match(TokenType.FALSE)) return new Literal(false);
    if (this.match(TokenType.TRUE)) return new Literal(true);
    if (this.match(TokenType.NIL)) return new Literal(undefined);

    if (this.match(TokenType.NUMBER, TokenType.STRING)) {
      return new Literal(this.previous().literal);
    }

    if (this.match(TokenType.IDENTIFIER)) {
      return new Variable(this.previous());
    }

    if (this.match(TokenType.LEFT_PAREN)) {
      const expr: Expr = this.expression();
      this.consume(TokenType.RIGHT_PAREN, 'Expect ")" after expression.');
      return new Grouping(expr);
    }

    throw this.error(this.peek(), 'Expect expression.');
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private peek(): Token {
    if (this.current >= this.tokens.length) throw new Error('Unexpected end of token');
    return this.tokens[this.current];
  }

  private previous(): Token {
    if (this.current > this.tokens.length) throw new Error('Unexpected end of token');
    return this.tokens[this.current - 1];
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();

    throw this.error(this.peek(), message);
  }

  private error(token: Token, message: string): ParserError {
    // TODO REPORT
    console.error(token, message);
    return new ParserError();
  }

  private synchronize(): void {
    this.advance();

    while (!this.isAtEnd()) {
      if (this.previous().type === TokenType.SEMICOLON) return;

      switch (this.peek().type) {
        case TokenType.CLASS:
        case TokenType.FUN:
        case TokenType.VAR:
        case TokenType.FOR:
        case TokenType.IF:
        case TokenType.WHILE:
        case TokenType.PRINT:
        case TokenType.RETURN:
          return;
      }

      this.advance();
    }
  }

  private statement(): Stmt {
    if (this.match(TokenType.PRINT)) return this.printStatement();
    if (this.match(TokenType.LEFT_BRACE)) return new Block(this.block());
    return this.expressionStatement();
  }

  private block(): Array<Stmt> {
    const statements: Array<Stmt> = [];

    while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
      statements.push(this.declaration());
    }

    this.consume(TokenType.RIGHT_BRACE, "Expect '}' after block.");
    return statements;
  }

  private printStatement(): Stmt {
    const value: Expr = this.expression();
    this.consume(TokenType.SEMICOLON, "Expect ';' after value.");
    return new Print(value);
  }

  private expressionStatement(): Stmt {
    const expr: Expr = this.expression();
    this.consume(TokenType.SEMICOLON, "Expect ';' after expression.");
    return new Expression(expr);
  }
}
