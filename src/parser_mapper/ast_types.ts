// Base type definitions
type NodeType = "program" | "identifier" | "literal" | "application" | "declaration" | "unop" | "binop" | "expressionStatement" | "returnStatement" | "assignmentStatement" | "ifStatement" | "forStatement" | "goStatement" | "function" | "type";
type DeclarationType = "variable" | "constant";
type OpCode = string; // Define as needed
type BasicType = "number" | "bool" | "string";

// Base class for all AST nodes
abstract class GoNode {
  constructor(public type: NodeType) {}
}

// Specific AST Node classes
class Program extends GoNode {
  constructor(public top_declarations: Declaration[]) {
    super("program");
  }
}

class Identifier extends GoNode {
  val_type: Type | undefined;
  constructor(public name: string) {
    super("identifier");
  }
}

class Literal<T> extends GoNode {
  constructor(public value: T, public val_type: Type) {
    super("literal");
  }
}

class Application extends GoNode {
  constructor(public operator: GoNode, public operands: GoNode[]) {
    super("application");
  }
}

class Declaration extends GoNode {
  constructor(public declaration_type: DeclarationType, public ids: Identifier[], public vals: GoNode[]) {
    super("declaration");
  }
}

class UnOp extends GoNode {
  constructor(public opcode: OpCode, public expr: GoNode) {
    super("unop");
  }
}

class BinOp extends GoNode {
  constructor(public left: GoNode, public opcode: OpCode, public right: GoNode) {
    super("binop");
  }
}

class ExpressionStatement extends GoNode {
  constructor(public expression: GoNode) {
    super("expressionStatement");
  }
}

class ReturnStatement extends GoNode {
  constructor(public expressions: GoNode[]) {
    super("returnStatement");
  }
}

class AssignmentStatement extends GoNode {
  constructor(public ids: Identifier[], public vals: GoNode[]) {
    super("assignmentStatement");
  }
}

class IfStatement extends GoNode {
  constructor(public cond: GoNode, public cons: GoNode[], public alt: GoNode[] | null, public short: boolean) {
    super("ifStatement");
  }
}

class ForStatement extends GoNode {
  constructor(public init: GoNode, public cond: GoNode, public post: GoNode, public body: GoNode[]) {
    super("forStatement");
  }
}

class GoStatement extends GoNode {
  constructor(public app: Application) {
    super("goStatement");
  }
}

class FunctionNode extends GoNode {
  constructor(public name: Identifier, public formals: Identifier[], public retType: Type, public body: GoNode[]) {
    super("function");
  }
}

// Type classes
class Type {
  constructor(public type: "type", public type_details: any) {}
}

class BasicTypeClass extends Type {
  constructor(public type_value: BasicType) {
    super("type", { type_type: "basic", type_value });
  }
}

class TupleType extends Type {
  constructor(public type_values: Type[]) {
    super("type", { type_type: "tuple", type_values });
  }
}

class FunctionType extends Type {
  constructor(public formal_values: Type[], public return_value: Type) {
    super("type", { type_type: "function", formal_values, return_value });
  }
}