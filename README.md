# Crafting Interpreters

https://craftinginterpreters.com/

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

```
expression          -> assignment;
assignment          -> IDENTIFIER "=" assignment | logic_or ;
logic_or            -> logic_and ( "or" logic_and )* ;
logic_and           -> equality ( "and" equality )* ;
equality(동등)       -> comparison ( ( "!=" | "*" ) unary )* ;
comparison(비교)     -> term ( ( ">" | ">=" | "<" | "<=" ) term )* ;
term(항)             -> factor ( ("-" | "+") factor )* ;
factor(인수)         -> unary ( ( "/" | "*" ) unary )* ;
unary(단항)          -> ( "!" | "-" ) unary | primary;
primary(기본식)       -> NUMBER | STRING | "true" | "false" | "nil" | "(" expression ")" ;
```

```
문법 표기          |   코드 표현
터미널            |   토큰을 매치하여 소비하는 코드
넌터미널           |   해당 규칙의 함수를 호출
|                |  if 또는 switch 문
* 또는 +          |  while 또는 for 루프
?                |   if 문
```

```
program     -> declaration* EOF ;
declaration -> varDecl | statement ;
varDecl     -> "var" IDENTIFIER ( "=" expression )? ";" ;
statement   -> exprStmt | forStmt | ifStmt | printStmt | whileStmt | block ;
exprStmt    -> expression ";" ;
forStmt     -> "for" "(" ( varDecl | exprStmt | ";" ) expression ? ";" expression? ")" statement ;
ifStmt      -> "if" "(" expression ")" statement ( "else" statement )? ;
printStmt   -> "print" expression ";" ;
whileStmt   -> "while" "(" expression ")" statement ;
block       -> "{" declaration* "}" ;
```

// TODO https://github.com/munificent/craftinginterpreters/blob/master/note/answers/chapter06_parsing.md
