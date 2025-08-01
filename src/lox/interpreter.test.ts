import { describe, it } from 'vitest';
import { Scanner } from './scanner.ts';
import { Parser } from './parser.ts';
import { Interpreter } from './interpreter.ts';

describe('Interpreter', () => {
  it.each(['print "one";', 'print true;', 'print 2 + 1;'])('print', (source) => {
    const scanner = new Scanner(source);
    const tokens = scanner.scanTokens();
    const parser = new Parser(tokens);
    const statements = parser.parse();
    const interpreter = new Interpreter();

    interpreter.interpret(statements);
  });

  it('변수 프린트 (1)', () => {
    const source = 'var beverage = "espresso";\nprint beverage;';
    const scanner = new Scanner(source);
    const tokens = scanner.scanTokens();
    const parser = new Parser(tokens);
    const statements = parser.parse();
    const interpreter = new Interpreter();

    interpreter.interpret(statements);
  });

  it('변수 프린트 (2)', () => {
    const source = 'var a = 1;\nvar b = 2;\nprint a + b;';
    const scanner = new Scanner(source);
    const tokens = scanner.scanTokens();
    const parser = new Parser(tokens);
    const statements = parser.parse();
    const interpreter = new Interpreter();

    interpreter.interpret(statements);
  });

  it('{ Block 테스트', () => {
    const source = `
var a = "outer";

{
  var a = "inner";
  print a; // expect: inner
}

print a; // expect: outer
    `;
    const scanner = new Scanner(source);
    const tokens = scanner.scanTokens();
    const parser = new Parser(tokens);
    const statements = parser.parse();
    const interpreter = new Interpreter();

    interpreter.interpret(statements);
  });
});
