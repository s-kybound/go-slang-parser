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
  IndexAccess,
  SendStatement,
  ReceiveExpression,
  StructElement,
  StructFieldInstantiation,
  StructLiteral,
  StructAccess,
  BasicTypeClass,
  TupleType,
  FunctionType,
  ChanType,
  SliceType,
  ArrayType,
  CustomType,
  StructType,
  TypeDeclaration,
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

// Type guard for IndexAccess
function isIndexAccess(node: any): node is IndexAccess {
  return node?.type === "indexAccess";
}

// Type guard for SendStatement
function isSendStatement(node: any): node is SendStatement {
  return node?.type === "sendStatement";
}

// Type guard for ReceiveExpression
function isReceiveExpression(node: any): node is ReceiveExpression {
  return node?.type === "receiveExpression";
}

// Type guard for StructElement
function isStructElement(node: any): node is StructElement {
  return node?.type === "structElement";
}

// Type guard for StructFieldInstantiation
function isStructFieldInstantiation(node: any): node is StructFieldInstantiation {
  return node?.type === "structFieldInstantiation";
}

// Type guard for StructLiteral
function isStructLiteral(node: any): node is StructLiteral {
  return node?.type === "structLiteral";
}

// Type guard for StructAccess
function isStructAccess(node: any): node is StructAccess {
  return node?.type === "structAccess";
}

function isBasicTypeClass(node: any): node is BasicTypeClass {
  return node?.type === "type" && node?.type_type === "basic";
}

function isTupleType(node: any): node is TupleType {
  return node?.type === "type" && node?.type_type === "tuple";
}

function isFunctionType(node: any): node is FunctionType {
  return node?.type === "type" && node?.type_type === "function";
}

function isChanType(node: any): node is ChanType {
  return node?.type === "type" && node?.type_type === "chan";
}

function isSliceType(node: any): node is SliceType {
  return node?.type === "type" && node?.type_type === "slice";
}

function isArrayType(node: any): node is ArrayType {
  return node?.type === "type" && node?.type_type === "array";
}

function isCustomType(node: any): node is CustomType {
  return node?.type === "type" && node?.type_type === "custom";
}

function isStructType(node: any): node is StructType {
  return node?.type === "type" && node?.type_type === "struct";
}

function isTypeDeclaration(node: any): node is TypeDeclaration {
  return node?.type === "typeDeclaration";
}

// with the above typeguards, we type up the untyped
// AST of the parser output.
// currently ignores types.
export function verifyNode(ast: any) {
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
  } else if (isIndexAccess(ast)) {
    verifyNode(ast.accessed)
    verifyNode(ast.index)
  } else if (isSendStatement(ast)) {
    verifyNode(ast.chan)
    verifyNode(ast.value) 
  } else if (isReceiveExpression(ast)) {
    verifyNode(ast.chan)
  } else if (isStructAccess(ast)) {
    verifyNode(ast.accessed)
    verifyNode(ast.field)
  } else if (isStructLiteral(ast)) {
    ast.fields.forEach(verifyNode)
  } else if (isStructFieldInstantiation(ast)) {
    verifyNode(ast.field)
    verifyNode(ast.expr)
  } else if (isStructElement(ast)) {
    verifyNode(ast.name)
  } else if (isBasicTypeClass(ast)) {
    // do nothing
  } else if (isTupleType(ast)) {
    ast.type_values.forEach(verifyNode)
  } else if (isFunctionType(ast)) {
    verifyNode(ast.return_value)
    ast.formal_values.forEach(verifyNode)
  } else if (isChanType(ast)) {
    verifyNode(ast.chan_value_type)
  } else if (isArrayType(ast)) {
    verifyNode(ast.arr_type)
  } else if (isSliceType(ast)) {
    verifyNode(ast.slice_type)
  } else if (isCustomType(ast)) {
    // do nothing
  } else if (isStructType(ast)) {
    ast.elems.forEach(verifyNode)
  } else if (isTypeDeclaration(ast)) {
    verifyNode(ast.name)
    verifyNode(ast.dec_type)
  } else {
    throw new Error(`Unknown node type: ${ast}`);
  }
}