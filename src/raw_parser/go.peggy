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
      val_type: makeBasicType(typeof lit)
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
  
  function makeApplication(operator, operands) {
  	return {
      type: "application",
      operator: operator,
      operands: operands,
    }
  }
  
  function makeDeclaration(id, val, decType) {
    return {
      type: "declaration",
      declaration_type: decType,
      ids: id,
      vals: val
    };
  }
  
  function makeDeclarations(id_list, val_list, decType, infer) {
    if (val_list.length === 0 && !infer) {
      return makeDeclaration(id_list, id_list.map(id => getDefault(id.val_type)), decType);
    }
    
    if (infer) {
      // take type from the values and assign to the identifiers
    }

    return makeDeclaration(id_list, val_list, decType);
  }
  
  function getDefault(type) {
          switch (type.type_value) {
            case "number": return makeLiteral(0);
            case "bool": return makeLiteral(false);
            case "string": return makeLiteral("");
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
      expressions: expression
    }
  }
  
  function makeAssignmentStatement(identifiers, values) {
    return {
      type: "assignmentStatement",
      ids: identifiers,
      vals: values
    }
  }
   
  function makeIfStatement(conditional, consequent, alternate, short) {
  	return {
      type: "ifStatement",
      cond: conditional,
      cons: consequent,
      alt: alternate,
      short: short
    }
  }

  function makeForStatement(init, cond, post, body) {
    return {
      type: "forStatement",
      init: init,
      cond: cond,
      post: post,
      body: body
    }
  }

  function makeGoStatement(app) {
    return {
      type: "goStatement",
      app: app
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
  
  function makeType(others) {
    return {
      type: "type",
      ...others
    }
  }
  
  function makeBasicType(type) {
    return makeType({
      type_type: "basic",
      type_value: type
    })
  }
  
  function makeTupleType(types) {
    if (types.length === 1) {
      return types[0];
    }
    return makeType({
      type_type: "tuple",
      type_values: types
    })
  }
  
  function makeFunctionType(formals, ret) {
  	return makeType({
      type_type: "function",
      formal_values: formals,
      return_value: ret
    })
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
  	declarations.declaration_type = decType;
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
    return makeDeclarations(identifiers, vals ? vals : [], "placeholder", false);
  }

inferredTypeDeclaration
  = _ identifiers: identifierList _ ":=" _ vals: valueList _ {  
    return makeDeclarations(identifiers, vals, "var", true);
  }

typedIdentifierList
  = idList: identifierList spc type:Type {
  idList.forEach(id => {id.val_type = type}); 
 return idList; 
  }
 
identifierList
  = head:Identifier tail:(_ "," _ @Identifier)*  {return [head, ...tail]}

valueList
  = head:expression tail:(_ "," _ @expression)* {return [head, ...tail]}

namedFunction
  = _ "func" spc name:Identifier _ "(" _ formals:formalsList? _ ")" _ retType:Type? _ "{" _ body:statement* _ "}" _ { 
    return makeFunction(name, formals ? formals : [], retType, body);
  }

anonymousFunction
  = _ "func" _ "(" _ formals:formalsList? _ ")" _ retType:Type? _ "{" _ body:statement* _ "}" _ {
  	return makeFunction(undefined, formals ? formals : [], retType, body);
  }

function
  = namedFunction
  / anonymousFunction


formalsList
  = head:typedIdentifierList tail:(_ "," _ @typedIdentifierList)* {
    // append the tails to the head
    // flattten the tail - it is an array of arrays
    const newTail = tail.map(t => t).flat();
    return head.concat(newTail);
  }

Identifier
  = !GoKeyword !Type head:[a-zA-Z_] tail:[a-zA-Z0-9_]* { 
    return makeIdentifier(head + tail.join("")); 
  }

GoKeyword "reserved syntax keyword"
  = "break" / "case" / "chan" / "const" / "continue" / "default" / "defer" / "else"
    / "fallthrough" / "for" / "func" / "go" / "goto" / "if" / "import" / "interface"
    / "map" / "package" / "range" / "return" / "select" / "struct" / "switch" / "type" / "var"

Type "go type"
  = BasicType / FunctionType / TupleType
  
BasicType
  = ("number" / "bool" / "string") {
    return makeBasicType(text());
  }

TupleType
  = _ "(" _ types:TypeList _ ")" _ { 
    return makeTupleType(types);
  }

TypeList
  = _ head:Type tail:(_ "," _ @Type)* _ { return [head, ...tail] }

FunctionType
  = _ "func" formals:TupleType _ ret:(@Type)? _ {
    return makeFunctionType(formals, ret); 
  }

expression
  = application 
   / binop
   / unop
   / function
   / literal
   / Identifier

unaryOperatorValidExpressions
  = application
  / function
  / factor
  / literal
  / Identifier

factor
  = "(" expr:(binop / unop) ")" { return expr; }
  / nonBinaryOperatorExpression

nonBinaryOperatorExpression
  = application
  / unop
  / function
  / Identifier
  / literal

nonApplicativeExpression
  = unop
  // binop cannot evaluate into something callable
  / function 
  / Identifier 
  / literal

literal
  = literal:(number / bool / string) { return makeLiteral(literal); }

number
  = n:[0-9]+ { return makeInteger(n); }

bool
  = b:("true" / "false") { return makeBoolean(b); }

string
  = s:("\"" [^"]* "\"") { return makeString(text()); }

application
  = _ operator:nonApplicativeExpression _ rest:("(" _ @valueList? _ ")" )+ _ {
    return rest.reduce(function(wish, curr) {
      return makeApplication(wish, curr ? curr : []); 
    }, operator);
  }

// the way this is ordered will freely give us left-associativity and operator precedence

additive_binop
  = _ left:multiplicative_binop _ rest:(@[\+\-] _ @multiplicative_binop)+ _ { 
    return rest.reduce(function(wish, curr) {
      return makeBinop(wish, curr[0], curr[1]);
    }, left)
  }
  / multiplicative_binop

multiplicative_binop
  = _ left:factor _ rest:(@[\*\/] _ @factor)+ _ { 
    return rest.reduce(function(wish, curr) {
      return makeBinop(wish, curr[0], curr[1]);
    }, left)
  }
  / factor

logical_binop
  = _ left:factor _ rest:(@("&&" / "||") _ @factor)+ _ { 
    return rest.reduce(function(wish, curr) {
      return makeBinop(wish, curr[0], curr[1]);
    }, left)
  }
  / factor

binop
  = additive_binop / multiplicative_binop / logical_binop

unop
  = _ opcode:[-+!] expr:unaryOperatorValidExpressions _ { return makeUnop(opcode, expr);}

assignmentStatement
  = _ identifiers:identifierList _ "=" _ values:valueList _ {
    return makeAssignmentStatement(identifiers, values);
  }

expressionStatement
  = _ expression:expression _ { return makeExpressionStatement(expression); }

returnStatement
  = _ "return" _ expression:valueList _ { return makeReturnStatement(expression); }

ifStatement
  = _ "if" spc short:(@statement)? _ cond:expression _ "{" _ cons:statement* _ "}" _ alt:(@elseStatement)? _ {
  	return makeIfStatement(cond, cons, alt, short);
  }

elseStatement
  = _ "else" _ "{" _ body: statement* _ "}" _ {return body;}
  / elseIfStatement

elseIfStatement
  = _ "else" spc elif:ifStatement _ {return elif;}

forStatement
  = _ "for" spc init:statement? _ cond:expression? _ ";" _ post:expressionStatement? _ "{" _ body:statement* _ "}" _ {
  	return makeForStatement(init, cond, post, body);
  }

goStatement
  = _ "go" spc app:application _ {
    return makeGoStatement(app);
  }

statement
  = _ e:(expressionStatement
  	/ returnStatement
  	/ assignmentStatement
  	/ goStatement) _ ";" _ { return e; } // force semicolons
  / emptyStatement
  / ifStatement
  / forStatement
  / namedFunction
  / declaration

emptyStatement
  = _ ";" _ { return {type: "emptyStatement"}}

spc "space"
  = filler+

_ "whitespace or comment"
  = filler*

filler
  = (BlockComment / LineComment / Whitespace)

LineComment
  = "//" [^\n]*

BlockComment
  = "/*" (!"*/" .)* "*/"

Whitespace
  = [ \t\n\r]