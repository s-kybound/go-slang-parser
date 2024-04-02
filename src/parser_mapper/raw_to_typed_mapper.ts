import {
  Program,
  Identifier,
  Literal,
  Application,
  Declaration,
  UnOp,
  BinOp,
  ExpressionStatement,
  ReturnStatement,
  AssignmentStatement,
  IfStatement,
  ForStatement,
  GoStatement,
  FunctionNode,
  GoNode,
} from "./ast_types";

// Type guard for Program
function isProgram(node: any): node is Program {
  return node?.type === "program";
}

// Type guard for Identifier
function isIdentifier(node: any): node is Identifier {
  return node?.type === "identifier";
}

// Type guard for Literal
function isLiteral(node: any): node is Literal {
  return node?.type === "literal";
}

// Type guard for Application
function isApplication(node: any): node is Application {
  return node?.type === "application";
}

// Type guard for Declaration
function isDeclaration(node: any): node is Declaration {
  return node?.type === "declaration";
}

// Type guard for UnOp
function isUnOp(node: any): node is UnOp {
  return node?.type === "unop";
}

// Type guard for BinOp
function isBinOp(node: any): node is BinOp {
  return node?.type === "binop";
}

// Type guard for ExpressionStatement
function isExpressionStatement(node: any): node is ExpressionStatement {
  return node?.type === "expressionStatement";
}

// Type guard for ReturnStatement
function isReturnStatement(node: any): node is ReturnStatement {
  return node?.type === "returnStatement";
}

// Type guard for AssignmentStatement
function isAssignmentStatement(node: any): node is AssignmentStatement {
  return node?.type === "assignmentStatement";
}

// Type guard for IfStatement
function isIfStatement(node: any): node is IfStatement {
  return node?.type === "ifStatement";
}

// Type guard for ForStatement
function isForStatement(node: any): node is ForStatement {
  return node?.type === "forStatement";
}

// Type guard for GoStatement
function isGoStatement(node: any): node is GoStatement {
  return node?.type === "goStatement";
}

// Type guard for FunctionNode
function isFunctionNode(node: any): node is FunctionNode {
  return node?.type === "function";
}

// with the above typeguards, we type up the untyped
// AST of the parser output.
// currently ignores types.
export function verifyNode(ast: any) {
  //console.log(ast);
  if (isProgram(ast)) {
    ast.top_declarations.forEach(verifyNode);
  } else if (isDeclaration(ast)) {
    ast.ids.forEach(verifyNode);
    ast.vals.forEach(verifyNode);
  } else if (isIdentifier(ast)) {
    // do nothing
  } else if (isLiteral(ast)) {
    // do nothing
  } else if (isApplication(ast)) {
    verifyNode(ast.operator)
    ast.operands.forEach(verifyNode)
  } else if (isUnOp(ast)) {
    verifyNode(ast.expr)
  } else if (isBinOp(ast)) {
    verifyNode(ast.left)
    verifyNode(ast.right)
  } else if (isExpressionStatement(ast)) {
    verifyNode(ast.expression)
  } else if (isReturnStatement(ast)) {
    ast.expressions.forEach(verifyNode)
  } else if (isAssignmentStatement(ast)) {
    ast.ids.forEach(verifyNode)
    ast.vals.forEach(verifyNode)
  } else if (isIfStatement(ast)) {
    verifyNode(ast.cond)
    ast.cons.forEach(verifyNode)
    if (ast.alt) {
      ast.alt.forEach(verifyNode)
    }
  } else if (isForStatement(ast)) {
    if (ast.init) {
      verifyNode(ast.init)
    }

    if (ast.cond) {
      verifyNode(ast.cond)
    }

    if (ast.post) {
      verifyNode(ast.post)
    }

    ast.body.forEach(verifyNode)
  } else if (isGoStatement(ast)) {
    verifyNode(ast.app)
  } else if (isFunctionNode(ast)) {
    verifyNode(ast.name)
    ast.formals.forEach(verifyNode)
    ast.body.forEach(verifyNode)
  } else if (ast?.type === "type") {
    // do nothing
  } else {
    throw new Error(`Unknown node type: ${ast}`);
  }
}