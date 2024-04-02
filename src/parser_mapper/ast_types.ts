// Base type definitions
export type NodeType = "program" | "identifier" | "literal" | "application" | "declaration" | "unop" | "binop" | "expressionStatement" | "returnStatement" | "assignmentStatement" | "ifStatement" | "forStatement" | "goStatement" | "function" | "type";
export type DeclarationType = "variable" | "constant";
export type OpCode = string; // Define as needed
export type BasicType = "number" | "bool" | "string";

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
  constructor(public cond: GoNode, public cons: GoNode[], public alt: GoNode[] | null, public short: boolean) {
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

export class FunctionNode extends GoNode {
  constructor(public name: Identifier, public formals: Identifier[], public retType: Type, public body: GoNode[]) {
    super("function");
  }
}

// Type classes
export class Type {
  constructor(public type: "type", public type_details: any) {}
}

export class BasicTypeClass extends Type {
  constructor(public type_value: BasicType) {
    super("type", { type_type: "basic", type_value });
  }
}

export class TupleType extends Type {
  constructor(public type_values: Type[]) {
    super("type", { type_type: "tuple", type_values });
  }
}

export class FunctionType extends Type {
  constructor(public formal_values: Type[], public return_value: Type) {
    super("type", { type_type: "function", formal_values, return_value });
  }
}