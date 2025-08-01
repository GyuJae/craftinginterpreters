/* eslint-disable */
import { Token } from './token.ts';
import { TokenType } from './token-type.ts';

export class Scanner {
  private readonly tokens: Array<Token> = [];
  private start: number = 0;
  private current: number = 0;
  private line: number = 1;
  private static keywords: Map<string, TokenType> = new Map<string, TokenType>([
    ['and', TokenType.AND],
    ['class', TokenType.CLASS],
    ['else', TokenType.ELSE],
    ['false', TokenType.FALSE],
    ['for', TokenType.FOR],
    ['fun', TokenType.FUN],
    ['if', TokenType.IF],
    ['nil', TokenType.NIL],
    ['or', TokenType.OR],
    ['print', TokenType.PRINT],
    ['return', TokenType.RETURN],
    ['super', TokenType.SUPER],
    ['this', TokenType.THIS],
    ['true', TokenType.TRUE],
    ['var', TokenType.VAR],
    ['while', TokenType.WHILE],
  ]);

  constructor(private readonly source: string) {}

  public scanTokens(): Array<Token> {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push(new Token(TokenType.EOF, '', undefined, this.line));
    return this.tokens;
  }

  private scanToken(): void {
    const c = this.advance();

    switch (c) {
      case '(': {
        this.addToken(TokenType.LEFT_PAREN);
        break;
      }
      case ')': {
        this.addToken(TokenType.RIGHT_PAREN);
        break;
      }
      case '{': {
        this.addToken(TokenType.LEFT_BRACE);
        break;
      }
      case '}': {
        this.addToken(TokenType.RIGHT_BRACE);
        break;
      }
      case ',': {
        this.addToken(TokenType.COMMA);
        break;
      }
      case '.': {
        this.addToken(TokenType.DOT);
        break;
      }
      case '-': {
        this.addToken(TokenType.MINUS);
        break;
      }
      case '+': {
        this.addToken(TokenType.PLUS);
        break;
      }
      case ';': {
        this.addToken(TokenType.SEMICOLON);
        break;
      }
      case '*': {
        this.addToken(TokenType.STAR);
        break;
      }
      case '!': {
        this.addToken(this.match('=') ? TokenType.BANG_EQUAL : TokenType.BANG);
        break;
      }
      case '=': {
        this.addToken(this.match('=') ? TokenType.EQUAL_EQUAL : TokenType.EQUAL);
        break;
      }
      case '<': {
        this.addToken(this.match('=') ? TokenType.LESS_EQUAL : TokenType.LESS);
        break;
      }
      case '>': {
        this.addToken(this.match('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER);
        break;
      }
      case '/': {
        if (this.match('/')) while (this.peek() !== '\n' && !this.isAtEnd()) this.advance();
        else if (this.match('*')) this.blockComment();
        else this.addToken(TokenType.SLASH);
        break;
      }
      case ' ':
      case '\r':
      case '\t':
        break;
      case '\n': {
        this.line++;
        break;
      }
      case '"': {
        this.string();
        break;
      }

      default: {
        if (this.isDigit(c)) this.number();
        else if (this.isAlpha(c)) this.identifier();
        else throw new Error(`${this.line} line -> Unexpected character : ${c}`);
      }
    }
  }

  private isAtEnd(): boolean {
    return this.current >= this.source.length;
  }

  private advance(): string {
    return this.source.charAt(this.current++);
  }

  private addToken(type: TokenType, literal?: any) {
    const text = this.source.slice(this.start, this.current);
    this.tokens.push(new Token(type, text, literal, this.line));
  }

  private match(expected: string): boolean {
    if (this.isAtEnd()) return false;
    if (this.source.charAt(this.current) !== expected) return false;
    this.current++;
    return true;
  }

  private peek(): string {
    if (this.isAtEnd()) return '\0';
    return this.source.charAt(this.current);
  }

  private string() {
    while (this.peek() !== '"' && !this.isAtEnd()) {
      if (this.peek() === '\n') this.line++;
      this.advance();
    }

    if (this.isAtEnd()) throw new Error(`${this.line} line -> Unterminated string.`);

    this.advance();

    const value = this.source.slice(this.start + 1, this.current - 1);
    this.addToken(TokenType.STRING, value);
  }

  private isDigit(c: string): boolean {
    if (c.length > 1) return false;
    return c >= '0' && c <= '9';
  }

  private number(): void {
    while (this.isDigit(this.peek())) this.advance();

    // 소수부를 피크한다.
    if (this.peek() === '.' && this.isDigit(this.peekNext())) {
      // "."을 소비한다.
      this.advance();

      while (this.isDigit(this.peek())) this.advance();
    }

    this.addToken(TokenType.NUMBER, +this.source.slice(this.start, this.current));
  }

  private peekNext(): string {
    if (this.current + 1 >= this.source.length) return '\0';
    return this.source.charAt(this.current + 1);
  }

  private identifier() {
    while (this.isAlphaNumeric(this.peek())) this.advance();

    const text = this.source.slice(this.start, this.current);
    const type = Scanner.keywords.get(text);

    if (type === undefined) this.addToken(TokenType.IDENTIFIER);
    else this.addToken(type);
  }

  private isAlpha(c: string): boolean {
    return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_';
  }

  private isAlphaNumeric(c: string): boolean {
    return this.isAlpha(c) || this.isDigit(c);
  }

  private blockComment(): void {
    while (!this.isAtEnd()) {
      if (this.peek() === '\n') this.line++;

      if (this.peek() === '*' && this.peekNext() === '/') {
        this.advance(); // '*'
        this.advance(); // '/'
        return;
      }

      this.advance();
    }

    throw new Error(`${this.line} line -> Unterminated block comment.`);
  }
}
