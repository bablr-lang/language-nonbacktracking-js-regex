import { buildTag, Context } from 'bablr';
import { spam } from '@bablr/boot';
import { dedent } from '@qnighy/dedent';
import * as language from '@bablr/language-en-regex-vm-pattern';
import { debugEnhancers } from '@bablr/helpers/enhancers';
import { expect } from 'expect';
import { printPrettyCSTML } from '@bablr/helpers/tree';
import { buildIdentifier, buildString } from '@bablr/helpers/builders';

let enhancers = {};

// enhancers = debugEnhancers;

const ctx = Context.from(language, enhancers.bablrProduction);

const buildRegexTag = (type) => {
  const matcher = spam`<$${buildString(language.canonicalURL)}:${buildIdentifier(type)} />`;
  return buildTag(ctx, matcher, undefined, { enhancers });
};

const print = (tree) => {
  return printPrettyCSTML(tree, { ctx });
};

describe('@bablr/language-en-regex-vm-pattern', () => {
  describe('Pattern', () => {
    const regex = buildRegexTag('Pattern');

    it('`//`', () => {
      expect(print(regex`//`)).toEqual(dedent`\
        <!0:cstml { bablrLanguage: 'https://bablr.org/languages/core/en/bablr-regex-pattern' }>
        <$>
          .:
          <$Pattern>
            openToken: <*Punctuator '/' { balanced: '/', balancedSpan: 'Pattern' } />
            alternatives[]$: []
            alternatives[]$:
            <$Alternative>
              elements[]$: []
            </>
            separatorTokens[]: []
            closeToken: <*Punctuator '/' { balancer: true } />
            flags$: <$Flags { global: false, ignoreCase: false, multiline: false, dotAll: false, unicode: false, sticky: false } />
          </>
        </>\n`);
    });

    it('`/2/`', () => {
      expect(print(regex`/2/`)).toEqual(dedent`\
        <!0:cstml { bablrLanguage: 'https://bablr.org/languages/core/en/bablr-regex-pattern' }>
        <$>
          .:
          <$Pattern>
            openToken: <*Punctuator '/' { balanced: '/', balancedSpan: 'Pattern' } />
            alternatives[]$: []
            alternatives[]$:
            <$Alternative>
              elements[]$: []
              elements[]+$: <*Character '2' />
            </>
            separatorTokens[]: []
            closeToken: <*Punctuator '/' { balancer: true } />
            flags$: <$Flags { global: false, ignoreCase: false, multiline: false, dotAll: false, unicode: false, sticky: false } />
          </>
        </>\n`);
    });

    it('`/21/`', () => {
      expect(print(regex`/21/`)).toEqual(dedent`\
        <!0:cstml { bablrLanguage: 'https://bablr.org/languages/core/en/bablr-regex-pattern' }>
        <$>
          .:
          <$Pattern>
            openToken: <*Punctuator '/' { balanced: '/', balancedSpan: 'Pattern' } />
            alternatives[]$: []
            alternatives[]$:
            <$Alternative>
              elements[]$: []
              elements[]+$: <*Character '2' />
              elements[]+$: <*Character '1' />
            </>
            separatorTokens[]: []
            closeToken: <*Punctuator '/' { balancer: true } />
            flags$: <$Flags { global: false, ignoreCase: false, multiline: false, dotAll: false, unicode: false, sticky: false } />
          </>
        </>\n`);
    });

    it('`/1|2/`', () => {
      expect(print(regex`/1|2/`)).toEqual(dedent`\
        <!0:cstml { bablrLanguage: 'https://bablr.org/languages/core/en/bablr-regex-pattern' }>
        <$>
          .:
          <$Pattern>
            openToken: <*Punctuator '/' { balanced: '/', balancedSpan: 'Pattern' } />
            alternatives[]$: []
            alternatives[]$:
            <$Alternative>
              elements[]$: []
              elements[]+$: <*Character '1' />
            </>
            separatorTokens[]: []
            separatorTokens[]: <*Punctuator '|' />
            alternatives[]$:
            <$Alternative>
              elements[]$: []
              elements[]+$: <*Character '2' />
            </>
            closeToken: <*Punctuator '/' { balancer: true } />
            flags$: <$Flags { global: false, ignoreCase: false, multiline: false, dotAll: false, unicode: false, sticky: false } />
          </>
        </>\n`);
    });

    it('`/2+/`', () => {
      expect(print(regex`/2+/`)).toEqual(dedent`\
        <!0:cstml { bablrLanguage: 'https://bablr.org/languages/core/en/bablr-regex-pattern' }>
        <$>
          .:
          <$Pattern>
            openToken: <*Punctuator '/' { balanced: '/', balancedSpan: 'Pattern' } />
            alternatives[]$: []
            alternatives[]$:
            <$Alternative>
              elements[]$: []
              elements[]+$: <*Character '2' />
              ^^^
              <$Quantifier { min: 1, max: +Infinity }>
                element+$: <//>
                sigilToken: <*Keyword '+' />
              </>
            </>
            separatorTokens[]: []
            closeToken: <*Punctuator '/' { balancer: true } />
            flags$: <$Flags { global: false, ignoreCase: false, multiline: false, dotAll: false, unicode: false, sticky: false } />
          </>
        </>\n`);
    });

    it('`/[-]/`', () => {
      expect(print(regex`/[-]/`)).toEqual(dedent`\
        <!0:cstml { bablrLanguage: 'https://bablr.org/languages/core/en/bablr-regex-pattern' }>
        <$>
          .:
          <$Pattern>
            openToken: <*Punctuator '/' { balanced: '/', balancedSpan: 'Pattern' } />
            alternatives[]$: []
            alternatives[]$:
            <$Alternative>
              elements[]$: []
              elements[]+$:
              <$CharacterClass { negate: false }>
                openToken: <*Punctuator '[' { balancedSpan: 'CharacterClass', balanced: ']' } />
                negateToken: null
                elements[]$: []
                elements[]+$: <*Character '-' />
                closeToken: <*Punctuator ']' { balancer: true } />
              </>
            </>
            separatorTokens[]: []
            closeToken: <*Punctuator '/' { balancer: true } />
            flags$: <$Flags { global: false, ignoreCase: false, multiline: false, dotAll: false, unicode: false, sticky: false } />
          </>
        </>\n`);
    });

    it('`/[--]/`', () => {
      expect(print(regex`/[--]/`)).toEqual(dedent`\
        <!0:cstml { bablrLanguage: 'https://bablr.org/languages/core/en/bablr-regex-pattern' }>
        <$>
          .:
          <$Pattern>
            openToken: <*Punctuator '/' { balanced: '/', balancedSpan: 'Pattern' } />
            alternatives[]$: []
            alternatives[]$:
            <$Alternative>
              elements[]$: []
              elements[]+$:
              <$CharacterClass { negate: false }>
                openToken: <*Punctuator '[' { balancedSpan: 'CharacterClass', balanced: ']' } />
                negateToken: null
                elements[]$: []
                elements[]+$: <*Character '-' />
                elements[]+$: <*Character '-' />
                closeToken: <*Punctuator ']' { balancer: true } />
              </>
            </>
            separatorTokens[]: []
            closeToken: <*Punctuator '/' { balancer: true } />
            flags$: <$Flags { global: false, ignoreCase: false, multiline: false, dotAll: false, unicode: false, sticky: false } />
          </>
        </>\n`);
    });

    it('`/[---]/`', () => {
      expect(print(regex`/[---]/`)).toEqual(dedent`\
        <!0:cstml { bablrLanguage: 'https://bablr.org/languages/core/en/bablr-regex-pattern' }>
        <$>
          .:
          <$Pattern>
            openToken: <*Punctuator '/' { balanced: '/', balancedSpan: 'Pattern' } />
            alternatives[]$: []
            alternatives[]$:
            <$Alternative>
              elements[]$: []
              elements[]+$:
              <$CharacterClass { negate: false }>
                openToken: <*Punctuator '[' { balancedSpan: 'CharacterClass', balanced: ']' } />
                negateToken: null
                elements[]$: []
                elements[]+$: <*Character '-' />
                ^^^
                <$CharacterClassRange>
                  min+$: <//>
                  sigilToken: <*Punctuator '-' />
                  max+$: <*Character '-' />
                </>
                closeToken: <*Punctuator ']' { balancer: true } />
              </>
            </>
            separatorTokens[]: []
            closeToken: <*Punctuator '/' { balancer: true } />
            flags$: <$Flags { global: false, ignoreCase: false, multiline: false, dotAll: false, unicode: false, sticky: false } />
          </>
        </>\n`);
    });

    it('`//i`', () => {
      expect(print(regex`//i`)).toEqual(dedent`\
        <!0:cstml { bablrLanguage: 'https://bablr.org/languages/core/en/bablr-regex-pattern' }>
        <$>
          .:
          <$Pattern>
            openToken: <*Punctuator '/' { balanced: '/', balancedSpan: 'Pattern' } />
            alternatives[]$: []
            alternatives[]$:
            <$Alternative>
              elements[]$: []
            </>
            separatorTokens[]: []
            closeToken: <*Punctuator '/' { balancer: true } />
            flags$:
            <$Flags { global: false, ignoreCase: true, multiline: false, dotAll: false, unicode: false, sticky: false }>
              tokens[]: []
              tokens[]: <*Keyword 'i' />
            </>
          </>
        </>\n`);
    });

    it('`//mi`', () => {
      expect(print(regex`//mi`)).toEqual(dedent`\
        <!0:cstml { bablrLanguage: 'https://bablr.org/languages/core/en/bablr-regex-pattern' }>
        <$>
          .:
          <$Pattern>
            openToken: <*Punctuator '/' { balanced: '/', balancedSpan: 'Pattern' } />
            alternatives[]$: []
            alternatives[]$:
            <$Alternative>
              elements[]$: []
            </>
            separatorTokens[]: []
            closeToken: <*Punctuator '/' { balancer: true } />
            flags$:
            <$Flags { global: false, ignoreCase: true, multiline: true, dotAll: false, unicode: false, sticky: false }>
              tokens[]: []
              tokens[]: <*Keyword 'm' />
              tokens[]: <*Keyword 'i' />
            </>
          </>
        </>\n`);
    });

    it('`/\\W/`', () => {
      expect(print(regex`/\W/`)).toEqual(dedent`\
        <!0:cstml { bablrLanguage: 'https://bablr.org/languages/core/en/bablr-regex-pattern' }>
        <$>
          .:
          <$Pattern>
            openToken: <*Punctuator '/' { balanced: '/', balancedSpan: 'Pattern' } />
            alternatives[]$: []
            alternatives[]$:
            <$Alternative>
              elements[]$: []
              elements[]+$:
              <$WordCharacterSet { negate: true }>
                escapeToken: <*Punctuator '${'\\\\'}' />
                value: <*Keyword 'W' />
              </>
            </>
            separatorTokens[]: []
            closeToken: <*Punctuator '/' { balancer: true } />
            flags$: <$Flags { global: false, ignoreCase: false, multiline: false, dotAll: false, unicode: false, sticky: false } />
          </>
        </>\n`);
    });

    it('`/\\g/`', () => {
      expect(print(regex`/\g/`)).toEqual(dedent`\
        <!0:cstml { bablrLanguage: 'https://bablr.org/languages/core/en/bablr-regex-pattern' }>
        <$>
          .:
          <$Pattern>
            openToken: <*Punctuator '/' { balanced: '/', balancedSpan: 'Pattern' } />
            alternatives[]$: []
            alternatives[]$:
            <$Alternative>
              elements[]$: []
              elements[]+$:
              <$Gap>
                escapeToken: <*Punctuator '${'\\\\'}' />
                value: <*Keyword 'g' />
              </>
            </>
            separatorTokens[]: []
            closeToken: <*Punctuator '/' { balancer: true } />
            flags$: <$Flags { global: false, ignoreCase: false, multiline: false, dotAll: false, unicode: false, sticky: false } />
          </>
        </>\n`);
    });

    it('`/\\</`', () => {
      expect(print(regex`/\</`)).toEqual(dedent`\
        <!0:cstml { bablrLanguage: 'https://bablr.org/languages/core/en/bablr-regex-pattern' }>
        <$>
          .:
          <$Pattern>
            openToken: <*Punctuator '/' { balanced: '/', balancedSpan: 'Pattern' } />
            alternatives[]$: []
            alternatives[]$:
            <$Alternative>
              elements[]$: []
              elements[]+$:
              <*Character>
                @:
                <EscapeSequence { cooked: '<' }>
                  escape: <*Punctuator '${'\\\\'}' { openSpan: 'Escape' } />
                  code: <*Keyword '<' { closeSpan: 'Escape' } />
                </>
              </>
            </>
            separatorTokens[]: []
            closeToken: <*Punctuator '/' { balancer: true } />
            flags$: <$Flags { global: false, ignoreCase: false, multiline: false, dotAll: false, unicode: false, sticky: false } />
          </>
        </>\n`);
    });

    it('`/[ \\t]+/`', () => {
      expect(print(regex`/[ \t]+/`)).toEqual(dedent`\
        <!0:cstml { bablrLanguage: 'https://bablr.org/languages/core/en/bablr-regex-pattern' }>
        <$>
          .:
          <$Pattern>
            openToken: <*Punctuator '/' { balanced: '/', balancedSpan: 'Pattern' } />
            alternatives[]$: []
            alternatives[]$:
            <$Alternative>
              elements[]$: []
              elements[]+$:
              <$CharacterClass { negate: false }>
                openToken: <*Punctuator '[' { balancedSpan: 'CharacterClass', balanced: ']' } />
                negateToken: null
                elements[]$: []
                elements[]+$: <*Character ' ' />
                elements[]+$:
                <*Character>
                  @:
                  <EscapeSequence { cooked: '${'\\t'}' }>
                    escape: <*Punctuator '${'\\\\'}' { openSpan: 'Escape' } />
                    code: <*Keyword 't' { closeSpan: 'Escape' } />
                  </>
                </>
                closeToken: <*Punctuator ']' { balancer: true } />
              </>
              ^^^
              <$Quantifier { min: 1, max: +Infinity }>
                element+$: <//>
                sigilToken: <*Keyword '+' />
              </>
            </>
            separatorTokens[]: []
            closeToken: <*Punctuator '/' { balancer: true } />
            flags$: <$Flags { global: false, ignoreCase: false, multiline: false, dotAll: false, unicode: false, sticky: false } />
          </>
        </>
      `);
    });

    it('`//<gåp>`', () => {
      const flags = buildRegexTag('Flags')`i`;
      expect(print(regex`//${flags}`)).toEqual(dedent`\
        <!0:cstml { bablrLanguage: 'https://bablr.org/languages/core/en/bablr-regex-pattern' }>
        <$>
          .:
          <$Pattern>
            openToken: <*Punctuator '/' { balanced: '/', balancedSpan: 'Pattern' } />
            alternatives[]$: []
            alternatives[]$:
            <$Alternative>
              elements[]$: []
            </>
            separatorTokens[]: []
            closeToken: <*Punctuator '/' { balancer: true } />
            flags$:
            <$Flags { global: false, ignoreCase: true, multiline: false, dotAll: false, unicode: false, sticky: false }>
              tokens[]: []
              tokens[]: <*Keyword 'i' />
            </>
          </>
        </>\n`);
    });
  });
});
