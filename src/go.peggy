{{
  function makeProgram(declaration_list, function_list) {
  	return {
      type: "program",
      top_declarations: declaration_list
    }
  }

  function makeIdentifier(id) {
    return {
      type: "identifier",
      name: id,
      val_type: undefined
    }
  }

  function makeLiteral(lit) {
    return {
      type: "literal",
      value: lit,
      val_type: typeof lit
    }
  }

  function makeInteger(i) {
    return parseInt(i.join(""), 10);
  }

  function makeString(s) {
    return s;
  }

  function makeBoolean(b) {
    return b === "true";
  }
  
  function makeApplication(operand, operators) {
  	return {
      type: "application",
      operand: operand,
      operators: operators,
    }
  }
  
  function makeDeclaration(id, val, decType) {
          return {
      type: "declaration",
      declaration_type: decType,
      id: id,
      val: val
    };
  }
  
  function makeDeclarations(id_list, val_list, decType, infer) {
    if (val_list === null && !infer) {
      const dec_list = [];
      for (let i = 0; i < id_list.length; i++) {
        dec_list[i] = makeDeclaration(id_list[i], getDefault(id_list.val_type), decType);
      }
      return dec_list
    }
    if (id_list.length !== val_list.length) {
            throw new Error("identifier list length must be equal to value list!");
    }
    
    if (infer) {
            for (let i = 0; i < id_list.length; i++) {
                    id_list[i].val_type = val_list[i].val_type;
            }
    }
    
    const dec_list = [];
                for (let i = 0; i < id_list.length; i++) {
                    dec_list[i] = makeDeclaration(id_list[i], val_list[i], decType)
            }
    return dec_list
  }
  
  function getDefault(type) {
          switch (type) {
            case "number": return 0;
            case "bool": return false;
            case "string": return "";
    }
  }

  function makeUnop(opcode, expr) {
    return {
      type: "unop",
      opcode: opcode,
      expr: expr
    }
  }

  function makeBinop(left, opcode, right) {
    return {
      type: "binop",
      left: left,
      opcode: opcode,
      right: right
    }
  }

  function makeExpressionStatement(expression) {
    return {
      type: "expressionStatement",
      expression: expression
    }
  }

  function makeReturnStatement(expression) {
    return {
      type: "returnStatement",
      expression: expression
    }
  }

  function makeFunction(name, formals, retType, body) {
    return {
      type: "function",
      name: name,
      formals: formals,
      retType: retType,
      body: body
    }
  }
}}

// LIMITATIONS: This is a very simple parser for go.
// we will ignore all package and import syntax, we assume a single file.
// we simplify the types given, following javascript - number, bool, string.
// we force the use of semicolons at the end of each statement.
// both const and var force the inclusion of types.
// naked returns are not supported.

// the top-level rule, expecting at least one function.

start
  = top_level_decs: (declaration / function)+ {
  	return makeProgram(top_level_decs.flat()); 
  }

declaration
  = _ dec:standardDeclaration _ ";" _ {return dec;}
  / _ dec:inferredTypeDeclaration _ ";" _ {return dec;}

standardDeclaration
  = _ decType:declarationType spc declarations:declarationList _ {
  	declarations.forEach(dec => dec.declaration_type = decType);
          return declarations
  }

declarationType
  = "var" / "const"

declarationList
  = groupedDeclarationList
  / standardDeclarationList
  
groupedDeclarationList
  = _ "(" _ lists:standardDeclarationList* _ ")" _ {
          return lists.flat();
  }

standardDeclarationList
  = _ identifiers:typedIdentifierList _ vals:(_ "=" _ @valueList)? _ {
    return makeDeclarations(identifiers, vals, "placeholder", false);
  }

inferredTypeDeclaration
  = _ identifiers: identifierList _ ":=" _ vals: valueList _ {  
          return makeDeclarations(identifiers, vals, "var", true);
  }

typedIdentifierList
  = idList: identifierList spc type:Type {idList.forEach(id => {id.val_type = type}); return idList; }
 
identifierList
  = head:Identifier tail:(_ "," _ @Identifier)*  {return [head, ...tail]}

valueList
  = head:expression tail:(_ "," _ @expression)* {return [head, ...tail]}

function
  = _ "func" spc name:Identifier _ "(" _ formals:formalsList? _ ")" _ retType:Type? _ "{" _ body:statement* _ "}" { 
    return makeFunction(name, formals ? formals : [], retType, body);
  }

formalsList
  = identifierList spc type:Type (_ "," _ identifierList spc Type)*

Identifier
  = !GoKeyword !Type head:[a-zA-Z_] tail:[a-zA-Z0-9_]* { 
    return makeIdentifier(head + tail.join("")); 
  }

GoKeyword "reserved syntax keyword"
  = "break" / "case" / "chan" / "const" / "continue" / "default" / "defer" / "else"
    / "fallthrough" / "for" / "func" / "go" / "goto" / "if" / "import" / "interface"
    / "map" / "package" / "range" / "return" / "select" / "struct" / "switch" / "type" / "var"

Type "go type"
  = BasicType / FunctionType
  
BasicType
  = "number" / "bool" / "string" {
    return {type_type: "basic", name: text()}
  }

TupleType
  = _ "(" _ types:TypeList _ ")" _ { return {type_type: "tuple", types: types} };

TypeList
  = _ head:Type tail:(_ "," _ @Type)* _ { return [head, ...tail] }

FunctionType
  = _ "func" typeGroup:TupleType _ ret:Type? _ { return {type_type: "function", formals: typeGroup, ret: ret} }

number
  = n:[0-9]+ { return makeInteger(n); }

bool
  = b:("true" / "false") { return makeBoolean(b); }

string
  = s:("\"" [^"]* "\"") { return makeString(s); }

recursive_application
  = operator:application _ "(" _ operands:valueList? _ ")" { 
    return makeApplication(operator, operands ? operands : []); 
  }

application
  = operator:nonApplicativeExpression _ "(" _ operands:valueList? _ ")" { 
    return makeApplication(operator, operands ? operands : []); 
  }

unop
  = _ opcode:[-+!] _ expr:expression _ { return makeUnop(opcode, expr);}

recursive_binop
  = _ left:binop _ opcode:[\+\-\*\/] _ right:expression { return makeBinop(left, opcode, right); }

binop
  = _ left:nonApplicativeExpression _ opcode:[\+\-\*\/] _ right:expression _ { return makeBinop(left, opcode, right); }

literal
  = literal:(number / bool / string) { return makeLiteral(literal); }

nonApplicativeExpression
  = function / Identifier / literal

expression
  = nonApplicativeExpression
   application / unop / recursive_binop / binop

expressionStatement
  = _ expression _ ";" _ { return makeExpressionStatement(expression); }

returnStatement
  = _ "return" _ expression _ ";" _ { return makeReturnStatement(expression); }

statement
  = expressionStatement
  / returnStatement
  / function
  / declaration

spc "space"
  = (BlockComment / LineComment / Whitespace)+

_ "whitespace or comment"
  = (BlockComment / LineComment / Whitespace)*

LineComment
  = "//" [^\n]*

BlockComment
  = "/*" (!"*/" .)* "*/"

Whitespace
  = [ \t\n\r]