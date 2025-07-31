import {describe, expect, it} from "vitest";
import {Scanner} from "./scanner.ts";
import {TokenType} from "./token-type.ts";

describe('Scanner', () => {
    it('빈 문자열', () => {
        const scanner = new Scanner('')

        const tokens = scanner.scanTokens();

        expect(tokens).toHaveLength(1);
        expect(tokens[0].type).toBe(TokenType.EOF);
    })

    it('기본 렉시컬', () => {
        const scanner = new Scanner('(){}+-;');

        const tokens = scanner.scanTokens();

        expect(tokens.map(t => t.type)).toEqual([
            TokenType.LEFT_PAREN,
            TokenType.RIGHT_PAREN,
            TokenType.LEFT_BRACE,
            TokenType.RIGHT_BRACE,
            TokenType.PLUS,
            TokenType.MINUS,
            TokenType.SEMICOLON,
            TokenType.EOF,
        ]);
    });

    it.each(['@', '#', '^'])('렉시컬 에러: %s', (source) => {
        const scanner = new Scanner(source);

        expect(() => scanner.scanTokens()).toThrowError(Error);
    })

    it('연산자: !', () => {
        const scanner = new Scanner('!');

        const tokens = scanner.scanTokens();

        expect(tokens).toHaveLength(2);
        expect(tokens[0].type).toBe(TokenType.BANG)
    })

    it('연산자: !=', () => {
        const scanner = new Scanner('!=');

        const tokens = scanner.scanTokens();

        expect(tokens).toHaveLength(2);
        expect(tokens[0].type).toBe(TokenType.BANG_EQUAL)
    })

    it('연산자: =', () => {
        const scanner = new Scanner('=');

        const tokens = scanner.scanTokens();

        expect(tokens).toHaveLength(2);
        expect(tokens[0].type).toBe(TokenType.EQUAL)
    })

    it('연산자: ==', () => {
        const scanner = new Scanner('==');

        const tokens = scanner.scanTokens();

        expect(tokens).toHaveLength(2);
        expect(tokens[0].type).toBe(TokenType.EQUAL_EQUAL);
    })

    it('연산자: <', () => {
        const scanner = new Scanner('<');

        const tokens = scanner.scanTokens();

        expect(tokens).toHaveLength(2);
        expect(tokens[0].type).toBe(TokenType.LESS)
    })

    it('연산자: <=', () => {
        const scanner = new Scanner('<=');

        const tokens = scanner.scanTokens();

        expect(tokens).toHaveLength(2);
        expect(tokens[0].type).toBe(TokenType.LESS_EQUAL);
    })

    it('연산자: >', () => {
        const scanner = new Scanner('>');

        const tokens = scanner.scanTokens();

        expect(tokens).toHaveLength(2);
        expect(tokens[0].type).toBe(TokenType.GREATER)
    })

    it('연산자: >=', () => {
        const scanner = new Scanner('>=');

        const tokens = scanner.scanTokens();

        expect(tokens).toHaveLength(2);
        expect(tokens[0].type).toBe(TokenType.GREATER_EQUAL);
    })

    it('주석', () => {
        const scanner = new Scanner('// 이것은 주석이다');

        const tokens = scanner.scanTokens();

        expect(tokens).toHaveLength(1);
        expect(tokens[0].type).toBe(TokenType.EOF)
    })

    it('문자열 리터얼', () => {
        const scanner = new Scanner('"gyujae"');

        const tokens = scanner.scanTokens();

        expect(tokens).toHaveLength(2);
        expect(tokens[0].type).toBe(TokenType.STRING);
        expect(tokens[0].lexeme).toBe('"gyujae"')
        expect(tokens[0].literal).toBe('gyujae');
    })

    it('숫자 리터얼: 정수', () => {
        const scanner = new Scanner('1234');

        const tokens = scanner.scanTokens();

        expect(tokens).toHaveLength(2);
        expect(tokens[0].type).toBe(TokenType.NUMBER);
        expect(tokens[0].lexeme).toBe('1234');
        expect(tokens[0].literal).toBe(1234);
    })

    it('숫자 리터얼: 소수', () => {
        const scanner = new Scanner('12.34');

        const tokens = scanner.scanTokens();

        expect(tokens).toHaveLength(2);
        expect(tokens[0].type).toBe(TokenType.NUMBER);
        expect(tokens[0].lexeme).toBe('12.34');
        expect(tokens[0].literal).toBe(12.34);
    })

    it.each([
        { name: 'and', type: TokenType.AND },
        { name: 'class', type: TokenType.CLASS },
        { name: 'else', type: TokenType.ELSE },
        { name: 'false', type: TokenType.FALSE },
        { name: 'for', type: TokenType.FOR },
        { name: 'fun', type: TokenType.FUN },
        { name: 'if', type: TokenType.IF },
        { name: 'nil', type: TokenType.NIL },
        { name: 'or', type: TokenType.OR },
        { name: 'print', type: TokenType.PRINT },
        { name: 'return', type: TokenType.RETURN },
        { name: 'super', type: TokenType.SUPER },
        { name: 'this', type: TokenType.THIS },
        { name: 'true', type: TokenType.TRUE },
        { name: 'var', type: TokenType.VAR },
        { name: 'while', type: TokenType.WHILE },
    ])('예약어와 식별자: $name', ({ name, type }) => {
        const scanner = new Scanner(name);

        const tokens = scanner.scanTokens();

        expect(tokens).toHaveLength(2);
        expect(tokens[0].type).toBe(type)
    })

    it('/* ... */ 블록 주석', () => {
        const scanner = new Scanner('/*\n\n\n\n\n\n\n\n\n주석입니다.\n\n\n\n\n\n*/')

        const tokens = scanner.scanTokens();

        expect(tokens).toHaveLength(1);
        expect(tokens[0].type).toBe(TokenType.EOF);
    })
})