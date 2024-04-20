import { escape } from "querystring";
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
  SelectStatement,
  SelectCase,
  DefaultCase,
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
  EmptyStatement,
  Type,
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
function isStructFieldInstantiation(
  node: any,
): node is StructFieldInstantiation {
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

function isType(node: any): node is Type {
  return node?.type === "type";
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

function isSelectStatement(node: any): node is SelectStatement {
  return node?.type === "selectStatement";
}

function isSelectCase(node: any): node is SelectCase {
  return node?.type === "selectCase";
}

function isDefaultCase(node: any): node is DefaultCase {
  return node?.type === "defaultCase";
}

function isEmptyStatement(node: any): node is EmptyStatement {
  return node?.type === "emptyStatement";
}

// with the above typeguards, we type up the untyped
// AST of the parser output.
// currently ignores types.
export function verifyNode(ast: any) {
  if (isProgram(ast)) {
    // verify that all top declarations are of type Declaration or FunctionNode or TypeDeclaration
    // and if function node, they have names
    ast.top_declarations.forEach(verifyNode);
    ast.top_declarations.forEach((node: any) => {
      if (isFunctionNode(node)) {
        if (!node.name) {
          throw new Error("Function node must have a name");
        }
      } else if (isTypeDeclaration(node)) {
        // do nothing all is good
      } else if (isDeclaration(node)) {
        // do nothing all is good
      } else {
        throw new Error(
          "Top declaration must be either a function node or a declaration",
        );
      }
    });
  } else if (isDeclaration(ast)) {
    ast.ids.forEach(verifyNode);
    ast.ids.forEach((node: any) => {
      if (!isIdentifier(node)) {
        throw new Error("Declared values must be identifiers");
      }
    });
    ast.vals.forEach(verifyNode);
  } else if (isIdentifier(ast)) {
    // do nothing
  } else if (isLiteral(ast)) {
    verifyNode(ast.val_type);
    if (!isType(ast.val_type)) {
      throw new Error("Literal type must be a type");
    }
  } else if (isApplication(ast)) {
    verifyNode(ast.operator);
    ast.operands.forEach(verifyNode);
  } else if (isUnOp(ast)) {
    verifyNode(ast.expr);
  } else if (isBinOp(ast)) {
    verifyNode(ast.left);
    verifyNode(ast.right);
  } else if (isExpressionStatement(ast)) {
    verifyNode(ast.expression);
  } else if (isReturnStatement(ast)) {
    ast.expressions.forEach(verifyNode);
  } else if (isAssignmentStatement(ast)) {
    ast.ids.forEach(verifyNode);
    ast.ids.forEach((node: any) => {
      if (isIdentifier(node)) {
        // do nothing
      } else if (isIndexAccess(node)) {
        // do nothing
      } else {
        throw new Error(
          "Left hand side of assignment must be an identifier or an index access",
        );
      }
    });
    ast.vals.forEach(verifyNode);
  } else if (isIfStatement(ast)) {
    verifyNode(ast.cond);
    ast.cons.forEach(verifyNode);
    if (ast.alt) {
      ast.alt.forEach(verifyNode);
    }
  } else if (isForStatement(ast)) {
    if (ast.init) {
      verifyNode(ast.init);
    }

    if (ast.cond) {
      verifyNode(ast.cond);
    }

    if (ast.post) {
      verifyNode(ast.post);
    }

    ast.body.forEach(verifyNode);
  } else if (isGoStatement(ast)) {
    verifyNode(ast.app);
    if (!isApplication(ast.app)) {
      throw new Error("Go statement must be an application");
    }
  } else if (isFunctionNode(ast)) {
    if (ast.name) {
      verifyNode(ast.name);
      if (!isIdentifier(ast.name)) {
        throw new Error("Function name must be an identifier");
      }
    }
    ast.formals.forEach(verifyNode);
    ast.formals.forEach((node: any) => {
      if (!isIdentifier(node)) {
        throw new Error("Formal parameters must be identifiers");
      }
    });
    ast.body.forEach(verifyNode);
  } else if (isIndexAccess(ast)) {
    verifyNode(ast.accessed);
    verifyNode(ast.index);
  } else if (isSendStatement(ast)) {
    verifyNode(ast.chan);
    verifyNode(ast.val);
  } else if (isReceiveExpression(ast)) {
    verifyNode(ast.chan);
  } else if (isStructAccess(ast)) {
    verifyNode(ast.accessed);
    verifyNode(ast.field);
    if (!isIdentifier(ast.field)) {
      throw new Error("Struct field must be an identifier");
    }
  } else if (isStructLiteral(ast)) {
    ast.fields.forEach(verifyNode);
    ast.fields.forEach((node: any) => {
      if (!isStructFieldInstantiation(node)) {
        throw new Error(
          "Struct field instantiation must be a struct field instantiation",
        );
      }
    });
  } else if (isStructFieldInstantiation(ast)) {
    verifyNode(ast.field);
    if (!isIdentifier(ast.field)) {
      throw new Error("Struct field must be an identifier");
    }
    verifyNode(ast.expr);
  } else if (isStructElement(ast)) {
    verifyNode(ast.name);
    if (!isIdentifier(ast.name)) {
      throw new Error("Struct element must be an identifier");
    }
  } else if (isBasicTypeClass(ast)) {
    // do nothing
  } else if (isTupleType(ast)) {
    ast.type_values.forEach(verifyNode);
  } else if (isFunctionType(ast)) {
    verifyNode(ast.return_value);
    if (!isType(ast.return_value)) {
      throw new Error("Function return value must be a type");
    }
    ast.formal_values.forEach(verifyNode);
    if (ast.formal_values.some((node: any) => !isType(node))) {
      throw new Error("Function formal values must be types");
    }
  } else if (isChanType(ast)) {
    verifyNode(ast.chan_value_type);
    if (!isType(ast.chan_value_type)) {
      throw new Error("Chan value type must be a type");
    }
  } else if (isArrayType(ast)) {
    verifyNode(ast.arr_type);
    if (!isType(ast.arr_type)) {
      throw new Error("Array type must be a type");
    }
  } else if (isSliceType(ast)) {
    verifyNode(ast.slice_type);
    if (!isType(ast.slice_type)) {
      throw new Error("Slice type must be a type");
    }
  } else if (isCustomType(ast)) {
    // do nothing
  } else if (isStructType(ast)) {
    ast.elems.forEach(verifyNode);
    if (ast.elems.some((node: any) => !isStructElement(node))) {
      throw new Error("Struct elements must be struct elements");
    }
  } else if (isTypeDeclaration(ast)) {
    verifyNode(ast.name);
    if (!isCustomType(ast.name)) {
      throw new Error("Type name must be a custom type");
    }
    verifyNode(ast.dec_type);
    if (!isType(ast.dec_type)) {
      throw new Error("Declaration type must be a type");
    }
  } else if (isSelectStatement(ast)) {
    ast.cases.forEach(verifyNode);
    if (
      ast.cases.some(
        (node: any) => !(isSelectCase(node) || isDefaultCase(node)),
      )
    ) {
      throw new Error("Select cases must be select or default cases");
    }
  } else if (isSelectCase(ast)) {
    verifyNode(ast.statement);
    ast.body.forEach(verifyNode);
  } else if (isDefaultCase(ast)) {
    ast.body.forEach(verifyNode);
  } else if (isEmptyStatement(ast)) {
    // do nothing
  } else {
    throw new Error(`Unknown node type: ${ast}`);
  }
}

// convert the interfaces to their actual classes.
// to be done AFTER verification.
export function convert(ast: any): GoNode {
  if (isProgram(ast)) {
    return new Program(
      ast.top_declarations.map(convert) as (
        | Declaration
        | FunctionNode
        | TypeDeclaration
      )[],
    );
  } else if (isDeclaration(ast)) {
    return new Declaration(
      ast.declaration_type,
      ast.ids.map(convert) as Identifier[],
      ast.vals.map(convert) as GoNode[],
    );
  } else if (isIdentifier(ast)) {
    return new Identifier(
      ast.name,
      ast.val_type === null ? null : (convert(ast.val_type) as Type),
    );
  } else if (isLiteral(ast)) {
    return new Literal(ast.value, convert(ast.val_type) as Type);
  } else if (isApplication(ast)) {
    return new Application(convert(ast.operator), ast.operands.map(convert));
  } else if (isUnOp(ast)) {
    return new UnOp(ast.opcode, convert(ast.expr));
  } else if (isBinOp(ast)) {
    return new BinOp(convert(ast.left), ast.opcode, convert(ast.right));
  } else if (isExpressionStatement(ast)) {
    return new ExpressionStatement(convert(ast.expression));
  } else if (isReturnStatement(ast)) {
    return new ReturnStatement(ast.expressions.map(convert));
  } else if (isAssignmentStatement(ast)) {
    return new AssignmentStatement(
      ast.ids.map(convert) as (Identifier | IndexAccess)[],
      ast.vals.map(convert),
    );
  } else if (isIfStatement(ast)) {
    return new IfStatement(
      convert(ast.cond),
      ast.cons.map(convert),
      ast.alt === null ? null : ast.alt.map(convert),
      ast.short === null ? null : convert(ast.short),
    );
  } else if (isForStatement(ast)) {
    return new ForStatement(
      ast.init === null ? null : convert(ast.init),
      ast.cond === null ? null : convert(ast.cond),
      ast.post === null ? null : convert(ast.post),
      ast.body.map(convert),
    );
  } else if (isGoStatement(ast)) {
    return new GoStatement(convert(ast.app) as Application);
  } else if (isFunctionNode(ast)) {
    return new FunctionNode(
      ast.name === null ? null : (convert(ast.name) as Identifier),
      ast.formals.map(convert) as Identifier[],
      ast.retType === null ? null : (convert(ast.retType) as Type),
      ast.body.map(convert),
    );
  } else if (isIndexAccess(ast)) {
    return new IndexAccess(convert(ast.accessed), convert(ast.index));
  } else if (isSendStatement(ast)) {
    return new SendStatement(convert(ast.chan), convert(ast.val), ast.inSelect);
  } else if (isReceiveExpression(ast)) {
    return new ReceiveExpression(convert(ast.chan), ast.inSelect);
  } else if (isStructAccess(ast)) {
    return new StructAccess(
      convert(ast.accessed),
      convert(ast.field) as Identifier,
    );
  } else if (isStructLiteral(ast)) {
    return new StructLiteral(
      convert(ast.val_type) as Type,
      ast.fields.map(convert) as StructFieldInstantiation[],
    );
  } else if (isStructFieldInstantiation(ast)) {
    return new StructFieldInstantiation(
      convert(ast.field) as Identifier,
      convert(ast.expr),
    );
  } else if (isStructElement(ast)) {
    return new StructElement(convert(ast.name) as Identifier);
  } else if (isBasicTypeClass(ast)) {
    return new BasicTypeClass(ast.type_value);
  } else if (isTupleType(ast)) {
    return new TupleType(ast.type_values.map(convert) as Type[]);
  } else if (isFunctionType(ast)) {
    return new FunctionType(
      ast.formal_values.map(convert) as Type[],
      convert(ast.return_value) as Type,
    );
  } else if (isChanType(ast)) {
    return new ChanType(
      ast.send_receive_type,
      convert(ast.chan_value_type) as Type,
    );
  } else if (isArrayType(ast)) {
    return new ArrayType(convert(ast.arr_type) as Type, ast.size);
  } else if (isSliceType(ast)) {
    return new SliceType(convert(ast.slice_type) as Type);
  } else if (isCustomType(ast)) {
    return new CustomType(ast.type_name);
  } else if (isStructType(ast)) {
    return new StructType(ast.elems.map(convert) as StructElement[]);
  } else if (isTypeDeclaration(ast)) {
    return new TypeDeclaration(
      convert(ast.name) as CustomType,
      convert(ast.dec_type) as Type,
    );
  } else if (isSelectStatement(ast)) {
    return new SelectStatement(
      ast.cases.map(convert) as (SelectCase | DefaultCase)[],
    );
  } else if (isSelectCase(ast)) {
    return new SelectCase(convert(ast.statement), ast.body.map(convert));
  } else if (isDefaultCase(ast)) {
    return new DefaultCase(ast.body.map(convert));
  } else if (isEmptyStatement(ast)) {
    return new EmptyStatement();
  } else {
    throw new Error(`Unknown node type: ${ast}`);
  }
}
