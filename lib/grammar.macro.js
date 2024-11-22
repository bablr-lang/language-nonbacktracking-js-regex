import { i, re } from '@bablr/boot/shorthand.macro';
import {
  Node,
  CoveredBy,
  InjectFrom,
  UnboundAttributes,
  AllowEmpty,
} from '@bablr/helpers/decorators';
import objectEntries from 'iter-tools-es/methods/object-entries';
import * as Shared from '@bablr/helpers/productions';
import { buildString, buildBoolean, buildNumber, buildNullTag } from '@bablr/helpers/builders';

export const canonicalURL = 'https://bablr.org/languages/core/en/bablr-regex-pattern';

export const dependencies = {};

const escapables = new Map(
  objectEntries({
    n: '\n',
    r: '\r',
    t: '\t',
    0: '\0',
  }),
);

export const getCooked = (escapeNode, span, ctx) => {
  let cooked;
  const codeNode = escapeNode.get('code');
  const type = ctx.sourceTextFor(codeNode.get('typeToken'));
  const value = ctx.sourceTextFor(codeNode.get('value'));

  if (!type) {
    const match_ = ctx.sourceTextFor(codeNode);

    cooked = escapables.get(match_) || match_;
  } else if (type === 'u' || type === 'x') {
    cooked = parseInt(value, 16);
  } else {
    throw new Error();
  }

  return cooked.toString(10);
};

const flagCharacters = {
  global: 'g',
  ignoreCase: 'i',
  multiline: 'm',
  dotAll: 's',
  unicode: 'u',
  sticky: 'y',
};

const unique = (flags) => flags.length === new Set(flags).size;

const getSpecialPattern = (span) => {
  if (span === 'Pattern') {
    return re`/[*+{}[\]().^$|\n\\<>]/`;
  } else if (span === 'CharacterClass') {
    return re`/[\]\\]/`;
  } else {
    throw new Error('unknown span type for special pattern');
  }
};

export const grammar = class RegexGrammar {
  @Node
  *Pattern() {
    yield i`eat(<*Punctuator '/' balanced='/' balancedSpan='Pattern' /> 'openToken')`;
    yield i`eat(<Alternatives />)`;
    yield i`eat(<*Punctuator '/' balancer /> 'closeToken')`;
    yield i`eat(<Flags /> 'flags$')`;
  }

  @UnboundAttributes(Object.keys(flagCharacters))
  @AllowEmpty
  @Node
  *Flags({ ctx }) {
    const flags = yield i`match(/[gimsuy]+/)`;

    const flagsStr = ctx.sourceTextFor(flags) || '';

    if (flagsStr && !unique(flagsStr)) throw new Error('flags must be unique');

    for (const { 0: name, 1: chr } of Object.entries(flagCharacters)) {
      if (flagsStr.includes(chr)) {
        yield i`bindAttribute(${buildString(name)} true)`;
      } else {
        yield i`bindAttribute(${buildString(name)} false)`;
      }
    }

    for (const flagChr of flagsStr) {
      yield i`eat(<*Keyword ${buildString(flagChr)} /> 'tokens[]')`;
    }
  }

  @AllowEmpty
  *Alternatives() {
    do {
      yield i`eat(<Alternative /> 'alternatives[]$')`;
    } while (yield i`eatMatch(<*Punctuator '|' /> 'separators[]')`);
  }

  @AllowEmpty
  @Node
  *Alternative() {
    yield i`eat(<Elements /> 'elements[]$')`;
  }

  @AllowEmpty
  *Elements() {
    yield i`eat([])`;
    while (yield i`match(/[^|]/)`) {
      yield i`eat(<+Element />)`;
    }
  }

  *Element() {
    yield i`guard(<*Keyword /[*+?]/ />)`;

    yield i`eat(<Any /> null [
        <+CharacterClass '[' />
        <+Group '(?:' />
        <+Assertion /[$^]|\\b/i />
        <+Gap '\\g' />
        <+CharacterSet /\.|\\[dswp]/i />
        <*+Character />
      ])`;

    if (yield i`match(/[*+?{]/)`) {
      return i`holdForMatch(<Quantifier />)`;
    }
  }

  @CoveredBy('Element')
  @Node
  *Group() {
    yield i`eat(<*Punctuator '(?:' balanced=')' /> 'openToken')`;
    yield i`eat(<Alternatives />)`;
    yield i`eat(<*Punctuator ')' balancer /> 'closeToken')`;
  }

  @Node
  *CapturingGroup() {
    yield i`eat(<*Punctuator '(' balanced=')' /> 'openToken')`;
    yield i`eat(<Alternatives />)`;
    yield i`eat(<*Punctuator ')' balancer /> 'closeToken')`;
  }

  @CoveredBy('Element')
  *Assertion() {
    yield i`eat(<Any /> null [
      <*StartOfInputAssertion '^' />
      <*EndOfInputAssertion '$' />
      <*@WordBoundaryAssertion /\\b/i />
    ])`;
  }

  @CoveredBy('Assertion')
  @Node
  *StartOfInputAssertion() {
    yield i`eat(<*Keyword '^' /> 'sigilToken')`;
  }

  @CoveredBy('Assertion')
  @Node
  *EndOfInputAssertion() {
    yield i`eatMatch(<*Keyword '$' /> 'sigilToken')`;
  }

  @UnboundAttributes(['negate'])
  @CoveredBy('Assertion')
  @Node
  *WordBoundaryAssertion({ ctx }) {
    yield i`eatMatch(<*Punctuator '\\' /> 'escapeToken')`;
    const m = yield i`eat(<*Keyword /b/i /> 'value')`;
    yield i`bindAttribute('negate' ${buildBoolean(ctx.sourceTextFor(m) === 'B')})`;
  }

  @CoveredBy('Assertion')
  @Node
  *Gap() {
    yield i`eatMatch(<*Punctuator '\\' /> 'escapeToken')`;
    yield i`eat(<*Keyword 'g' /> 'value')`;
  }

  @CoveredBy('Element')
  @CoveredBy('CharacterClassElement')
  @Node
  *Character() {
    if (yield i`match('\\')`) {
      yield i`eat(<@EscapeSequence /> null)`;
    } else {
      yield i`eat(/[^\r\n\t]/)`;
    }
  }

  @UnboundAttributes(['negate'])
  @CoveredBy('Element')
  @Node
  *CharacterClass() {
    yield i`eat(<*Punctuator '[' balancedSpan='CharacterClass' balanced=']' /> 'openToken')`;

    let neg = yield i`eatMatch(<*Keyword '^' /> 'negateToken')`;

    yield i`bindAttribute('negate' ${buildBoolean(neg)})`;

    while (yield i`match(/./s)`) {
      yield i`eat(<+CharacterClassElement /> 'elements[]$')`;
    }

    yield i`eat(<*Punctuator ']' balancer /> 'closeToken')`;
  }

  *CharacterClassElement() {
    yield i`eat(<Any /> null [
        <CharacterSet /\\[dswp]/i />
        <Gap '\\g' />
        <*+Character />
      ])`;

    if (yield i`match('-')`) {
      return i`holdForMatch(<+CharacterClassRange />)`;
    }
  }

  @CoveredBy('CharacterClassElement')
  @Node
  *CharacterClassRange() {
    yield i`eat(<*+Character /> 'min$')`;
    yield i`eat(<*Punctuator '-' /> 'sigilToken')`;
    yield i`eat(<*+Character /> 'max$')`;
  }

  @CoveredBy('Element')
  *CharacterSet() {
    yield i`eat(<Any /> null [
      <+AnyCharacterSet '.' />
      <+DigitCharacterSet /\\[dD]/  />
      <+SpaceCharacterSet /\\[sS]/  />
      <+WordCharacterSet /\\[wW]/  />
    ])`;
  }

  @CoveredBy('CharacterSet')
  @Node
  *AnyCharacterSet() {
    yield i`eat(<*Keyword '.' /> 'sigilToken')`;
  }

  @UnboundAttributes(['negate'])
  @CoveredBy('CharacterSet')
  @Node
  *DigitCharacterSet({ ctx }) {
    yield i`eat(<*Punctuator '\\' /> 'escapeToken')`;

    let code = yield i`eat(<*Keyword /[dD]/ /> 'value')`;

    yield i`bindAttribute('negate' ${buildBoolean(ctx.sourceTextFor(code) === 'D')})`;
  }

  @UnboundAttributes(['negate'])
  @CoveredBy('CharacterSet')
  @Node
  *SpaceCharacterSet({ ctx }) {
    yield i`eat(<*Punctuator '\\' /> 'escapeToken')`;

    let code = yield i`eat(<*Keyword /[sS]/ /> 'value')`;

    yield i`bindAttribute('negate' ${buildBoolean(ctx.sourceTextFor(code) === 'S')})`;
  }

  @UnboundAttributes(['negate'])
  @CoveredBy('CharacterSet')
  @Node
  *WordCharacterSet({ ctx }) {
    yield i`eat(<*Punctuator '\\' /> 'escapeToken')`;

    let code = yield i`eat(<*Keyword /[wW]/ /> 'value')`;

    yield i`bindAttribute('negate' ${buildBoolean(ctx.sourceTextFor(code) === 'W')})`;
  }

  @UnboundAttributes(['min', 'max'])
  @Node
  *Quantifier({ ctx }) {
    yield i`eat(<+Element /> 'element$')`;

    let attrs, sigil;

    if ((sigil = yield i`eatMatch(<*Keyword /[*+?]/ /> 'sigilToken')`)) {
      switch (ctx.sourceTextFor(sigil)) {
        case '*':
          attrs = { min: 0, max: Infinity };
          break;
        case '+':
          attrs = { min: 1, max: Infinity };
          break;
        case '?':
          attrs = { min: 0, max: 1 };
          break;
      }
    } else if (yield i`eat(<*Punctuator '{' balanced='}' /> 'openToken')`) {
      let max;
      let min = yield i`eat(<*UnsignedInteger /> 'min$')`;

      if (yield i`eatMatch(<*Punctuator ',' /> 'separator')`) {
        max = yield i`eatMatch(<*UnsignedInteger /> 'max$')`;
      }

      min = min && ctx.sourceTextFor(min);
      max = max && ctx.sourceTextFor(max);

      min = min && parseInt(min, 10);
      max = max && parseInt(max, 10);

      attrs = { min, max };

      yield i`eat(<*Punctuator '}' balancer /> 'closeToken')`;
    }

    yield i`bindAttribute('min' ${attrs.min ? buildNumber(attrs.min) : buildNullTag()})`;
    yield i`bindAttribute('max' ${attrs.max ? buildNumber(attrs.max) : buildNullTag()})`;
  }

  @Node
  *UnsignedInteger() {
    yield i`eat(/\d+/)`;
  }

  @Node
  *EscapeSequence({ state, ctx, value: props }) {
    const parentSpan = state.span;

    yield i`eat(<*Punctuator '\\' openSpan='Escape' /> 'escape')`;

    let match;

    if ((match = yield i`match(/[\\/nrt0]/)`)) {
      const match_ = ctx.sourceTextFor(match);
      yield i`eat(<*Keyword ${buildString(match_)} closeSpan='Escape' /> 'code')`;
    } else if (
      (match = yield i`match(${getSpecialPattern(parentSpan, ctx.reifyExpression(props))})`)
    ) {
      const match_ = ctx.sourceTextFor(match);
      yield i`eat(<*Keyword ${buildString(match_)} closeSpan='Escape' /> 'code')`;
    } else if (yield i`match(/[ux]/)`) {
      yield i`eat(<EscapeCode closeSpan='Escape' /> 'code')`;
    } else {
      yield i`fail()`;
    }
  }

  @Node
  *EscapeCode() {
    if (yield i`eatMatch(<*Keyword 'u' /> 'type')`) {
      if (yield i`eatMatch(<*Punctuator '{' /> 'openToken')`) {
        yield i`eatMatch(<*UnsignedInteger /> 'value$')`;
        yield i`eat(<*Punctuator '}' /> 'closeToken')`;
      } else {
        yield i`eat(<*UnsignedInteger /\d{4}/ /> 'value$')`;
        yield i`eat(null 'closeToken')`;
      }
    } else if (yield i`eatMatch(<*Keyword 'x' /> 'type')`) {
      yield i`eat(null 'openToken')`;
      yield i`eat(<*UnsignedInteger /\d{2}/ /> 'value$')`;
      yield i`eat(null 'closeToken')`;
    }
  }

  *Digits() {
    while (yield i`eatMatch(<*Digit />)`);
  }

  @Node
  *Digit() {
    yield i`eat(/\d/)`;
  }

  @InjectFrom(Shared)
  *Any() {}

  @Node
  @InjectFrom(Shared)
  *Keyword() {}

  @Node
  @InjectFrom(Shared)
  *Punctuator() {}
};
