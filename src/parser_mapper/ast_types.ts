// Base type definitions
export type NodeType = "program" | "identifier" | "literal" | "application" | "declaration" | "unop" | "binop" | "expressionStatement" | "returnStatement" | "assignmentStatement" | "ifStatement" | "forStatement" | "indexAccess" | "sendStatement" | "goStatement" | "function" | "type" | "structElement" | "structLiteral" | "structFieldInstantiation" | "structAccess" | "typeDeclaration" | "receiveExpression" | "selectStatement" | "selectCase" | "defaultCase" | "emptyStatement";
export type DeclarationType = "variable" | "constant";
export type OpCode = string; // Define as needed
export type BasicType = "number" | "bool" | "string" | "Type";

// Base class for all AST nodes
export abstract class GoNode {
  constructor(public type: NodeType) {}
}

// Specific AST Node classes
export class Program extends GoNode {
  constructor(public top_declarations: (Declaration | FunctionNode | TypeDeclaration)[]) {
    super("program");
  }
}

export class Identifier extends GoNode {
  constructor(public name: string, public val_type: Type | null = null) {
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
  constructor(public ids: (Identifier | IndexAccess)[], public vals: GoNode[]) {
    super("assignmentStatement");
  }
}

export class IfStatement extends GoNode {
  constructor(public cond: GoNode, public cons: GoNode[], public alt: GoNode[] | null, public short: GoNode | null) {
    super("ifStatement");
  }
}

export class ForStatement extends GoNode {
  constructor(public init: GoNode | null, public cond: GoNode | null, public post: GoNode | null, public body: GoNode[]) {
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
  constructor(public chan: GoNode, public val: GoNode, public inSelect: boolean) {
    super("sendStatement");
  }
}

export class ReceiveExpression extends GoNode {
  constructor(public chan: GoNode, public inSelect: boolean) {
    super("receiveExpression");
  }
}

export class IndexAccess extends GoNode {
  constructor(public accessed: GoNode, public index: GoNode) {
    super("indexAccess");
  }
}

export class FunctionNode extends GoNode {
  constructor(public name: Identifier | null, public formals: Identifier[], public retType: Type | null, public body: GoNode[]) {
    super("function");
  }
}

export class EmptyStatement extends GoNode {
  constructor() {
    super("emptyStatement");
  }
}

// Type classes
export abstract class Type {
  type: string;
  type_type: string;

  constructor(type_type: string) {
    this.type = 'type';
    this.type_type = type_type;
  }

  abstract isSameType(type: Type): boolean;

  getTypeName(): string {
    return this.type_type;
  }
}

export class BasicTypeClass extends Type {
  constructor(public type_value: BasicType) {
    super('basic')
  }

  isSameType(type: Type) {
    if (type.type_type == 'basic') {
      return this.type_value == (type as BasicTypeClass).type_value;
    }
    return false;
  }

  getTypeName(): string {
    return this.type_value;
  }
}

export class TupleType extends Type {
  constructor(public type_values: Type[]) {
    super('tuple');
  }
  
  isSameType(type: Type) {
    if (type.type_type == 'tuple') {
      let isSame = true;
      this.type_values.forEach((type_value, index) => {
        isSame = isSame && type_value.isSameType((type as TupleType).type_values[index]);
      });
      return isSame;
    }
    return false;
  }
}

export class FunctionType extends Type {
  constructor(public formal_values: Type[], public return_value: Type | undefined) {
    super('function');
  }
  
  // TODO: Make this more specific
  isSameType(type: Type) {
    return type.type_type == 'function'
  }
}

export class ChanType extends Type {
  constructor(public send_receive_type: string, public chan_value_type: Type) {
    super('chan');
  }

  // TODO: Make this more specific
  isSameType(type: Type) {
    return type.type_type == 'chan';
  }
}

export class ArrayType extends Type {
  constructor(public arr_type: Type, public size: number) {
    super('array');
  }

  // TODO: Make this more specific
  isSameType(type: Type): boolean {
    return type.type_type == 'array';
  }
}

export class SliceType extends Type {
  constructor(public slice_type: Type) {
    super('slice');
  }
  
  // TODO: Make this more specific
  isSameType(type: Type): boolean {
    return type.type_type == 'slice';
  }
}

export class CustomType extends Type {
  constructor(public type_name: string) {
    super('custom')
  }

  // TODO: Make this more specific
  isSameType(type: Type): boolean {
    return type.type_type == 'custom';
  }
}

export class StructType extends Type {
  constructor(public elems: StructElement[]) {
    super('struct');
  }

  // TODO: Make this more specific
  isSameType(type: Type): boolean {
    return type.type_type == 'struct';
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
  constructor(public name: CustomType, public dec_type: Type) {
    super("typeDeclaration");
  }
}