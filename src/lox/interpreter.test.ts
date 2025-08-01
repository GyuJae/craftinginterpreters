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

    interpreter.interpret(statements); // one\n true\n 3
  });

  it('변수 프린트 (1)', () => {
    const source = 'var beverage = "espresso";\nprint beverage;';
    const scanner = new Scanner(source);
    const tokens = scanner.scanTokens();
    const parser = new Parser(tokens);
    const statements = parser.parse();
    const interpreter = new Interpreter();

    interpreter.interpret(statements); // espresso
  });

  it('변수 프린트 (2)', () => {
    const source = 'var a = 1;\nvar b = 2;\nprint a + b;';
    const scanner = new Scanner(source);
    const tokens = scanner.scanTokens();
    const parser = new Parser(tokens);
    const statements = parser.parse();
    const interpreter = new Interpreter();

    interpreter.interpret(statements); // 3
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

    interpreter.interpret(statements); // inner \n outer
  });

  it('Logical or (1)', () => {
    const source = `print "hi" or 2;`;
    const scanner = new Scanner(source);
    const tokens = scanner.scanTokens();
    const parser = new Parser(tokens);
    const statements = parser.parse();
    const interpreter = new Interpreter();

    interpreter.interpret(statements); // hi
  });

  it('Logical or (2)', () => {
    const source = `print nil or "yes";`;
    const scanner = new Scanner(source);
    const tokens = scanner.scanTokens();
    const parser = new Parser(tokens);
    const statements = parser.parse();
    const interpreter = new Interpreter();

    interpreter.interpret(statements); // yes
  });

  it('while', () => {
    const source = `var i = 0; while(i < 3) { print i; i = i + 1;}`;
    const scanner = new Scanner(source);
    const tokens = scanner.scanTokens();
    const parser = new Parser(tokens);
    const statements = parser.parse();
    const interpreter = new Interpreter();

    interpreter.interpret(statements); // 0\n 1\n 2\n
  });

  it('for', () => {
    const source = `for (var i = 0; i < 3; i = i + 1 ) print i;`;
    const scanner = new Scanner(source);
    const tokens = scanner.scanTokens();
    const parser = new Parser(tokens);
    const statements = parser.parse();
    const interpreter = new Interpreter();

    interpreter.interpret(statements); // 0\n 1\n 2\n
  });
});
