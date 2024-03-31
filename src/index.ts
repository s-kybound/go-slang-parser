import { Program } from "estree"
import { Tokenizer } from "./tokenizer"
import { Parser } from "./parser2"
import { Translator } from "./translator"
import { Resolver } from "./resolver"

export function parsePythonToEstreeAst(code: string,
    variant: number = 1,
    doValidate: boolean = false): Program {
    const script = code + '\n'
    const tokenizer = new Tokenizer(script)
    const tokens = tokenizer.scanEverything()
    const goParser = new Parser(script, tokens)
    const ast = goParser.parse()
    if (doValidate) {
        new Resolver(script, ast).resolve(ast);
    }
    const translator = new Translator(script)
    return translator.resolve(ast) as unknown as Program
}