import { Lexer } from '@aroleaf/parser';
import { ArgumentParserOptionData, ArgumentParserOptions, ArgumentParserResultArguments, ArgumentParserResults } from './types';

const lexer = new Lexer();

lexer
  .token('flags')
  .matches(/-([a-zA-Z]+)/)

lexer
  .token('flag')
  .matches(/--([a-zA-Z][-a-zA-Z]*)/)

lexer
  .token('rest')
  .matches(/--(?:\s+|$)(.*)/s)
  .then((t, m) => t.value = m[1])

lexer
  .token('arg')
  .matches(/(?:\\.|'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|\S)+/s)
  .then(t => t.value = t.value
    .replace(/(?<!\\)((?:\\\\)*)(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")/g, (...m) => m[1] + (m[3] || m[2]))
    .replace(/\\(.)/sg, '$1')
  )

lexer
  .token('whitespace')
  .matches(/\s+/)
  .discard()


/**
 * A CLI-style argument parser.
 * @param str - the string to parse
 * @param options - the options for the parser
 * @param options.args - positional arguments
 * @param options.options - named arguments
 * @param options.transformer - a function to transform arguments
 * @returns the parsed arguments
 */
export async function parse<T>(str: string, { args = [], options = [], transformer = async arg => <T>arg }: ArgumentParserOptions<T> = {}) {
  const tokens = lexer.parse(str);
  
  const out: ArgumentParserResults<T> = {
    args: {},
    options: {},
  }

  let currentToken = 0;
  let currentArg = 0;

  async function parseOption(optionData: ArgumentParserOptionData) {
    if (!optionData.args?.length) return true;
    
    let option: ArgumentParserResultArguments<T> = {};
    
    for (const argumentData of optionData.args) {
      const token = tokens[currentToken];
      if (token?.type !== 'arg') {
        if (argumentData.required) throw new Error(`Missing required argument \`${argumentData.name}\` for option \`${optionData.name}\`.`);
        currentToken++;
        continue;
      }
      const value = await transformer(token.value, argumentData.name, optionData.name).catch(e => {
        if (argumentData.required) throw e;
      });
      if (value == null) continue;
      currentToken++;
      if (optionData.args.length === 1 && optionData.name === argumentData.name) return value;
      option[argumentData.name] = value;
    }

    return option;
  }

  while (tokens[currentToken]) {
    const { type, value } = tokens[currentToken];
    switch(type) {
      case 'flags': {
        currentToken++;
        for (const short of value) {
          const optionData = options.find(opt => opt.short === short);
          if (!optionData) throw new Error(`Unknown short flag \`${short}\`.`);
          out.options[optionData.name] = await parseOption(optionData);
        }
        break;
      }

      case 'flag': {
        currentToken++;
        const optionData = options.find(opt => opt.name === value);
        if (!optionData) throw new Error(`Unknown flag \`${value}\`.`);
        out.options[optionData.name] = await parseOption(optionData);
        break;
      }

      case 'arg': {
        const argumentData = args[currentArg];
        if (!argumentData) {
          currentToken++;
          continue;
        }
        const res = await transformer(value, argumentData.name).catch(e => {
          if (argumentData.required) throw e;
        });
        if (res != null) {
          out.args[argumentData.name] = res;
          currentToken++;
        }
        currentArg++;
        break;
      }

      case 'rest': {
        out.rest = value;
      }
    }
  }

  for (const option of options) if (!out.options[option.name] && option.required) {
    throw new Error(`Missing required option \`${option.name}\`.`);
  }

  for (const arg of args) if (!out.args[arg.name] && arg.required) {
    throw new Error(`Missing required argument \`${arg.name}\`.`);
  }

  return out;
}
