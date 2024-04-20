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
      val_type: null
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

  function makeFloat(int, frac) {
    return parseFloat(int.join("") + "." + frac.join(""), 10);
  }

  function makeString(s) {
    return s.join("");
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
  
  function format_declaration(decType, declaration) {
    declaration.declaration_type = decType;
    return declaration;
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
  
  function makeIndexAccess(val, index) {
    return {
      type: "indexAccess",
      index: index,
      accessed: val,
    }
  }
  
  function makeStructElement(name) {
  	return {
    	type: "structElement",
        name: name,
    }
  }
  
  function makeStructAccess(accessed, field) {
  	return {
      type: "structAccess",
      accessed: accessed,
      field: field
    }
  }
  
  function makeStructFieldInstantiation(field, ex) {
  	return {
    	type: "structFieldInstantiation",
        field: field,
        expr: ex
    }
  }  
  
  function makeStructLiteral(type, fields) {
  	return {
    	type: "structLiteral",
        val_type: type,
        fields: fields
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
  	if (app.type !== "application") {
      throw new Error("go statement must be applied to an application!");
    }
    return {
      type: "goStatement",
      app: app
    }
  }
  
  function makeSendStatement(chan, val) {
    return {
      type: "sendStatement",
      chan: chan,
      val: val,
      inSelect: false
    }
  }

  function makeReceiveExpression(chan) {
    return {
      type: "receiveExpression",
      chan: chan,
      inSelect: false
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
      val_type: "Type",
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
  
  function makeChanType(chan_str, chan_type) {
  	let send_receive = "generic";
    if (chan_str === "<-chan") {
    	send_receive = "receive";
    } 
    if (chan_str === "chan<-") {
    	send_receive = "send";
    }
    return makeType({
      type_type: "chan",
      send_receive_type: send_receive,
      chan_value_type: chan_type
    })
  }
  
  function makeArrayType(size, arr_type) {
  	return makeType({
      type_type: "array",
      size: parseInt(size.join(""), 10),
      arr_type: arr_type,
    })
  }
  
  function makeSliceType(slc_type) {
  	return makeType({
      type_type: "slice",
      slice_type: slc_type,
    })
  }
  
  function makeStructType(elems) {
  	return makeType({
      type_type: "struct",
      elems: elems,
    })
  }
  
  function makeCustomType(custom) {
  	return makeType({
      type_type: "custom",
      type_name: custom
    })
  }
  
  function makeTypeDeclaration(name, dec) {
  	return {
    	type: "typeDeclaration",
        name: name,
        dec_type: dec,
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
  = top_level_decs: (declaration / function / typeDeclaration)* {
  	return makeProgram(top_level_decs.flat()); 
  }

declaration
  = _ dec:standardDeclaration _ ";" _ {return dec;}
  / _ dec:inferredTypeDeclaration _ ";" _ {return dec;}

standardDeclaration
  = _ decType:declarationType spc declarations:declarationList _ {
    // ensure that the declaration type is correct;
    return format_declaration(decType, declarations)
  }

declarationType
  = "var" / "const"

declarationList
  = groupedDeclarationList
  / standardDeclarationList
  
groupedDeclarationList
  = _ "(" _ lists:(@standardDeclarationList _ ";" _ )* _ ")" _ {
    const all_lists = lists.flat();
    // we need to take the identifiers of each list
    // and append them together

    const all_ids = all_lists.map(list => list.ids).flat();

    // we also need to take the values of each list
    // and append them together

    const all_vals = all_lists.map(list => list.vals ? list.vals : []).flat();

    return makeDeclarations(all_ids, all_vals, "placeholder", false);
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
  	return makeFunction(null, formals ? formals : [], retType, body);
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
  = !GoKeyword !InbuiltType head:[a-zA-Z_] tail:[a-zA-Z0-9_]* { 
    return makeIdentifier(head + tail.join("")); 
  }

GoKeyword "reserved syntax keyword"
  = "break" / "case" / "chan" / "const" / "continue" / "default" / "defer" / "else"
    / "fallthrough" / "for" / "func" / "go" / "goto" / "if" / "import" / "interface"
    / "map" / "package" / "range" / "return" / "select" / "struct" / "switch" / "type" / "var"

Type "go type"
  = InbuiltType / CustomType

InbuiltType "inbuilt go type"
  = FunctionType / TupleType / ChanType / ArrayType / SliceType / StructType / BasicType
  
BasicType
  = ("number" / "bool" / "string" / "Type") {
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

ChanType
  = _ chan:("chan"/"<-chan"/"chan<-") _ chanType:(@Type)? _ {
  	return makeChanType(chan, chanType);
  }

SliceType
  = _ "[" _ "]" type:Type {
    return makeSliceType(type)
  }

ArrayType
  = _ "[" _ size:(@[0-9]+) _ "]" type:Type {
  	return makeArrayType(size, type)
  }

structElement
  = _ name:Identifier spc type:Type _ {
  	const elemName = name;
    elemName.val_type = type;
    return makeStructElement(elemName)
  }

StructType
  = _ "struct" _ "{" 
  	_ structElems: (_ @structElement _ ";" _)* _
  "}" _ {
  	return makeStructType(structElems ? structElems : []);
  }

CustomType
  = !GoKeyword !InbuiltType head:[a-zA-Z_] tail:[a-zA-Z0-9_]* { 
    return makeCustomType(head + tail.join("")); 
  }

StructFieldInstantiation
  = field:Identifier _ ":" _ ex:expression {
  	return makeStructFieldInstantiation(field, ex);
  }

StructFieldInstantiationList
  = head:StructFieldInstantiation tail:(_ "," _ @StructFieldInstantiation)* {
  	return [head, ...tail];
  }

// StructLiterals in our implementation
// must specify the names for the fields
// ie Name: xxx
StructLiteral
  = _ type:(StructType/CustomType) _ "{" _ fields:StructFieldInstantiationList? _ "}" _ {
  	return makeStructLiteral(type, fields ? fields : [])
  }

IndexExpression
  = _ target:operableExpression _ 
    rest:("["_ @(logical_binop/unop) _"]")+ _ {
    return rest.reduce(function(wish, curr) {
      const accumulative = curr;
      return makeIndexAccess(wish, accumulative);
    }, target);  
  }
  
StructField
  = _ target:operableExpression _ 
    rest:("." @Identifier)+ _ {
    return rest.reduce(function(wish, curr) {
      return makeStructAccess(wish, curr);
    }, target);  
  }

// specially for applications, because applications can also use types
applicationValueList
  = head:(expression/Type) tail:(_ "," _ @(expression/Type))* {return [head, ...tail]}

applicationOrIndexOrAccessExpression
  = _ target:operableExpression _ 
    rest:(
    @"["_ @([0-9]+/Identifier) _"]" 
    / @"(" _ @applicationValueList? _ ")"
    / @"." @Identifier)+ _ {
    return rest.reduce(function(wish, curr) {
      const [type, accumulative] = curr;
      if (type === "(") {
      	return makeApplication(wish, accumulative ? accumulative : []);
      }
      if (type === ".") {
      	return makeStructAccess(wish, accumulative);
      }
      return makeIndexAccess(wish, accumulative.type === "identifier" ? accumulative : makeLiteral(parseInt(accumulative.join(""), 10)));
    }, target);  
  }

// something that can be applied or indexed together
operableExpression =
   unop
   / function
   / literal
   / StructLiteral
   / Identifier

expression
  = logical_binop
   / unop
   / applicationOrIndexOrAccessExpression
   / function
   / StructLiteral
   / literal
   / Identifier

// something that can be applied to unary operators
unaryOperatorValidExpressions
  = applicationOrIndexOrAccessExpression
  / function
  / factor
  / StructLiteral
  / literal
  / Identifier

// anything that can be applied to binary operators
nonBinaryOperatorExpression
  = applicationOrIndexOrAccessExpression
  / unop
  / function
  / StructLiteral
  / literal
  / Identifier

literal
  = literal:(number / bool / string) { return makeLiteral(literal); }

// negative numbers are handled by the unary operator
number
  = int:[0-9]+ frac:("." @[0-9]+)? {
    if (frac !== null) {
      return makeFloat(int, frac);
    }
    return makeInteger(int);
  }

bool
  = b:("true" / "false") { return makeBoolean(b); }

string
  = s:("\"" @[^"]* "\"") { return makeString(s); }

// the way this is ordered will freely give us left-associativity and operator precedence

logical_binop
  = _ left:comparative_binop _ rest:( _ @("&&" / "||") _ @(comparative_binop))* _ { 
    return rest.reduce(function(wish, curr) {
      return makeBinop(wish, curr[0], curr[1]);
    }, left)
  }

comparative_binop
  = _ left:additive_binop _ rest:( _ @("==" / "!=" / "<=" / ">=" / "<" / ">") _ @(additive_binop))* _ { 
    return rest.reduce(function(wish, curr) {
      return makeBinop(wish, curr[0], curr[1]);
    }, left)
  }

additive_binop
  = _ left:multiplicative_binop _ rest:( _ @[\+\-] _ @(multiplicative_binop))* _ {
    return rest.reduce(function(wish, curr) {
      return makeBinop(wish, curr[0], curr[1]);
    }, left)
  }

multiplicative_binop
  = _ left:factor _ rest:( _ @[\*\/\%] _ @(factor))* _ { 
    return rest.reduce(function(wish, curr) {
      return makeBinop(wish, curr[0], curr[1]);
    }, left)
  }

// an expression bounded by ()
factor
  = _ "(" _ expr:(logical_binop / unop) _ ")" _ { return expr; }
  / nonBinaryOperatorExpression

unop
  = _ opcode:(@"<-" _/[-+!]) expr:unaryOperatorValidExpressions _ { 
      if (opcode === "<-") {
        return makeReceiveExpression(expr);
      }
      return makeUnop(opcode, expr);
    }

identifierOrIndexList
  = head:(IndexExpression/StructField/Identifier) tail:(_ "," _ @(IndexExpression/Identifier))*  {return [head, ...tail]}

assignmentStatement
  = _ identifiers:identifierOrIndexList _ "=" _ values:valueList _ {
    return makeAssignmentStatement(identifiers, values);
  }

expressionStatement
  = _ expression:expression _ { return makeExpressionStatement(expression); }

returnStatement
  = _ "return" _ expression:valueList? _ { return makeReturnStatement(expression ? expression : []); }

ifStatement
  = _ "if" spc short:(@statement)? _ cond:expression _ "{" _ cons:statement* _ "}" _ alt:(@elseStatement)? _ {
  	return makeIfStatement(cond, cons, alt, short);
  }

elseStatement
  = _ "else" _ "{" _ body: statement* _ "}" _ {return body;}
  / elseIfStatement

elseIfStatement
  = _ "else" spc elif:ifStatement _ {return [elif];}

forStatement
  = _ "for" spc init:statement? _ cond:expression? _ ";" _ post:(assignmentStatement / expressionStatement)? _ "{" _ body:statement* _ "}" _ {
  	return makeForStatement(init, cond, post, body);
  }

goStatement
  = _ "go" spc app:applicationOrIndexOrAccessExpression _ {
    // TODO; find a way to assert application
    return makeGoStatement(app);
  }

sendStatement
  = _ chan:expression _ "<-" _ val:expression _ {
  	return makeSendStatement(chan, val);
  }

receiveExpression
  = _ "<-" _ chan:expression _ {
  	return makeReceiveExpression(chan);
  }

receiveStatement
  = _ identifiers: identifierList _ ":=" _ rval: receiveExpression _ {
  	return makeDeclarations(identifiers, [rval], "var", true);
  }
  / _ vals: valueList _ "=" _ rval: receiveExpression _ {
  	return makeAssignmentStatement(vals, [rval])
  }
  / _ rval: receiveExpression _ {
  	return makeExpressionStatement(rval)
  }
  
selectCaseHeader
  = _ "case" spc s:(sendStatement/receiveStatement) _ ":" _ {
  	// set this flag to true
    if (s.type === "sendStatement") {
    	s.inSelect = true;
    } else if (s.type === "expressionStatement") {
      s.expression.inSelect = true;
    } else if (s.type === "declaration") {
      s.vals[0].inSelect = true;
    } else if (s.type === "assignmentStatement") {
      s.vals[0].inSelect = true;
    }
    return {
    	type: "selectCase",
      statement: s
    }
  }

defaultCaseHeader
  = _ "default" _ ":" _ {
  	return {
    	type: "defaultCase"
    }
  }

selectBranch
  = _ branch:(selectCaseHeader/defaultCaseHeader) body:(_ @statement _)* {
  	branch.body = body ? body : []
    return branch;
  }

selectStatement
  = _ "select" _ "{" cases: (_ @selectBranch _)* "}" _ {
  	return {
    	type: "selectStatement",
      cases: cases ? cases : []
    }
  }

typeDeclaration
  = _ "type" spc name:CustomType spc dec:Type _ ";" {
  	return makeTypeDeclaration(name, dec);
  }

statement
  = _ e:(returnStatement
    / goStatement
    / sendStatement
  	/ assignmentStatement
    / expressionStatement) _ ";" _ { return e; } // force semicolons
  / emptyStatement
  / ifStatement
  / forStatement
  / selectStatement
  / namedFunction
  / declaration
  / typeDeclaration

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