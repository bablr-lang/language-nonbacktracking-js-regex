import { re, spam as m } from '@bablr/boot';
import {
  Node,
  CoveredBy,
  InjectFrom,
  UnboundAttributes,
  AllowEmpty,
} from '@bablr/helpers/decorators';
import objectEntries from 'iter-tools-es/methods/object-entries';
import * as Shared from '@bablr/helpers/productions';
import {
  eat,
  eatMatch,
  match,
  holdForMatch,
  guard,
  bindAttribute,
  fail,
} from '@bablr/helpers/grammar';
import { buildString, buildBoolean, buildNumber, buildNullTag } from '@bablr/agast-vm-helpers';

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
    yield eat(m`openToken: <*Punctuator '/' balanced='/' balancedSpan='Pattern' />`);
    yield eat(m`<Alternatives />`);
    yield eat(m`closeToken: <*Punctuator '/' balancer />`);
    yield eat(m`flags$: <Flags />`);
  }

  @UnboundAttributes(Object.keys(flagCharacters))
  @AllowEmpty
  @Node
  *Flags({ ctx }) {
    const flags = yield match(re`/[gimsuy]+/`);

    const flagsStr = ctx.sourceTextFor(flags) || '';

    if (flagsStr && !unique(flagsStr)) throw new Error('flags must be unique');

    for (const { 0: name, 1: chr } of Object.entries(flagCharacters)) {
      if (flagsStr.includes(chr)) {
        yield bindAttribute(buildString(name), true);
      } else {
        yield bindAttribute(buildString(name), false);
      }
    }

    for (const flagChr of flagsStr) {
      yield eat(m`tokens[]: <*Keyword ${buildString(flagChr)} />`);
    }
  }

  @AllowEmpty
  *Alternatives() {
    do {
      yield eat(m`alternatives[]$: <Alternative />`);
    } while (yield eatMatch(m`separators[]: <*Punctuator '|' />`));
  }

  @AllowEmpty
  @Node
  *Alternative() {
    yield eat(m`elements[]$: <Elements />`);
  }

  @AllowEmpty
  *Elements() {
    yield eat(m`.[]: []`);
    while (yield match(re`/[^|]/`)) {
      yield eat(m`.[]: <Element />`);
    }
  }

  *Element() {
    yield guard(m`<*Keyword /[*+?]/ />`);

    yield eat(m`.+: <Any />`, [
      m`<CharacterClass '[' />`,
      m`<Group '(?:' />`,
      m`<Assertion /[$^]|\\b/i />`,
      m`<Gap '\\g' />`,
      m`<CharacterSet /\.|\\[dswp]/i />`,
      m`<*Character />`,
    ]);

    if (yield match(re`/[*+?{]/`)) {
      return holdForMatch(m`<Quantifier />`);
    }
  }

  @CoveredBy('Element')
  @Node
  *Group() {
    yield eat(m`openToken: <*Punctuator '(?:' balanced=')' />`);
    yield eat(m`<Alternatives />`);
    yield eat(m`closeToken: <*Punctuator ')' balancer />`);
  }

  @Node
  *CapturingGroup() {
    yield eat(m`openToken: <*Punctuator '(' balanced=')' />`);
    yield eat(m`<Alternatives />`);
    yield eat(m`closeToken: <*Punctuator ')' balancer />`);
  }

  @CoveredBy('Element')
  *Assertion() {
    yield eat(m`<Any />`, [
      m`<*StartOfInputAssertion '^' />`,
      m`<*EndOfInputAssertion '$' />`,
      m`<*WordBoundaryAssertion /\\b/i />`,
    ]);
  }

  @CoveredBy('Assertion')
  @Node
  *StartOfInputAssertion() {
    yield eat(m`sigilToken: <*Keyword '^' />`);
  }

  @CoveredBy('Assertion')
  @Node
  *EndOfInputAssertion() {
    yield eatMatch(m`sigilToken: <*Keyword '$' />`);
  }

  @UnboundAttributes(['negate'])
  @CoveredBy('Assertion')
  @Node
  *WordBoundaryAssertion({ ctx }) {
    yield eatMatch(m`escapeToken: <*Punctuator '\\' />`);
    const m = yield eat(m`value: <*Keyword /b/i />`);
    yield bindAttribute('negate', buildBoolean(ctx.sourceTextFor(m) === 'B'));
  }

  @CoveredBy('Assertion')
  @Node
  *Gap() {
    yield eatMatch(m`escapeToken: <*Punctuator '\\' />`);
    yield eat(m`value: <*Keyword 'g' />`);
  }

  @CoveredBy('Element')
  @CoveredBy('CharacterClassElement')
  @Node
  *Character() {
    if (yield match('\\')) {
      yield eat(m`@: <EscapeSequence />`);
    } else {
      yield eat(re`/[^\r\n\t]/`);
    }
  }

  @UnboundAttributes(['negate'])
  @CoveredBy('Element')
  @Node
  *CharacterClass() {
    yield eat(m`openToken: <*Punctuator '[' balancedSpan='CharacterClass' balanced=']' />`);

    let negate = yield eatMatch(m`negateToken: <*Keyword '^' />`);

    yield bindAttribute('negate', !!negate);

    while (yield match(re`/./s`)) {
      yield eat(m`elements[]+$: <CharacterClassElement />`);
    }

    yield eat(m`closeToken: <*Punctuator ']' balancer />`);
  }

  *CharacterClassElement() {
    yield eat(m`<Any />`, [
      m`.: <CharacterSet /\\[dswp]/i />`,
      m`.: <Gap '\\g' />`,
      m`.+: <*Character />`,
    ]);

    if (yield match('-')) {
      return holdForMatch(m`.+: <CharacterClassRange />`);
    }
  }

  @CoveredBy('CharacterClassElement')
  @Node
  *CharacterClassRange() {
    yield eat(m`min+$: <*Character />`);
    yield eat(m`sigilToken: <*Punctuator '-' />`);
    yield eat(m`max+$: <*Character />`);
  }

  @CoveredBy('Element')
  *CharacterSet() {
    yield eat(m`.+: <Any />`, [
      m`<AnyCharacterSet '.' />`,
      m`<DigitCharacterSet /\\[dD]/  />`,
      m`<SpaceCharacterSet /\\[sS]/  />`,
      m`<WordCharacterSet /\\[wW]/  />`,
    ]);
  }

  @CoveredBy('CharacterSet')
  @Node
  *AnyCharacterSet() {
    yield eat(m`sigilToken: <*Keyword '.' />`);
  }

  @UnboundAttributes(['negate'])
  @CoveredBy('CharacterSet')
  @Node
  *DigitCharacterSet({ ctx }) {
    yield eat(m`escapeToken: <*Punctuator '\\' />`);

    let code = yield eat(m`value: <*Keyword /[dD]/ />`);

    yield bindAttribute('negate', buildBoolean(ctx.sourceTextFor(code) === 'D'));
  }

  @UnboundAttributes(['negate'])
  @CoveredBy('CharacterSet')
  @Node
  *SpaceCharacterSet({ ctx }) {
    yield eat(m`escapeToken: <*Punctuator '\\' />`);

    let code = yield eat(m`value: <*Keyword /[sS]/ />`);

    yield bindAttribute('negate', buildBoolean(ctx.sourceTextFor(code) === 'S'));
  }

  @UnboundAttributes(['negate'])
  @CoveredBy('CharacterSet')
  @Node
  *WordCharacterSet({ ctx }) {
    yield eat(m`escapeToken: <*Punctuator '\\' />`);

    let code = yield eat(m`value: <*Keyword /[wW]/ />`);

    yield bindAttribute('negate', buildBoolean(ctx.sourceTextFor(code) === 'W'));
  }

  @UnboundAttributes(['min', 'max'])
  @Node
  *Quantifier({ ctx }) {
    yield eat(m`element+$: <Element />`);

    let attrs, sigil;

    if ((sigil = yield eatMatch(m`sigilToken: <*Keyword /[*+?]/ />`))) {
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
    } else if (yield eat(m`openToken: <*Punctuator '{' balanced='}' />`)) {
      let max;
      let min = yield eat(m`min$: <*UnsignedInteger />`);

      if (yield eatMatch(m`separator: <*Punctuator ',' />`)) {
        max = yield eatMatch(m`max$: <*UnsignedInteger />`);
      }

      min = min && ctx.sourceTextFor(min);
      max = max && ctx.sourceTextFor(max);

      min = min && parseInt(min, 10);
      max = max && parseInt(max, 10);

      attrs = { min, max };

      yield eat(m`closeToken: <*Punctuator '}' balancer />`);
    }

    yield bindAttribute('min', attrs.min ? buildNumber(attrs.min) : buildNullTag());
    yield bindAttribute('max', attrs.max ? buildNumber(attrs.max) : buildNullTag());
  }

  @Node
  *UnsignedInteger() {
    yield eat(re`/\d+/`);
  }

  @Node
  *EscapeSequence({ state, ctx, value: props }) {
    const parentSpan = state.span;

    yield eat(m`escape: <*Punctuator '\\' openSpan='Escape' />`);

    let match;

    if ((match = yield match(re`/[\\/nrt0]/`))) {
      const match_ = ctx.sourceTextFor(match);
      yield eat(m`code: <*Keyword ${buildString(match_)} closeSpan='Escape' />`);
    } else if ((match = yield match(getSpecialPattern(parentSpan, ctx.reifyExpression(props))))) {
      const match_ = ctx.sourceTextFor(match);
      yield eat(m`code: <*Keyword ${buildString(match_)} closeSpan='Escape' />`);
    } else if (yield match(re`/[ux]/`)) {
      yield eat(m`code: <EscapeCode closeSpan='Escape' />`);
    } else {
      yield fail();
    }
  }

  @Node
  *EscapeCode() {
    if (yield eatMatch(m`type: <*Keyword 'u' />`)) {
      if (yield eatMatch(m`openToken: <*Punctuator '{' />`)) {
        yield eatMatch(m`value$: <*UnsignedInteger />`);
        yield eat(m`closeToken: <*Punctuator '}' />`);
      } else {
        yield eat(m`value$: <*UnsignedInteger /\d{4}/ />`);
        yield eat(m`closeToken: null`);
      }
    } else if (yield eatMatch(m`type: <*Keyword 'x' />`)) {
      yield eat(m`openToken: null`);
      yield eat(m`value$: <*UnsignedInteger /\d{2}/ />`);
      yield eat(m`closeToken: null`);
    }
  }

  *Digits() {
    while (yield eatMatch(m`<*Digit />`));
  }

  @Node
  *Digit() {
    yield eat(re`/\d/`);
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
