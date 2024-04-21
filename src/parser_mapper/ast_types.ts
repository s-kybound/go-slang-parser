// Base type definitions
export type NodeType =
  | "program"
  | "identifier"
  | "literal"
  | "application"
  | "declaration"
  | "unop"
  | "binop"
  | "expressionStatement"
  | "returnStatement"
  | "assignmentStatement"
  | "ifStatement"
  | "forStatement"
  | "indexAccess"
  | "sendStatement"
  | "goStatement"
  | "function"
  | "type"
  | "structElement"
  | "structLiteral"
  | "structFieldInstantiation"
  | "structAccess"
  | "typeDeclaration"
  | "receiveExpression"
  | "selectStatement"
  | "selectCase"
  | "defaultCase"
  | "emptyStatement";
export type DeclarationType = "var" | "const";
export type OpCode = string; // Define as needed
export type BasicType = "number" | "bool" | "string" | "Type";

// Base class for all AST nodes
export abstract class GoNode {
  constructor(public type: NodeType) {}
  equals(other: GoNode): boolean {
    return JSON.stringify(this) === JSON.stringify(other);
  }
}

// Specific AST Node classes
export class Program extends GoNode {
  constructor(
    public top_declarations: (Declaration | FunctionNode | TypeDeclaration)[],
  ) {
    super("program");
  }
}

export class Identifier extends GoNode {
  constructor(
    public name: string,
    public val_type: Type | null = null,
  ) {
    super("identifier");
  }
}

export class Literal extends GoNode {
  constructor(
    public value: any,
    public val_type: Type,
  ) {
    super("literal");
  }
}

export class Application extends GoNode {
  constructor(
    public operator: GoNode,
    public operands: GoNode[],
  ) {
    super("application");
  }
}

export class Declaration extends GoNode {
  constructor(
    public declaration_type: DeclarationType,
    public ids: Identifier[],
    public vals: GoNode[],
  ) {
    super("declaration");
  }
}

export class UnOp extends GoNode {
  constructor(
    public opcode: OpCode,
    public expr: GoNode,
  ) {
    super("unop");
  }
}

export class BinOp extends GoNode {
  constructor(
    public left: GoNode,
    public opcode: OpCode,
    public right: GoNode,
  ) {
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
  constructor(
    public ids: (Identifier | IndexAccess)[],
    public vals: GoNode[],
  ) {
    super("assignmentStatement");
  }
}

export class IfStatement extends GoNode {
  constructor(
    public cond: GoNode,
    public cons: GoNode[],
    public alt: GoNode[] | null,
    public short: GoNode | null,
  ) {
    super("ifStatement");
  }
}

export class ForStatement extends GoNode {
  constructor(
    public init: GoNode | null,
    public cond: GoNode | null,
    public post: GoNode | null,
    public body: GoNode[],
  ) {
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
  constructor(
    public statement: GoNode,
    public body: GoNode[],
  ) {
    super("selectCase");
  }
}

export class DefaultCase extends GoNode {
  constructor(public body: GoNode[]) {
    super("defaultCase");
  }
}

export class SendStatement extends GoNode {
  constructor(
    public chan: GoNode,
    public val: GoNode,
    public inSelect: boolean,
  ) {
    super("sendStatement");
  }
}

export class ReceiveExpression extends GoNode {
  constructor(
    public chan: GoNode,
    public inSelect: boolean,
  ) {
    super("receiveExpression");
  }
}

export class IndexAccess extends GoNode {
  constructor(
    public accessed: GoNode,
    public index: GoNode,
  ) {
    super("indexAccess");
  }
}

export class FunctionNode extends GoNode {
  constructor(
    public name: Identifier | null,
    public formals: Identifier[],
    public retType: Type | null,
    public body: GoNode[],
  ) {
    super("function");
  }
}

export class EmptyStatement extends GoNode {
  constructor() {
    super("emptyStatement");
  }
}

// Type classes
export class Type extends GoNode {
  constructor(public type_type: string) {
    super("type");
  }
  equals(other: GoNode): boolean {
    if (!(other instanceof Type)) {
      return false;
    }
    if (this instanceof AnyType) {
      return true;
    }
    if (other instanceof AnyType) {
      return true;
    }
    return super.equals(other);
  }
}

export class AnyType extends Type {
  constructor() {
    super("any");
  }
}

export class VoidType extends Type {
  constructor() {
    super("void");
  }
}

export class BasicTypeClass extends Type {
  constructor(public type_value: BasicType) {
    super("basic");
  }
}

export class TupleType extends Type {
  equals(other: GoNode): boolean {
    if (!(other instanceof TupleType)) {
      return super.equals(other);
    }
    if (this.type_values.length !== other.type_values.length) {
      return false;
    }
    for (let i = 0; i < this.type_values.length; i++) {
      if (!this.type_values[i].equals(other.type_values[i])) {
        return false;
      }
    }
    return true;
  }
  constructor(public type_values: Type[]) {
    super("tuple");
  }
}

export class FunctionType extends Type {
  equals(other: GoNode): boolean {
    if (!(other instanceof FunctionType)) {
      return super.equals(other);
    }
    return this.formal_value.equals(other.formal_value) && this.return_value.equals(other.return_value);
  }
  constructor(
    // for ease of use, we use TupleType to represent the formals
    // when there are more than one.
    // ^ i regret this decision deeply.
    public formal_value: Type,
    // if multiple return values are also used, we use TupleType to represent them too
    public return_value: Type,
  ) {
    super("function");
  }
}

export class ChanType extends Type {
  equals(other: GoNode): boolean {
    if (!(other instanceof ChanType)) {
      return super.equals(other)
    }
    if (this.send_receive_type === "send" && other.send_receive_type === "receive") {
      return false
    } 
    if (other.send_receive_type === "send" && this.send_receive_type === "receive") {
      return false
    }
    return this.chan_value_type.equals(other.chan_value_type)
  }
  constructor(
    public send_receive_type: string,
    public chan_value_type: Type,
  ) {
    super("chan");
  }
}

export class ArrayType extends Type {
  equals(other: GoNode) {
    if (!(other instanceof ArrayType)) {
      return super.equals(other)
    }
    return (this.size === other.size) && this.arr_type.equals(other.arr_type)
  }
  constructor(
    public arr_type: Type,
    public size: number,
  ) {
    super("array");
  }
}

export class SliceType extends Type {
  equals(other: GoNode) {
    if (!(other instanceof SliceType)) {
      return super.equals(other)
    }
    return this.slice_type.equals(other.slice_type)
  }
  constructor(public slice_type: Type) {
    super("slice");
  }
}

export class CustomType extends Type {
  constructor(public type_name: string) {
    super("custom");
  }
}

export class StructType extends Type {
  constructor(public elems: StructElement[]) {
    super("struct");
  }
}

export class StructElement extends GoNode {
  constructor(public name: Identifier) {
    super("structElement");
  }
}

export class StructFieldInstantiation extends GoNode {
  constructor(
    public field: Identifier,
    public expr: GoNode,
  ) {
    super("structFieldInstantiation");
  }
}

export class StructLiteral extends GoNode {
  constructor(
    public val_type: Type,
    public fields: StructFieldInstantiation[],
  ) {
    super("structLiteral");
  }
}

export class StructAccess extends GoNode {
  constructor(
    public accessed: GoNode,
    public field: Identifier,
  ) {
    super("structAccess");
  }
}

export class TypeDeclaration extends GoNode {
  constructor(
    public name: CustomType,
    public dec_type: Type,
  ) {
    super("typeDeclaration");
  }
}
