import { WriteStream } from 'tty';
import { inspect } from 'util';
import { LogOptions, LogType } from './types';

export const config: Required<LogOptions> = {
  fancy: true,
  level: 2,
}

const ansi = (...codes: number[]) => `\x1b[${codes.join(';')}m`;

export function info(subject: any, options?: Partial<typeof config>) {
  if (config.level > 2) write(process.stdout, LogType.INFO, subject, options);
}

export function warn(subject: any, options?: Partial<typeof config>) {
  if (config.level > 1) write(process.stderr, LogType.WARN, subject, options);
}

export function error(subject: any, options?: Partial<typeof config>) {
  config.level > 0 && write(process.stderr, LogType.ERROR, subject, options);
}


function write(stream: WriteStream, type: LogType, subject: any, { fancy = config.fancy }: Partial<typeof config> = {}) {
  const color = [34, 33, 31][type]!;
  const label = ['INFO', 'WARN', 'ERROR'][type]!;

  fancy
    ? stream.write(`${ansi(1,color)}${label}${ansi(0)} ${Date()}\n${typeof subject === 'string' ? subject : inspect(subject, { colors: true })}\n\n`)
    : stream.write(JSON.stringify({
      l: label,
      t: Date.now(),
      d: subject instanceof Error ? `${subject.name}: ${subject.message}` : subject,
    }) + '\n');
}