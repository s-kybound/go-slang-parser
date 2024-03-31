import { parse as raw_parse } from './raw_parser/go_parser';
import * as go_ast from './parser_mapper/ast_types';
import { verifyNode } from './parser_mapper/raw_to_typed_mapper';

export function parse(raw: string): go_ast.GoNode {
  const raw_ast = raw_parse(raw);
  verifyNode(raw_ast);
  // if the above line doesn't throw, we can safely cast the AST
  // to the typed version.
  return raw_ast as go_ast.GoNode;
}