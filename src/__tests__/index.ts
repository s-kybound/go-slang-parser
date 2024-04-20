import { parse } from "..";
import * as go_ast from "../parser_mapper/ast_types";

test("parses a simple program", () => {
  const program = ``;
  const ast = parse(program);
  expect(ast).toEqual(new go_ast.Program([]));
})

// once the above test is verified, we can go along with other tests

function getFirstItemFromProgram(program: string): go_ast.GoNode {
  const ast = parse(program) as go_ast.Program;
  return ast.top_declarations[0];
}

test("parses a simple variable declaration", () => {
  const program = `var x number = 1;`;
  const ast = getFirstItemFromProgram(program);
  expect(ast).toEqual(new go_ast.Declaration(
    "var", 
    [new go_ast.Identifier("x", new go_ast.BasicTypeClass("number"))], 
    [new go_ast.Literal(1, new go_ast.BasicTypeClass("number"))]));
})

test("parses a multiple variable declaration", () => {
  const program = `var x, y number = 1, 2;`;
  const ast = getFirstItemFromProgram(program);
  expect(ast).toEqual(new go_ast.Declaration(
    "var", 
    [
      new go_ast.Identifier("x", new go_ast.BasicTypeClass("number")),
      new go_ast.Identifier("y", new go_ast.BasicTypeClass("number"))
    ], 
    [
      new go_ast.Literal(1, new go_ast.BasicTypeClass("number")),
      new go_ast.Literal(2, new go_ast.BasicTypeClass("number"))
    ]));
})

test("parses a constant declaration", () => {
  const program = `const x number = 1;`;
  const ast = getFirstItemFromProgram(program);
  expect(ast).toEqual(new go_ast.Declaration(
    "const", 
    [new go_ast.Identifier("x", new go_ast.BasicTypeClass("number"))], 
    [new go_ast.Literal(1, new go_ast.BasicTypeClass("number"))]));
})

test("parses a inferred declaration", () => {
  const program = `x := 1;`;
  const ast = getFirstItemFromProgram(program);
  expect(ast).toEqual(new go_ast.Declaration(
    "var", // inferred declaration is always a variable declaration 
    [new go_ast.Identifier("x")], 
    [new go_ast.Literal(1, new go_ast.BasicTypeClass("number"))]));
})

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
  expect(ast).toEqual(new go_ast.FunctionNode(
    new go_ast.Identifier("test"), [], null, []));
  })

test("parses a function declaration with parameters", () => {
  const program = `func test(a, b number) {}`;
  const ast = getFirstItemFromProgram(program);
  expect(ast).toEqual(new go_ast.FunctionNode(
    new go_ast.Identifier("test"), 
    [
      new go_ast.Identifier("a", new go_ast.BasicTypeClass("number")),
      new go_ast.Identifier("b", new go_ast.BasicTypeClass("number"))
    ], 
    null, 
    []));
})

test("parses a function declaration with types separated", () => {
  const program = `func test(a number, b number) {}`;
  const ast = getFirstItemFromProgram(program);
  expect(ast).toEqual(new go_ast.FunctionNode(
    new go_ast.Identifier("test"), 
    [
      new go_ast.Identifier("a", new go_ast.BasicTypeClass("number")),
      new go_ast.Identifier("b", new go_ast.BasicTypeClass("number"))
    ], 
    null, 
    []));
})

test("parses a function declaration with return type", () => {
  const program = `func test() number {}`;
  const ast = getFirstItemFromProgram(program);
  expect(ast).toEqual(new go_ast.FunctionNode(
    new go_ast.Identifier("test"), [], new go_ast.BasicTypeClass("number"), []));
})

test("parses a function declaration with return type and parameters", () => {
  const program = `func test(a, b number, c string) number {}`;
  const ast = getFirstItemFromProgram(program);
  expect(ast).toEqual(new go_ast.FunctionNode(
    new go_ast.Identifier("test"), 
    [
      new go_ast.Identifier("a", new go_ast.BasicTypeClass("number")),
      new go_ast.Identifier("b", new go_ast.BasicTypeClass("number")),
      new go_ast.Identifier("c", new go_ast.BasicTypeClass("string"))
    ], 
    new go_ast.BasicTypeClass("number"), 
    []));
})