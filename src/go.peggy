{{
  function makeIdentifier(id) {
    return {
      type: "identifier"
      name: id
    }
  }

  function makeLiteral(lit) {
    return {
      type: "literal",
      value: lit
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
}}

// LIMITATIONS: This is a very simple parser for go.
// we will ignore all package and import syntax, we assume a single file.
// we simplify the types given, following javascript - number, bool, string.
// we force the use of semicolons at the end of each statement.
// both const and var force the inclusion of types.
// naked returns are not supported.

// the top-level rule, expecting at least one function.

start
  = declaration* function+

declaration
  = _ standardDeclaration _ ";" _
  / _ inferredTypeDeclaration _ ";" _

standardDeclaration
  = _ decType:declarationType spc declarations:declarationList _

declarationType
  = "var" / "const"

declarationList
  = groupedDeclarationList
  / standardDeclarationList
  
groupedDeclarationList
  = _ "(" _ standardDeclarationList* _ ")" _

standardDeclarationList
  = _ identifiers: _ typedIdentifierList _ (_ "=" _ initialization: valueList)? _ 

inferredTypeDeclaration
  = _ identifiers: identifierList _ ":=" _ initialization: valueList _ 

typedIdentifierList
  = identifierList spc type:Type
 
identifierList
  = Identifier (_ "," _ Identifier)*

valueList
  = expression (_ "," _ expression)*

function
  = _ "func" spc name:Identifier _ "(" _ formals:formalsList? _ ")" _ retType:Type? _ "{" _ statement* _ "}" { return { type: "function", name }; }

formalsList
  = identifierList spc type:Type (_ "," _ identifierList spc Type)*

Identifier
  = !GoKeyword !Type head:[a-zA-Z_] tail:[a-zA-Z0-9_]* { return head + tail.join(""); }

GoKeyword "reserved syntax keyword"
  = "break" / "case" / "chan" / "const" / "continue" / "default" / "defer" / "else"
    / "fallthrough" / "for" / "func" / "go" / "goto" / "if" / "import" / "interface"
    / "map" / "package" / "range" / "return" / "select" / "struct" / "switch" / "type" / "var"

Type "go type"
  = BasicType
  
BasicType
  = "number" / "bool" / "string"

number
  = n:[0-9]+ { return makeInteger(n) }

bool
  = b:("true" / "false") { return makeBoolean(b) }

string
  = s:("\"" [^"]* "\"") { return makeString(s) }

application
  = base:expression "(" _ valueList? _ ")"

literal
  = literal:(number / bool / string) { return makeLiteral(literal) }

expression
  = function / Identifier / literal

expressionStatement
  = expression _ ";"

statement
  = expressionStatement
  / function
  / declaration

spc "space"
  = BlockComment+ / [ \t\n\r]+

_ "whitespace or comment"
  = BlockComment+ / LineComment / Whitespace

LineComment
  = "//" [^\n]*

BlockComment
  = "/*" (!"*/" .)* "*/"

Whitespace
  = [ \t\n\r]*
