// SVG path data: an arc-aware tokeniser, and a normaliser that re-serialises
// path data with unambiguous separators.
//
// WHY THIS EXISTS
//
// In an elliptical arc command the two flags are single digits and the SVG
// grammar lets them run straight into the next number with no separator:
//
//     a2 2 0 012.36-1.968      is  a 2 2 0 0 1 2.36 -1.968
//     a2 2 0 00-2 2            is  a 2 2 0 0 0 -2 2
//
// Every other command's arguments are plain numbers, so the obvious tokeniser
// — one regex that matches command letters or numbers — is correct everywhere
// except arcs, where it reads `012.36` as the single number 12.36 (or 0.36, or
// whatever the leading zeros make of it) and silently shifts every remaining
// argument by one position.
//
// Lucide began emitting arcs in this minified form. Ten icons in the set carry
// it, including `action/eye`, which had been shipping for months: the MAUI
// verifier compares source geometry against emitted geometry, and when BOTH
// sides mis-parse a path in the same way they agree, so it passed. It only
// failed once the two sides diverged, on four icons where the opening-moveto
// rewrite shifted the mis-parse.
//
// That is a blind spot, not a pass. And `Icons.xaml` takes `d` verbatim, so the
// concatenated form was also being handed to XAML's own path parser, which
// reads those flags as numbers too.
//
// So path data is normalised before it is emitted: flags are written as
// separate tokens, negative numbers keep their sign as a separator, and the
// result is unambiguous to any conformant parser.

const COMMANDS = 'MmLlHhVvCcSsQqTtAaZz';

/** Argument count per command. Arcs are 7, of which #4 and #5 are flags. */
const ARITY = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7, Z: 0 };

const isDigit = (c) => c >= '0' && c <= '9';
const isSep = (c) => c === ' ' || c === ',' || c === '\n' || c === '\t' || c === '\r';

/**
 * Tokenise path data into command letters and argument strings.
 *
 * Arc flags are read as exactly one character each, which is what makes this
 * correct where a plain number regex is not.
 *
 * @returns {string[]} e.g. ['M', '10', '4', 'a', '2', '2', '0', '0', '1', '2.36', '-1.968']
 */
export function tokenisePathData(d) {
  const out = [];
  let i = 0;
  let cmd = null;

  const skipSep = () => { while (i < d.length && isSep(d[i])) i += 1; };

  const readNumber = () => {
    skipSep();
    const start = i;
    if (d[i] === '-' || d[i] === '+') i += 1;
    while (i < d.length && isDigit(d[i])) i += 1;
    if (d[i] === '.') {
      i += 1;
      while (i < d.length && isDigit(d[i])) i += 1;
    }
    if (d[i] === 'e' || d[i] === 'E') {
      i += 1;
      if (d[i] === '-' || d[i] === '+') i += 1;
      while (i < d.length && isDigit(d[i])) i += 1;
    }
    if (i === start) throw new Error(`expected a number at offset ${i} of "${d}"`);
    return d.slice(start, i);
  };

  // A flag is a single '0' or '1' — never more, however it is written.
  const readFlag = () => {
    skipSep();
    const c = d[i];
    if (c !== '0' && c !== '1') {
      throw new Error(`expected an arc flag (0 or 1) at offset ${i} of "${d}"`);
    }
    i += 1;
    return c;
  };

  skipSep();
  while (i < d.length) {
    if (COMMANDS.includes(d[i])) {
      cmd = d[i];
      out.push(cmd);
      i += 1;
    } else if (cmd === null) {
      throw new Error(`path data does not start with a command: "${d}"`);
    }

    const C = cmd.toUpperCase();
    const arity = ARITY[C];
    if (arity === undefined) throw new Error(`unknown path command "${cmd}"`);

    if (arity === 0) { skipSep(); continue; }

    if (C === 'A') {
      out.push(readNumber(), readNumber(), readNumber());
      out.push(readFlag(), readFlag());
      out.push(readNumber(), readNumber());
    } else {
      for (let k = 0; k < arity; k += 1) out.push(readNumber());
    }

    skipSep();

    // An implicit repeat: more numbers follow without a new command letter.
    // A repeated moveto continues as a lineto, per the SVG grammar.
    if (i < d.length && !COMMANDS.includes(d[i])) {
      if (C === 'M') cmd = cmd === 'M' ? 'L' : 'l';
      out.push(cmd);
    }
  }

  return out;
}

/**
 * Re-serialise path data with explicit separators, so arc flags can never run
 * into the following number. Geometry is unchanged — this only alters spacing.
 */
export function normalisePathData(d) {
  const tokens = tokenisePathData(d);
  const parts = [];
  for (const t of tokens) {
    if (COMMANDS.includes(t) && t.length === 1) parts.push(t);
    else parts.push(t);
  }
  // Join everything with a single space: unambiguous, and readable in the XAML.
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}
