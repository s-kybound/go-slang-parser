import { parse as raw_parse } from "./raw_parser/go_parser";
import * as go_ast from "./parser_mapper/ast_types";
import { convert, verifyNode } from "./parser_mapper/raw_to_typed_mapper";

// given a program string, parse it into a typed AST.
export function parse(raw: string): go_ast.GoNode {
  const raw_ast = raw_parse(raw);
  verifyNode(raw_ast);
  // if the above line doesn't throw, we can safely cast the AST
  // to the typed version.
  const final_ast = convert(raw_ast);
  if (final_ast.type !== "program") {
    throw new Error("Expected a program node");
  }
  return convert(raw_ast) as go_ast.Program;
}
