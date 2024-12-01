import { buildTag, Context, AgastContext } from 'bablr';
import { spam } from '@bablr/boot';
import { dedent } from '@qnighy/dedent';
import * as language from '@bablr/language-en-regex-vm-pattern';
import { debugEnhancers } from '@bablr/helpers/enhancers';
import { expect } from 'expect';
import { printPrettyCSTML } from '@bablr/helpers/tree';
import { buildIdentifier, buildString } from '@bablr/agast-vm-helpers';

let enhancers = {};

// enhancers = debugEnhancers;

const ctx = Context.from(AgastContext.create(), language, enhancers.bablrProduction);

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
        <!0:cstml bablr-language='https://bablr.org/languages/core/en/bablr-regex-pattern'>
        <$>
          .:
          <$Pattern>
            openToken: <*Punctuator '/' balanced='/' balancedSpan='Pattern' />
            alternatives[]$: []
            alternatives[]$:
            <$Alternative>
              elements[]$: []
            </>
            separators[]: []
            closeToken: <*Punctuator '/' balancer />
            flags$: <$Flags !global !ignoreCase !multiline !dotAll !unicode !sticky />
          </>
        </>\n`);
    });

    it('`/2/`', () => {
      expect(print(regex`/2/`)).toEqual(dedent`\
        <!0:cstml bablr-language='https://bablr.org/languages/core/en/bablr-regex-pattern'>
        <$>
          .:
          <$Pattern>
            openToken: <*Punctuator '/' balanced='/' balancedSpan='Pattern' />
            alternatives[]$: []
            alternatives[]$:
            <$Alternative>
              elements[]$: []
              elements[]$: <*+Character '2' />
            </>
            separators[]: []
            closeToken: <*Punctuator '/' balancer />
            flags$: <$Flags !global !ignoreCase !multiline !dotAll !unicode !sticky />
          </>
        </>\n`);
    });

    it('`/21/`', () => {
      expect(print(regex`/21/`)).toEqual(dedent`\
        <!0:cstml bablr-language='https://bablr.org/languages/core/en/bablr-regex-pattern'>
        <$>
          .:
          <$Pattern>
            openToken: <*Punctuator '/' balanced='/' balancedSpan='Pattern' />
            alternatives[]$: []
            alternatives[]$:
            <$Alternative>
              elements[]$: []
              elements[]$: <*+Character '2' />
              elements[]$: <*+Character '1' />
            </>
            separators[]: []
            closeToken: <*Punctuator '/' balancer />
            flags$: <$Flags !global !ignoreCase !multiline !dotAll !unicode !sticky />
          </>
        </>\n`);
    });

    it('`/1|2/`', () => {
      expect(print(regex`/1|2/`)).toEqual(dedent`\
        <!0:cstml bablr-language='https://bablr.org/languages/core/en/bablr-regex-pattern'>
        <$>
          .:
          <$Pattern>
            openToken: <*Punctuator '/' balanced='/' balancedSpan='Pattern' />
            alternatives[]$: []
            alternatives[]$:
            <$Alternative>
              elements[]$: []
              elements[]$: <*+Character '1' />
            </>
            separators[]: []
            separators[]: <*Punctuator '|' />
            alternatives[]$:
            <$Alternative>
              elements[]$: []
              elements[]$: <*+Character '2' />
            </>
            closeToken: <*Punctuator '/' balancer />
            flags$: <$Flags !global !ignoreCase !multiline !dotAll !unicode !sticky />
          </>
        </>\n`);
    });

    it('`/2+/`', () => {
      expect(print(regex`/2+/`)).toEqual(dedent`\
        <!0:cstml bablr-language='https://bablr.org/languages/core/en/bablr-regex-pattern'>
        <$>
          .:
          <$Pattern>
            openToken: <*Punctuator '/' balanced='/' balancedSpan='Pattern' />
            alternatives[]$: []
            alternatives[]$:
            <$Alternative>
              elements[]$: []
              elements[]$:
              <$Quantifier min=1 max=+Infinity>
                element$: <*+Character '2' />
                sigilToken: <*Keyword '+' />
              </>
            </>
            separators[]: []
            closeToken: <*Punctuator '/' balancer />
            flags$: <$Flags !global !ignoreCase !multiline !dotAll !unicode !sticky />
          </>
        </>\n`);
    });

    it('`/[-]/`', () => {
      expect(print(regex`/[-]/`)).toEqual(dedent`\
        <!0:cstml bablr-language='https://bablr.org/languages/core/en/bablr-regex-pattern'>
        <$>
          .:
          <$Pattern>
            openToken: <*Punctuator '/' balanced='/' balancedSpan='Pattern' />
            alternatives[]$: []
            alternatives[]$:
            <$Alternative>
              elements[]$: []
              elements[]$:
              <+$CharacterClass !negate>
                openToken: <*Punctuator '[' balancedSpan='CharacterClass' balanced=']' />
                negateToken: null
                elements[]$: []
                elements[]$: <*+Character '-' />
                closeToken: <*Punctuator ']' balancer />
              </>
            </>
            separators[]: []
            closeToken: <*Punctuator '/' balancer />
            flags$: <$Flags !global !ignoreCase !multiline !dotAll !unicode !sticky />
          </>
        </>\n`);
    });

    it('`/[--]/`', () => {
      expect(print(regex`/[--]/`)).toEqual(dedent`\
        <!0:cstml bablr-language='https://bablr.org/languages/core/en/bablr-regex-pattern'>
        <$>
          .:
          <$Pattern>
            openToken: <*Punctuator '/' balanced='/' balancedSpan='Pattern' />
            alternatives[]$: []
            alternatives[]$:
            <$Alternative>
              elements[]$: []
              elements[]$:
              <+$CharacterClass !negate>
                openToken: <*Punctuator '[' balancedSpan='CharacterClass' balanced=']' />
                negateToken: null
                elements[]$: []
                elements[]$: <*+Character '-' />
                elements[]$: <*+Character '-' />
                closeToken: <*Punctuator ']' balancer />
              </>
            </>
            separators[]: []
            closeToken: <*Punctuator '/' balancer />
            flags$: <$Flags !global !ignoreCase !multiline !dotAll !unicode !sticky />
          </>
        </>\n`);
    });

    it('`/[---]/`', () => {
      expect(print(regex`/[---]/`)).toEqual(dedent`\
        <!0:cstml bablr-language='https://bablr.org/languages/core/en/bablr-regex-pattern'>
        <$>
          .:
          <$Pattern>
            openToken: <*Punctuator '/' balanced='/' balancedSpan='Pattern' />
            alternatives[]$: []
            alternatives[]$:
            <$Alternative>
              elements[]$: []
              elements[]$:
              <+$CharacterClass !negate>
                openToken: <*Punctuator '[' balancedSpan='CharacterClass' balanced=']' />
                negateToken: null
                elements[]$: []
                elements[]$:
                <+$CharacterClassRange>
                  min$: <*+Character '-' />
                  sigilToken: <*Punctuator '-' />
                  max$: <*+Character '-' />
                </>
                closeToken: <*Punctuator ']' balancer />
              </>
            </>
            separators[]: []
            closeToken: <*Punctuator '/' balancer />
            flags$: <$Flags !global !ignoreCase !multiline !dotAll !unicode !sticky />
          </>
        </>\n`);
    });

    it('`//i`', () => {
      expect(print(regex`//i`)).toEqual(dedent`\
        <!0:cstml bablr-language='https://bablr.org/languages/core/en/bablr-regex-pattern'>
        <$>
          .:
          <$Pattern>
            openToken: <*Punctuator '/' balanced='/' balancedSpan='Pattern' />
            alternatives[]$: []
            alternatives[]$:
            <$Alternative>
              elements[]$: []
            </>
            separators[]: []
            closeToken: <*Punctuator '/' balancer />
            flags$:
            <$Flags !global ignoreCase !multiline !dotAll !unicode !sticky>
              tokens[]: []
              tokens[]: <*Keyword 'i' />
            </>
          </>
        </>\n`);
    });

    it('`//mi`', () => {
      expect(print(regex`//mi`)).toEqual(dedent`\
        <!0:cstml bablr-language='https://bablr.org/languages/core/en/bablr-regex-pattern'>
        <$>
          .:
          <$Pattern>
            openToken: <*Punctuator '/' balanced='/' balancedSpan='Pattern' />
            alternatives[]$: []
            alternatives[]$:
            <$Alternative>
              elements[]$: []
            </>
            separators[]: []
            closeToken: <*Punctuator '/' balancer />
            flags$:
            <$Flags !global ignoreCase multiline !dotAll !unicode !sticky>
              tokens[]: []
              tokens[]: <*Keyword 'm' />
              tokens[]: <*Keyword 'i' />
            </>
          </>
        </>\n`);
    });

    it('`/\\W/`', () => {
      expect(print(regex`/\W/`)).toEqual(dedent`\
        <!0:cstml bablr-language='https://bablr.org/languages/core/en/bablr-regex-pattern'>
        <$>
          .:
          <$Pattern>
            openToken: <*Punctuator '/' balanced='/' balancedSpan='Pattern' />
            alternatives[]$: []
            alternatives[]$:
            <$Alternative>
              elements[]$: []
              elements[]$:
              <+$WordCharacterSet negate>
                escapeToken: <*Punctuator '${'\\\\'}' />
                value: <*Keyword 'W' />
              </>
            </>
            separators[]: []
            closeToken: <*Punctuator '/' balancer />
            flags$: <$Flags !global !ignoreCase !multiline !dotAll !unicode !sticky />
          </>
        </>\n`);
    });

    it('`/\\g/`', () => {
      expect(print(regex`/\g/`)).toEqual(dedent`\
        <!0:cstml bablr-language='https://bablr.org/languages/core/en/bablr-regex-pattern'>
        <$>
          .:
          <$Pattern>
            openToken: <*Punctuator '/' balanced='/' balancedSpan='Pattern' />
            alternatives[]$: []
            alternatives[]$:
            <$Alternative>
              elements[]$: []
              elements[]$:
              <+$Gap>
                escapeToken: <*Punctuator '${'\\\\'}' />
                value: <*Keyword 'g' />
              </>
            </>
            separators[]: []
            closeToken: <*Punctuator '/' balancer />
            flags$: <$Flags !global !ignoreCase !multiline !dotAll !unicode !sticky />
          </>
        </>\n`);
    });

    it('`/\\</`', () => {
      expect(print(regex`/\</`)).toEqual(dedent`\
        <!0:cstml bablr-language='https://bablr.org/languages/core/en/bablr-regex-pattern'>
        <$>
          .:
          <$Pattern>
            openToken: <*Punctuator '/' balanced='/' balancedSpan='Pattern' />
            alternatives[]$: []
            alternatives[]$:
            <$Alternative>
              elements[]$: []
              elements[]$:
              <*+Character>
                <@EscapeSequence cooked='<'>
                  escape: <*Punctuator '${'\\\\'}' openSpan='Escape' />
                  code: <*Keyword '<' closeSpan='Escape' />
                </>
              </>
            </>
            separators[]: []
            closeToken: <*Punctuator '/' balancer />
            flags$: <$Flags !global !ignoreCase !multiline !dotAll !unicode !sticky />
          </>
        </>\n`);
    });

    it('`//<gåp>`', () => {
      const flags = buildRegexTag('Flags')`i`;
      expect(print(regex`//${flags}`)).toEqual(dedent`\
        <!0:cstml bablr-language='https://bablr.org/languages/core/en/bablr-regex-pattern'>
        <$>
          .:
          <$Pattern>
            openToken: <*Punctuator '/' balanced='/' balancedSpan='Pattern' />
            alternatives[]$: []
            alternatives[]$:
            <$Alternative>
              elements[]$: []
            </>
            separators[]: []
            closeToken: <*Punctuator '/' balancer />
            flags$:
            <$Flags !global ignoreCase !multiline !dotAll !unicode !sticky>
              tokens[]: []
              tokens[]: <*Keyword 'i' />
            </>
          </>
        </>\n`);
    });
  });
});
