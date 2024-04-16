// Base type definitions
export type NodeType = "program" | "identifier" | "literal" | "application" | "declaration" | "unop" | "binop" | "expressionStatement" | "returnStatement" | "assignmentStatement" | "ifStatement" | "forStatement" | "indexAccess" | "sendStatement" | "goStatement" | "function" | "type" | "structElement" | "structLiteral" | "structFieldInstantiation" | "structAccess" | "typeDeclaration" | "receiveExpression" | "selectStatement" | "selectCase" | "defaultCase";
export type DeclarationType = "variable" | "constant";
export type OpCode = string; // Define as needed
export type BasicType = "number" | "bool" | "string" | "Type";

// Base class for all AST nodes
export abstract class GoNode {
  constructor(public type: NodeType) {}
}

// Specific AST Node classes
export class Program extends GoNode {
  constructor(public top_declarations: Declaration[]) {
    super("program");
  }
}

export class Identifier extends GoNode {
  val_type: Type | undefined;
  constructor(public name: string) {
    super("identifier");
  }
}

export class Literal extends GoNode {
  constructor(public value: any, public val_type: Type) {
    super("literal");
  }
}

export class Application extends GoNode {
  constructor(public operator: GoNode, public operands: GoNode[]) {
    super("application");
  }
}

export class Declaration extends GoNode {
  constructor(public declaration_type: DeclarationType, public ids: Identifier[], public vals: GoNode[]) {
    super("declaration");
  }
}

export class UnOp extends GoNode {
  constructor(public opcode: OpCode, public expr: GoNode) {
    super("unop");
  }
}

export class BinOp extends GoNode {
  constructor(public left: GoNode, public opcode: OpCode, public right: GoNode) {
    super("binop");
  }
}

export class ExpressionStatement extends GoNode {
  constructor(public expression: GoNode) {
    super("expressionStatement");
  }
}

export class ReturnStatement extends GoNode {
  constructor(public expressions: GoNode[]) {
    super("returnStatement");
  }
}

export class AssignmentStatement extends GoNode {
  constructor(public ids: Identifier[], public vals: GoNode[]) {
    super("assignmentStatement");
  }
}

export class IfStatement extends GoNode {
  constructor(public cond: GoNode, public cons: GoNode[], public alt: GoNode[] | null, public short: GoNode | null) {
    super("ifStatement");
  }
}

export class ForStatement extends GoNode {
  constructor(public init: GoNode, public cond: GoNode, public post: GoNode, public body: GoNode[]) {
    super("forStatement");
  }
}

export class GoStatement extends GoNode {
  constructor(public app: Application) {
    super("goStatement");
  }
}

export class SelectStatement extends GoNode {
  constructor(public cases: (SelectCase | DefaultCase)[]) {
    super("selectStatement");
  }
}

export class SelectCase extends GoNode {
  constructor(public statement: GoNode, public body: GoNode[]) {
    super("selectCase");
  }
}

export class DefaultCase extends GoNode {
  constructor(public body: GoNode[]) {
    super("defaultCase");
  }
}

export class SendStatement extends GoNode {
  constructor(public chan: GoNode, public value: GoNode) {
    super("sendStatement");
  }
}

export class ReceiveExpression extends GoNode {
  constructor(public chan: GoNode) {
    super("receiveExpression");
  }
}

export class IndexAccess extends GoNode {
  constructor(public accessed: GoNode, public index: GoNode) {
    super("indexAccess");
  }
}

export class FunctionNode extends GoNode {
  constructor(public name: Identifier, public formals: Identifier[], public retType: Type, public body: GoNode[]) {
    super("function");
  }
}

// Type classes
export interface Type {
  type: "type";
  type_type: string;

  isSameType(type: Type): boolean;
}

export class BasicTypeClass implements Type {
  type: "type";
  type_type: "basic";
  constructor(public type_value: BasicType) {}

  isSameType(type: Type) {
    if (type instanceof BasicTypeClass) {
      return this.type_value == type.type_value;
    }
    return false;
  }
}

export class TupleType implements Type {
  type: "type";
  type_type: "tuple";
  constructor(public type_values: Type[]) {}
  
  isSameType(type: Type) {
    if (type instanceof TupleType) {
      let isSame = true;
      this.type_values.forEach((type_value, index) => {
        isSame = isSame && (type.type_values[index] == type_value);
      });
      return isSame;
    }
    return false;
  }
}

export class FunctionType implements Type {
  type: "type";
  type_type: "function";
  constructor(public formal_values: Type[], public return_value: Type) {}
  
  // TODO: Make this more specific
  isSameType(type: Type) {
    return (type instanceof FunctionType);
  }
}

export class ChanType implements Type {
  type: "type";
  type_type: "chan";
  constructor(public send_receive_type: string, public chan_value_type: Type) {}

  // TODO: Make this more specific
  isSameType(type: Type) {
    return (type instanceof ChanType);
  }
}

export class ArrayType implements Type {
  type: "type";
  type_type: "array";
  constructor(public arr_type: Type, public size: number) {}

  // TODO: Make this more specific
  isSameType(type: Type): boolean {
    return (type instanceof ArrayType);
  }
}

export class SliceType implements Type {
  type: "type";
  type_type: "slice";
  constructor(public slice_type: Type) {}
  
  // TODO: Make this more specific
  isSameType(type: Type): boolean {
    return (type instanceof SliceType);
  }
}

export class CustomType implements Type {
  type: "type";
  type_type: "custom";
  constructor(public type_name: string) {}

  // TODO: Make this more specific
  isSameType(type: Type): boolean {
    return (type instanceof CustomType);
  }
}

export class StructType implements Type {
  type: "type";
  type_type: "struct";
  constructor(public elems: StructElement[]) {}

  // TODO: Make this more specific
  isSameType(type: Type): boolean {
    return (type instanceof StructType);
  }
}

export class StructElement extends GoNode {
  constructor(public name: Identifier) {
    super("structElement");
  }
}

export class StructFieldInstantiation extends GoNode {
  constructor(public field: Identifier, public expr: GoNode) {
    super("structFieldInstantiation");
  }
}

export class StructLiteral extends GoNode {
  constructor(public val_type: Type, public fields: StructFieldInstantiation[]) {
    super("structLiteral");
  }
}

export class StructAccess extends GoNode {
  constructor(public accessed: GoNode, public field: Identifier) {
    super("structAccess");
  }
}

export class TypeDeclaration extends GoNode {
  constructor(public name: Identifier, public dec_type: Type) {
    super("typeDeclaration");
  }
}