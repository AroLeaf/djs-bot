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


export async function parse<T>(str: string, { args = [], options = [], transformer = async arg => <T>arg }: ArgumentParserOptions<T> = {}) {
  const tokens = lexer.parse(str);
  
  const out: ArgumentParserResults<T> = {
    args: {},
    options: {},
  }

  let i = 0;

  async function parseOption(optionData: ArgumentParserOptionData) {
    if (!optionData.args?.length) return true;
    
    const option: ArgumentParserResultArguments<T> = {};
    
    for (const argumentData of optionData.args) {
      const token = tokens[i];
      if (token.type !== 'arg') {
        if (argumentData.required) throw new Error(`Missing argument \`${argumentData.name}\` for option \`${optionData.name}\``);
        i++;
        continue;
      }
      const value = await transformer(token.value, argumentData.name, optionData.name);
      if (!value) {
        if (argumentData.required) throw new Error(`Invalid argument \`${argumentData.name}\` for option \`${optionData.name}\``);
        i++
        continue;
      }
      option[argumentData.name] = value;
      i++;
    }

    return option;
  }

  while (tokens[i]) {
    const { type, value } = tokens[i];
    switch(type) {
      case 'flags': {
        i++;
        for (const short of value) {
          const optionData = options.find(opt => opt.short === short);
          if (!optionData) throw new Error(`Unknown short flag \`${short}\``);
          out.options[optionData.name] = await parseOption(optionData);
        }
        break;
      }

      case 'flag': {
        i++;
        const optionData = options.find(opt => opt.name === value);
        if (!optionData) throw new Error(`Unknown flag \`${value}\``);
        out.options[optionData.name] = await parseOption(optionData);
        break;
      }

      case 'arg': {
        const argumentData = args.find(arg => !out.args[arg.name]);
        if (!argumentData) {
          i++;
          continue;
        }
        const res = await transformer(value, argumentData.name).catch(e => {
          if (argumentData.required) throw e;
        });
        out.args[argumentData.name] = res!;
        i++;
        break;
      }

      case 'rest': {
        out.rest = value;
      }
    }
  }

  return out;
}
