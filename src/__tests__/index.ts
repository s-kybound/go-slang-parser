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

test("parses a complex declaration", () => {
  const program = ` var (
    x, y number = 1, 2
    z string = "hello"
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
      new go_ast.Application(
        new go_ast.Identifier("add"),
        [
          new go_ast.Literal(1, new go_ast.BasicTypeClass("number")),
          new go_ast.Literal(2, new go_ast.BasicTypeClass("number")),
        ],
      ),
    ),
  );
})