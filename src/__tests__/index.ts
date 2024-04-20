import { parse } from "..";
import * as go_ast from "../parser_mapper/ast_types";

test("parses a simple program", () => {
  const program = ``;
  const ast = parse(program);
  expect(ast).toEqual(new go_ast.Program([]));
});

// once the above test is verified, we can go along with other tests

function getFirstItemFromProgram(program: string): go_ast.GoNode {
  const ast = parse(program) as go_ast.Program;
  return ast.top_declarations[0];
}

test("parses a simple variable declaration", () => {
  const program = `var x number = 1;`;
  const ast = getFirstItemFromProgram(program);
  expect(ast).toEqual(
    new go_ast.Declaration(
      "var",
      [new go_ast.Identifier("x", new go_ast.BasicTypeClass("number"))],
      [new go_ast.Literal(1, new go_ast.BasicTypeClass("number"))],
    ),
  );
});

test("parses a multiple variable declaration", () => {
  const program = `var x, y number = 1, 2;`;
  const ast = getFirstItemFromProgram(program);
  expect(ast).toEqual(
    new go_ast.Declaration(
      "var",
      [
        new go_ast.Identifier("x", new go_ast.BasicTypeClass("number")),
        new go_ast.Identifier("y", new go_ast.BasicTypeClass("number")),
      ],
      [
        new go_ast.Literal(1, new go_ast.BasicTypeClass("number")),
        new go_ast.Literal(2, new go_ast.BasicTypeClass("number")),
      ],
    ),
  );
});

test("parses a constant declaration", () => {
  const program = `const x number = 1;`;
  const ast = getFirstItemFromProgram(program);
  expect(ast).toEqual(
    new go_ast.Declaration(
      "const",
      [new go_ast.Identifier("x", new go_ast.BasicTypeClass("number"))],
      [new go_ast.Literal(1, new go_ast.BasicTypeClass("number"))],
    ),
  );
});

test("parses a group declaration", () => {
  const program = ` var (
    x, y number = 1, 2;
    z string = "hello";
  );`;
  const ast = getFirstItemFromProgram(program);
  expect(ast).toEqual(
    new go_ast.Declaration(
      "var",
      [
        new go_ast.Identifier("x", new go_ast.BasicTypeClass("number")),
        new go_ast.Identifier("y", new go_ast.BasicTypeClass("number")),
        new go_ast.Identifier("z", new go_ast.BasicTypeClass("string")),
      ],
      [
        new go_ast.Literal(1, new go_ast.BasicTypeClass("number")),
        new go_ast.Literal(2, new go_ast.BasicTypeClass("number")),
        new go_ast.Literal("hello", new go_ast.BasicTypeClass("string")),
      ],
    ),
  );
});

test("parses a inferred declaration", () => {
  const program = `x := 1;`;
  const ast = getFirstItemFromProgram(program);
  expect(ast).toEqual(
    new go_ast.Declaration(
      "var", // inferred declaration is always a variable declaration
      [new go_ast.Identifier("x")], // observe that the type is not specified
      // the typechecking will be left to the typechecker instead
      [new go_ast.Literal(1, new go_ast.BasicTypeClass("number"))],
    ),
  );
});

/*
test("parses a multiple variable declaration with different types", () => {
  const program = `var x number, y string = 1, "hello";`;
  const ast = getFirstItemFromProgram(program);
  expect(ast).toEqual(new go_ast.Declaration(
    "var", 
    [
      new go_ast.Identifier("x", new go_ast.BasicTypeClass("number")),
      new go_ast.Identifier("y", new go_ast.BasicTypeClass("string"))
    ], 
    [
      new go_ast.Literal(1, new go_ast.BasicTypeClass("number")),
      new go_ast.Literal("hello", new go_ast.BasicTypeClass("string"))
    ]));
})
*/

test("parses a simple function declaration", () => {
  const program = `func test() {}`;
  const ast = getFirstItemFromProgram(program);
  expect(ast).toEqual(
    new go_ast.FunctionNode(new go_ast.Identifier("test"), [], null, []),
  );
});

test("parses a function declaration with parameters", () => {
  const program = `func test(a, b number) {}`;
  const ast = getFirstItemFromProgram(program);
  expect(ast).toEqual(
    new go_ast.FunctionNode(
      new go_ast.Identifier("test"),
      [
        new go_ast.Identifier("a", new go_ast.BasicTypeClass("number")),
        new go_ast.Identifier("b", new go_ast.BasicTypeClass("number")),
      ],
      null,
      [],
    ),
  );
});

test("parses a function declaration with types separated", () => {
  const program = `func test(a number, b number) {}`;
  const ast = getFirstItemFromProgram(program);
  expect(ast).toEqual(
    new go_ast.FunctionNode(
      new go_ast.Identifier("test"),
      [
        new go_ast.Identifier("a", new go_ast.BasicTypeClass("number")),
        new go_ast.Identifier("b", new go_ast.BasicTypeClass("number")),
      ],
      null,
      [],
    ),
  );
});

test("parses a function declaration with return type", () => {
  const program = `func test() number {}`;
  const ast = getFirstItemFromProgram(program);
  expect(ast).toEqual(
    new go_ast.FunctionNode(
      new go_ast.Identifier("test"),
      [],
      new go_ast.BasicTypeClass("number"),
      [],
    ),
  );
});

test("parses a function declaration with return type and parameters", () => {
  const program = `func test(a, b number, c string) number {}`;
  const ast = getFirstItemFromProgram(program);
  expect(ast).toEqual(
    new go_ast.FunctionNode(
      new go_ast.Identifier("test"),
      [
        new go_ast.Identifier("a", new go_ast.BasicTypeClass("number")),
        new go_ast.Identifier("b", new go_ast.BasicTypeClass("number")),
        new go_ast.Identifier("c", new go_ast.BasicTypeClass("string")),
      ],
      new go_ast.BasicTypeClass("number"),
      [],
    ),
  );
});

test("parses a function declaration with a body", () => {
  const program = `func test() {return 1;}`;
  const ast = getFirstItemFromProgram(program);
  expect(ast).toEqual(
    new go_ast.FunctionNode(new go_ast.Identifier("test"), [], null, [
      new go_ast.ReturnStatement([
        new go_ast.Literal(1, new go_ast.BasicTypeClass("number")),
      ]),
    ]),
  );
});

test("parses a type declaration", () => {
  const program = `type int number;`;
  const ast = getFirstItemFromProgram(program);
  expect(ast).toEqual(
    new go_ast.TypeDeclaration(
      new go_ast.CustomType("int"),
      new go_ast.BasicTypeClass("number"),
    ),
  );
});

// at this point, we have tested all basic declarations.
// we can now reason with items inside functions.

function getFirstStatementFromFunction(statement: string): go_ast.GoNode {
  const program = `func test() {${statement}}`;
  const ast = parse(program) as go_ast.Program;
  const fn = ast.top_declarations[0] as go_ast.FunctionNode;
  return fn.body[0];
}

test("parses a number(integer) literal", () => {
  const statement = `1;`;
  const ast = getFirstStatementFromFunction(statement);
  expect(ast).toEqual(
    new go_ast.ExpressionStatement(
      new go_ast.Literal(1, new go_ast.BasicTypeClass("number")),
    ),
  );
});

test("parses a number(float) literal", () => {
  const statement = `1.4;`;
  const ast = getFirstStatementFromFunction(statement);
  expect(ast).toEqual(
    new go_ast.ExpressionStatement(
      new go_ast.Literal(1.4, new go_ast.BasicTypeClass("number")),
    ),
  );
});

test("parses a string literal", () => {
  const statement = `"hello";`;
  const ast = getFirstStatementFromFunction(statement);
  expect(ast).toEqual(
    new go_ast.ExpressionStatement(
      new go_ast.Literal("hello", new go_ast.BasicTypeClass("string")),
    ),
  );
});

test("parses a boolean literal", () => {
  const statement = `true;`;
  const ast = getFirstStatementFromFunction(statement);
  expect(ast).toEqual(
    new go_ast.ExpressionStatement(
      new go_ast.Literal(true, new go_ast.BasicTypeClass("boolean")),
    ),
  );
});

test("parses an identifier", () => {
  const statement = `x;`;
  const ast = getFirstStatementFromFunction(statement);
  expect(ast).toEqual(
    new go_ast.ExpressionStatement(new go_ast.Identifier("x")),
  );
});

test("parses an application", () => {
  const statement = `add(1, 2);`;
  const ast = getFirstStatementFromFunction(statement);
  expect(ast).toEqual(
    new go_ast.ExpressionStatement(
      new go_ast.Application(new go_ast.Identifier("add"), [
        new go_ast.Literal(1, new go_ast.BasicTypeClass("number")),
        new go_ast.Literal(2, new go_ast.BasicTypeClass("number")),
      ]),
    ),
  );
});

test("parses a unary operation", () => {
  const statement = `!x;`;
  const ast = getFirstStatementFromFunction(statement);
  expect(ast).toEqual(
    new go_ast.ExpressionStatement(
      new go_ast.UnOp("!", new go_ast.Identifier("x")),
    ),
  );
});

test("parses a binary operation (addition)", () => {
  const statement = `x + y;`;
  const ast = getFirstStatementFromFunction(statement);
  expect(ast).toEqual(
    new go_ast.ExpressionStatement(
      new go_ast.BinOp(
        new go_ast.Identifier("x"),
        "+",
        new go_ast.Identifier("y"),
      ),
    ),
  );
});

test("parses a binary operation (multiplication)", () => {
  const statement = `x * y;`;
  const ast = getFirstStatementFromFunction(statement);
  expect(ast).toEqual(
    new go_ast.ExpressionStatement(
      new go_ast.BinOp(
        new go_ast.Identifier("x"),
        "*",
        new go_ast.Identifier("y"),
      ),
    ),
  );
});

test("parses a binary operation (comparative)", () => {
  const statement = `x > y;`;
  const ast = getFirstStatementFromFunction(statement);
  expect(ast).toEqual(
    new go_ast.ExpressionStatement(
      new go_ast.BinOp(
        new go_ast.Identifier("x"),
        ">",
        new go_ast.Identifier("y"),
      ),
    ),
  );
});

test("parses a binary operation (logical)", () => {
  const statement = `x && y;`;
  const ast = getFirstStatementFromFunction(statement);
  expect(ast).toEqual(
    new go_ast.ExpressionStatement(
      new go_ast.BinOp(
        new go_ast.Identifier("x"),
        "&&",
        new go_ast.Identifier("y"),
      ),
    ),
  );
});

test("parses binary operations in BODMAS order", () => {
  const statement = `x + y * z;`;
  const ast = getFirstStatementFromFunction(statement);
  expect(ast).toEqual(
    new go_ast.ExpressionStatement(
      new go_ast.BinOp(
        new go_ast.Identifier("x"),
        "+",
        new go_ast.BinOp(
          new go_ast.Identifier("y"),
          "*",
          new go_ast.Identifier("z"),
        ),
      ),
    ),
  );
});

test("parses binary operations with parentheses", () => {
  const statement = `(x + y) * z;`;
  const ast = getFirstStatementFromFunction(statement);
  expect(ast).toEqual(
    new go_ast.ExpressionStatement(
      new go_ast.BinOp(
        new go_ast.BinOp(
          new go_ast.Identifier("x"),
          "+",
          new go_ast.Identifier("y"),
        ),
        "*",
        new go_ast.Identifier("z"),
      ),
    ),
  );
});

test("parses a complex binary operation", () => {
  const statement = `x + y * z / 4;`;
  const ast = getFirstStatementFromFunction(statement);
  expect(ast).toEqual(
    new go_ast.ExpressionStatement(
      new go_ast.BinOp(
        new go_ast.Identifier("x"),
        "+",
        new go_ast.BinOp(
          new go_ast.BinOp(
            new go_ast.Identifier("y"),
            "*",
            new go_ast.Identifier("z"),
          ),
          "/",
          new go_ast.Literal(4, new go_ast.BasicTypeClass("number")),
        ),
      ),
    ),
  );
});

test("parses a complex expression in BODMAS order", () => {
  const statement = `a + (x + y) * z / 4;`;
  const ast = getFirstStatementFromFunction(statement);
  expect(ast).toEqual(
    new go_ast.ExpressionStatement(
      new go_ast.BinOp(
        new go_ast.Identifier("a"),
        "+",
        new go_ast.BinOp(
          new go_ast.BinOp(
            new go_ast.BinOp(
              new go_ast.Identifier("x"),
              "+",
              new go_ast.Identifier("y"),
            ),
            "*",
            new go_ast.Identifier("z"),
          ),
          "/",
          new go_ast.Literal(4, new go_ast.BasicTypeClass("number")),
        ),
      ),
    ),
  );
});

test("parses a simple return statement", () => {
  const statement = `return 1;`;
  const ast = getFirstStatementFromFunction(statement);
  expect(ast).toEqual(
    new go_ast.ReturnStatement([
      new go_ast.Literal(1, new go_ast.BasicTypeClass("number")),
    ]),
  );
});

test("parses a return statement with multiple values", () => {
  const statement = `return 1, 2;`;
  const ast = getFirstStatementFromFunction(statement);
  expect(ast).toEqual(
    new go_ast.ReturnStatement([
      new go_ast.Literal(1, new go_ast.BasicTypeClass("number")),
      new go_ast.Literal(2, new go_ast.BasicTypeClass("number")),
    ]),
  );
});

test("parses a return statement with no values", () => {
  const statement = `return;`;
  const ast = getFirstStatementFromFunction(statement);
  expect(ast).toEqual(new go_ast.ReturnStatement([]));
});

test("parses an assignment statement", () => {
  const statement = `x = 1;`;
  const ast = getFirstStatementFromFunction(statement);
  expect(ast).toEqual(
    new go_ast.AssignmentStatement(
      [new go_ast.Identifier("x")],
      [new go_ast.Literal(1, new go_ast.BasicTypeClass("number"))],
    ),
  );
});

test("parses a multiple assignment statement", () => {
  const statement = `x, y = 1, 2;`;
  const ast = getFirstStatementFromFunction(statement);
  expect(ast).toEqual(
    new go_ast.AssignmentStatement(
      [new go_ast.Identifier("x"), new go_ast.Identifier("y")],
      [
        new go_ast.Literal(1, new go_ast.BasicTypeClass("number")),
        new go_ast.Literal(2, new go_ast.BasicTypeClass("number")),
      ],
    ),
  );
});

test("parses an assignment statement to an indexed expression", () => {
  const statement = `x[0] = 1;`;
  const ast = getFirstStatementFromFunction(statement);
  expect(ast).toEqual(
    new go_ast.AssignmentStatement(
      [
        new go_ast.IndexAccess(
          new go_ast.Identifier("x"),
          new go_ast.Literal(0, new go_ast.BasicTypeClass("number")),
        ),
      ],
      [new go_ast.Literal(1, new go_ast.BasicTypeClass("number"))],
    ),
  );
});

test("parses an assignment statement to multiple indexed expressions", () => {
  const statement = `x[0], y[1] = 1, 2;`;
  const ast = getFirstStatementFromFunction(statement);
  expect(ast).toEqual(
    new go_ast.AssignmentStatement(
      [
        new go_ast.IndexAccess(
          new go_ast.Identifier("x"),
          new go_ast.Literal(0, new go_ast.BasicTypeClass("number")),
        ),
        new go_ast.IndexAccess(
          new go_ast.Identifier("y"),
          new go_ast.Literal(1, new go_ast.BasicTypeClass("number")),
        ),
      ],
      [
        new go_ast.Literal(1, new go_ast.BasicTypeClass("number")),
        new go_ast.Literal(2, new go_ast.BasicTypeClass("number")),
      ],
    ),
  );
});

test("parses an if statement", () => {
  const statement = `if x > 0 {}`;
  const ast = getFirstStatementFromFunction(statement);
  expect(ast).toEqual(
    new go_ast.IfStatement(
      new go_ast.BinOp(
        new go_ast.Identifier("x"),
        ">",
        new go_ast.Literal(0, new go_ast.BasicTypeClass("number")),
      ),
      [],
      null,
      null,
    ),
  );
});

test("parses an if statement with else condition", () => {
  const statement = `if x > 0 { i_work; } else { i_work_too; }`;
  const ast = getFirstStatementFromFunction(statement);
  expect(ast).toEqual(
    new go_ast.IfStatement(
      new go_ast.BinOp(
        new go_ast.Identifier("x"),
        ">",
        new go_ast.Literal(0, new go_ast.BasicTypeClass("number")),
      ),
      [new go_ast.ExpressionStatement(new go_ast.Identifier("i_work"))],
      [new go_ast.ExpressionStatement(new go_ast.Identifier("i_work_too"))],
      null,
    ),
  );
});

test("parses an if statement with short statement", () => {
  const statement = `if hello; x > 0 { i_work; }`;
  const ast = getFirstStatementFromFunction(statement);
  expect(ast).toEqual(
    new go_ast.IfStatement(
      new go_ast.BinOp(
        new go_ast.Identifier("x"),
        ">",
        new go_ast.Literal(0, new go_ast.BasicTypeClass("number")),
      ),
      [new go_ast.ExpressionStatement(new go_ast.Identifier("i_work"))],
      null,
      new go_ast.ExpressionStatement(new go_ast.Identifier("hello")),
    ),
  );
});

test("parses if, else if, else statement", () => {
  const statement = `if x > 0 { i_work; } else if x < 0 { i_work_too; } else { i_work_three; }`;
  const ast = getFirstStatementFromFunction(statement);
  expect(ast).toEqual(
    new go_ast.IfStatement(
      new go_ast.BinOp(
        new go_ast.Identifier("x"),
        ">",
        new go_ast.Literal(0, new go_ast.BasicTypeClass("number")),
      ),
      [new go_ast.ExpressionStatement(new go_ast.Identifier("i_work"))],
      [
        new go_ast.IfStatement(
          new go_ast.BinOp(
            new go_ast.Identifier("x"),
            "<",
            new go_ast.Literal(0, new go_ast.BasicTypeClass("number")),
          ),
          [new go_ast.ExpressionStatement(new go_ast.Identifier("i_work_too"))],
          [
            new go_ast.ExpressionStatement(
              new go_ast.Identifier("i_work_three"),
            ),
          ],
          null,
        ),
      ],
      null,
    ),
  );
});

test("parses a for loop", () => {
  const statement = `for x := 0; x < 10; x = x + 1 { i_work; }`;
  const ast = getFirstStatementFromFunction(statement);
  expect(ast).toEqual(
    new go_ast.ForStatement(
      new go_ast.Declaration(
        "var",
        [new go_ast.Identifier("x")],
        [new go_ast.Literal(0, new go_ast.BasicTypeClass("number"))],
      ),
      new go_ast.BinOp(
        new go_ast.Identifier("x"),
        "<",
        new go_ast.Literal(10, new go_ast.BasicTypeClass("number")),
      ),
      new go_ast.AssignmentStatement(
        [new go_ast.Identifier("x")],
        [
          new go_ast.BinOp(
            new go_ast.Identifier("x"),
            "+",
            new go_ast.Literal(1, new go_ast.BasicTypeClass("number")),
          ),
        ],
      ),
      [new go_ast.ExpressionStatement(new go_ast.Identifier("i_work"))],
    ),
  );
});

test("parses a for loop with empty condition", () => {
  const statement = `for ;; { i_work; }`;
  const ast = getFirstStatementFromFunction(statement);
  expect(ast).toEqual(
    new go_ast.ForStatement(
      new go_ast.EmptyStatement(), // weird but valid
      null,
      null,
      [new go_ast.ExpressionStatement(new go_ast.Identifier("i_work"))],
    ),
  );
});

test("parses a go statement", () => {
  const statement = `go func() { i_work; }();`;
  const ast = getFirstStatementFromFunction(statement);
  expect(ast).toEqual(
    new go_ast.GoStatement(
      new go_ast.Application(
        new go_ast.FunctionNode(null, [], null, [
          new go_ast.ExpressionStatement(new go_ast.Identifier("i_work")),
        ]),
        [],
      ),
    ),
  );
});

test("parses a select statement", () => {
  const statement = `
  select { 
    case x <- c: i_work;
    case <- quit: i_work_too;
    default: i_work_three;
  }`;
  const ast = getFirstStatementFromFunction(statement);
  expect(ast).toEqual(
    new go_ast.SelectStatement([
      new go_ast.SelectCase(
        new go_ast.SendStatement(
          new go_ast.Identifier("x"),
          new go_ast.Identifier("c"),
          true,
        ),
        [new go_ast.ExpressionStatement(new go_ast.Identifier("i_work"))],
      ),
      new go_ast.SelectCase(
        new go_ast.ExpressionStatement(
          new go_ast.ReceiveExpression(new go_ast.Identifier("quit"), true),
        ),
        [new go_ast.ExpressionStatement(new go_ast.Identifier("i_work_too"))],
      ),
      new go_ast.DefaultCase([
        new go_ast.ExpressionStatement(new go_ast.Identifier("i_work_three")),
      ]),
    ]),
  );
});

test("parses a send statement", () => {
  const statement = `c <- x;`;
  const ast = getFirstStatementFromFunction(statement);
  expect(ast).toEqual(
    new go_ast.SendStatement(
      new go_ast.Identifier("c"),
      new go_ast.Identifier("x"),
      false,
    ),
  );
});

test("parses a receive expression", () => {
  const statement = `<- c;`;
  const ast = getFirstStatementFromFunction(statement);
  expect(ast).toEqual(
    new go_ast.ExpressionStatement(
      new go_ast.ReceiveExpression(new go_ast.Identifier("c"), false),
    ),
  );
});

test("parses an index access", () => {
  const statement = `x[0];`;
  const ast = getFirstStatementFromFunction(statement);
  expect(ast).toEqual(
    new go_ast.ExpressionStatement(
      new go_ast.IndexAccess(
        new go_ast.Identifier("x"),
        new go_ast.Literal(0, new go_ast.BasicTypeClass("number")),
      ),
    ),
  );
});

test("parses an index access with an expression", () => {
  const statement = `x[y];`;
  const ast = getFirstStatementFromFunction(statement);
  expect(ast).toEqual(
    new go_ast.ExpressionStatement(
      new go_ast.IndexAccess(
        new go_ast.Identifier("x"),
        new go_ast.Identifier("y"),
      ),
    ),
  );
});

test("parses an anonymous function", () => {
  const statement = `func() { i_work; }();`;
  const ast = getFirstStatementFromFunction(statement);
  expect(ast).toEqual(
    new go_ast.ExpressionStatement(
      new go_ast.Application(
        new go_ast.FunctionNode(null, [], null, [
          new go_ast.ExpressionStatement(new go_ast.Identifier("i_work")),
        ]),
        [],
      ),
    ),
  );
});

test("parses a structType", () => {
  const statement = "type a struct{ x number; y string; };";
  const ast = getFirstStatementFromFunction(statement);
  expect(ast).toEqual(
    new go_ast.TypeDeclaration(
      new go_ast.CustomType("a"),
      new go_ast.StructType([
        new go_ast.StructElement(
          new go_ast.Identifier("x", new go_ast.BasicTypeClass("number")),
        ),
        new go_ast.StructElement(
          new go_ast.Identifier("y", new go_ast.BasicTypeClass("string")),
        ),
      ]),
    ),
  );
});

test("parses a struct literal", () => {
  const statement = 'a{a: 1, b: "hello"};';
  const ast = getFirstStatementFromFunction(statement);
  expect(ast).toEqual(
    new go_ast.ExpressionStatement(
      new go_ast.StructLiteral(new go_ast.CustomType("a"), [
        new go_ast.StructFieldInstantiation(
          new go_ast.Identifier("a"),
          new go_ast.Literal(1, new go_ast.BasicTypeClass("number")),
        ),
        new go_ast.StructFieldInstantiation(
          new go_ast.Identifier("b"),
          new go_ast.Literal("hello", new go_ast.BasicTypeClass("string")),
        ),
      ]),
    ),
  );
});

test("parses a struct access", () => {
  const statement = "x.a;";
  const ast = getFirstStatementFromFunction(statement);
  expect(ast).toEqual(
    new go_ast.ExpressionStatement(
      new go_ast.StructAccess(
        new go_ast.Identifier("x"),
        new go_ast.Identifier("a"),
      ),
    ),
  );
});
