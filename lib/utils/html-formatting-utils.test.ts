import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  renderBoldHtml,
  renderItalicHtml,
  renderUnderlineHtml,
  renderStrikethroughHtml,
  renderSpoilerHtml,
  renderInlineCodeHtml,
  renderCodeBlockHtml,
  renderUserMentionHtml,
  renderChannelMentionHtml,
  renderHyperlinkHtml,
  renderLinkHtml,
  formatContentAsHtml,
  renderEmbedAsHtml,
} from './html-formatting-utils.ts';
import type { Embed } from '../types/discord-types.ts';
import { EmbedType } from '../enum/discord-enum.ts';

// Mock highlight.js
vi.mock('highlight.js', () => ({
  default: {
    highlight: vi.fn((code: string) => ({ value: `<highlighted>${code}</highlighted>` })),
    highlightAuto: vi.fn((code: string) => ({ value: `<auto-highlighted>${code}</auto-highlighted>` })),
  },
}));

describe('html-formatting-utils', () => {
  describe('Basic Formatting Renderers', () => {
    it('should render bold HTML', () => {
      const result = renderBoldHtml('bold text');
      expect(result).toBe('<strong>bold text</strong>');
    });

    it('should render italic HTML', () => {
      const result = renderItalicHtml('italic text');
      expect(result).toBe('<em>italic text</em>');
    });

    it('should render underline HTML', () => {
      const result = renderUnderlineHtml('underlined text');
      expect(result).toBe('<u>underlined text</u>');
    });

    it('should render strikethrough HTML', () => {
      const result = renderStrikethroughHtml('strikethrough text');
      expect(result).toBe('<del>strikethrough text</del>');
    });

    it('should render spoiler HTML with click handler', () => {
      const result = renderSpoilerHtml('spoiler text');
      expect(result).toContain('<span class="spoiler"');
      expect(result).toContain('onclick');
      expect(result).toContain('spoiler text');
    });
  });

  describe('Code Rendering', () => {
    it('should render inline code with HTML escaping', () => {
      const result = renderInlineCodeHtml('const x = 1;');
      expect(result).toBe('<code class="inline-code">const x = 1;</code>');
    });

    it('should escape HTML in inline code', () => {
      const result = renderInlineCodeHtml('<script>alert("xss")</script>');
      expect(result).toContain('&lt;script&gt;');
      expect(result).toContain('&lt;/script&gt;');
      expect(result).not.toContain('<script>');
    });

    it('should render code block with language', () => {
      const result = renderCodeBlockHtml('const x = 1;', 'javascript');
      expect(result).toContain('<pre class="code-block">');
      expect(result).toContain('<code>');
      expect(result).toContain('</code></pre>');
    });

    it('should render code block without language', () => {
      const result = renderCodeBlockHtml('const x = 1;');
      expect(result).toContain('<pre class="code-block">');
      expect(result).toContain('<code>');
    });

    it('should handle invalid language gracefully', () => {
      const result = renderCodeBlockHtml('some code', 'invalid-language');
      expect(result).toContain('<pre class="code-block">');
      expect(result).toContain('<code>');
    });
  });

  describe('Mention Rendering', () => {
    it('should render user mention', () => {
      const result = renderUserMentionHtml('123', 'alice');
      expect(result).toBe('<span class="user-mention" data-user-id="123">@alice</span>');
    });

    it('should escape HTML in user mention name', () => {
      const result = renderUserMentionHtml('123', '<script>alert("xss")</script>');
      expect(result).toContain('&lt;script&gt;');
      expect(result).not.toContain('<script>');
    });

    it('should render channel mention', () => {
      const result = renderChannelMentionHtml('456', 'general');
      expect(result).toBe('<span class="channel-mention" data-channel-id="456"># general</span>');
    });

    it('should escape HTML in channel mention name', () => {
      const result = renderChannelMentionHtml('456', '<img src=x onerror=alert(1)>');
      expect(result).toContain('&lt;img');
      expect(result).not.toContain('<img');
    });
  });

  describe('Link Rendering', () => {
    it('should render hyperlink with security attributes', () => {
      const result = renderHyperlinkHtml('https://example.com');
      expect(result).toContain('href="https://example.com"');
      expect(result).toContain('target="_blank"');
      expect(result).toContain('rel="noopener noreferrer"');
    });

    it('should escape HTML in hyperlink URL', () => {
      const result = renderHyperlinkHtml('https://example.com?param=<script>');
      expect(result).toContain('&lt;script&gt;');
      expect(result).not.toContain('<script>');
    });

    it('should render markdown link', () => {
      const result = renderLinkHtml('https://example.com', 'Click here');
      expect(result).toContain('href="https://example.com"');
      expect(result).toContain('>Click here</a>');
      expect(result).toContain('target="_blank"');
      expect(result).toContain('rel="noopener noreferrer"');
    });

    it('should render markdown link with title', () => {
      const result = renderLinkHtml('https://example.com', 'Click here', 'A website');
      expect(result).toContain('title="A website"');
    });

    it('should escape HTML in markdown link', () => {
      const result = renderLinkHtml('https://example.com', '<script>xss</script>', '<script>');
      expect(result).toContain('&lt;script&gt;');
      expect(result).not.toContain('<script>xss</script>');
    });
  });

  describe('formatContentAsHtml', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should handle empty content', () => {
      const result = formatContentAsHtml('', {
        userMap: {},
        channelMap: {},
      });
      expect(result).toBe('');
    });

    it('should handle plain text', () => {
      const result = formatContentAsHtml('Hello world', {
        userMap: {},
        channelMap: {},
      });
      expect(result).toBe('Hello world');
    });

    it('should format bold text', () => {
      const result = formatContentAsHtml('This is **bold** text', {
        userMap: {},
        channelMap: {},
      });
      expect(result).toContain('<strong>bold</strong>');
    });

    it('should format italic text', () => {
      const result = formatContentAsHtml('This is _italic_ text', {
        userMap: {},
        channelMap: {},
      });
      expect(result).toContain('<em>italic</em>');
    });

    it('should format underlined text', () => {
      const result = formatContentAsHtml('This is __underlined__ text', {
        userMap: {},
        channelMap: {},
      });
      expect(result).toContain('<u>underlined</u>');
    });

    it('should format strikethrough text', () => {
      const result = formatContentAsHtml('This is ~~crossed~~ text', {
        userMap: {},
        channelMap: {},
      });
      expect(result).toContain('<del>crossed</del>');
    });

    it('should format spoiler text', () => {
      const result = formatContentAsHtml('This is ||spoiler|| text', {
        userMap: {},
        channelMap: {},
      });
      expect(result).toContain('<span class="spoiler"');
      expect(result).toContain('spoiler');
    });

    it('should format inline code', () => {
      const result = formatContentAsHtml('Use `console.log()` here', {
        userMap: {},
        channelMap: {},
      });
      expect(result).toContain('<code class="inline-code">console.log()</code>');
    });

    it('should format code blocks', () => {
      const result = formatContentAsHtml('```javascript\nconst x = 1;```', {
        userMap: {},
        channelMap: {},
      });
      expect(result).toContain('<pre class="code-block">');
      expect(result).toContain('<code>');
    });

    it('should format hyperlinks', () => {
      const result = formatContentAsHtml('Visit https://example.com now', {
        userMap: {},
        channelMap: {},
      });
      expect(result).toContain('href="https://example.com"');
      expect(result).toContain('target="_blank"');
    });

    it('should format markdown links', () => {
      const result = formatContentAsHtml('[Click here](https://example.com)', {
        userMap: {},
        channelMap: {},
      });
      expect(result).toContain('href="https://example.com"');
      expect(result).toContain('>Click here</a>');
    });

    it('should format user mentions', () => {
      const result = formatContentAsHtml('Hello <@123>', {
        userMap: {
          '123': { userName: 'alice', displayName: 'Alice' },
        },
        channelMap: {},
      });
      expect(result).toContain('<span class="user-mention"');
      expect(result).toContain('data-user-id="123"');
      expect(result).toContain('@Alice');
    });

    it('should format channel mentions', () => {
      const result = formatContentAsHtml('Check <#456>', {
        userMap: {},
        channelMap: {
          '456': { id: '456', name: 'general' },
        },
      });
      expect(result).toContain('<span class="channel-mention"');
      expect(result).toContain('data-channel-id="456"');
      expect(result).toContain('# general');
    });

    it('should handle unknown channel', () => {
      const result = formatContentAsHtml('Check <#999>', {
        userMap: {},
        channelMap: {},
      });
      expect(result).toContain('unknown-channel');
    });

    it('should handle multiple formatting types', () => {
      const result = formatContentAsHtml('**Bold** and _italic_ text', {
        userMap: {},
        channelMap: {},
      });
      expect(result).toContain('<strong>Bold</strong>');
      expect(result).toContain('<em>italic</em>');
    });
  });

  describe('formatContentAsHtml — HTML safety (#198)', () => {
    // Bot embeds (and any user message) can include raw HTML in the
    // content. Before the fix, formatContentAsHtml never escaped < > & " '
    // so raw <div> in user content cascaded into the export, unbalancing
    // the message-text wrapper and tiling subsequent messages horizontally.
    const ctx = { userMap: {}, channelMap: {} };

    it('escapes a raw <div> in user content', () => {
      const out = formatContentAsHtml('hello <div>x</div> world', ctx);
      expect(out).not.toMatch(/<div>/);
      expect(out).toContain('&lt;div&gt;');
      expect(out).toContain('&lt;/div&gt;');
    });

    it('escapes unclosed raw <div>', () => {
      const out = formatContentAsHtml('hi <div>unclosed', ctx);
      expect(out).not.toMatch(/<div>/);
      expect(out).toContain('&lt;div&gt;');
    });

    it('escapes a raw <script> tag', () => {
      const out = formatContentAsHtml('<script>alert(1)</script>', ctx);
      expect(out).not.toMatch(/<script>/);
      expect(out).toContain('&lt;script&gt;');
    });

    it('escapes raw & in plain content', () => {
      const out = formatContentAsHtml('Tom & Jerry', ctx);
      expect(out).toContain('Tom &amp; Jerry');
    });

    it('escapes raw " and \' in plain content', () => {
      const out = formatContentAsHtml(`she said "hi" and 'bye'`, ctx);
      expect(out).toContain('&quot;hi&quot;');
      expect(out).toContain('&#039;bye&#039;');
    });

    it('preserves user mentions (uses literal <@id>)', () => {
      const out = formatContentAsHtml(
        'hi <@123>',
        { userMap: { '123': { userName: 'alice', displayName: 'Alice' } }, channelMap: {} },
      );
      expect(out).toContain('class="user-mention"');
      expect(out).toContain('@Alice');
      expect(out).not.toContain('<@123>'); // The raw tag should be consumed.
    });

    it('preserves channel mentions (uses literal <#id>)', () => {
      const out = formatContentAsHtml(
        'see <#987>',
        { userMap: {}, channelMap: { '987': { name: 'general' } } },
      );
      expect(out).toContain('class="channel-mention"');
      expect(out).toContain('general');
    });

    it('preserves auto-link URLs (uses literal <https://...>)', () => {
      const out = formatContentAsHtml('go <https://example.com> now', ctx);
      expect(out).toMatch(/<a [^>]*href="https:\/\/example\.com"/);
    });

    it('preserves custom emoji (uses literal <:name:id>)', () => {
      const out = formatContentAsHtml('hi <:smile:111>', { userMap: {}, channelMap: {}, emojiMap: {} });
      expect(out).toContain('<img class="emoji"');
      expect(out).toContain(':smile:');
    });

    it('preserves animated custom emoji (uses literal <a:name:id>)', () => {
      const out = formatContentAsHtml('hi <a:wave:222>', { userMap: {}, channelMap: {}, emojiMap: {} });
      expect(out).toContain('<img class="emoji"');
    });

    it('does not double-escape inline code containing HTML', () => {
      const out = formatContentAsHtml('use `<div>` here', ctx);
      // Inline code escapes once; result should be &lt;div&gt; not &amp;lt;div&amp;gt;
      expect(out).toContain('<code class="inline-code">&lt;div&gt;</code>');
      expect(out).not.toContain('&amp;lt;');
    });

    it('does not double-escape code blocks containing HTML', () => {
      const out = formatContentAsHtml('```\n<div>x</div>\n```', ctx);
      // Code blocks go through hljs which escapes; final output should not double escape.
      expect(out).not.toContain('&amp;lt;');
    });

    it('handles markdown bold combined with raw HTML safely', () => {
      const out = formatContentAsHtml('**bold <div> text**', ctx);
      expect(out).toContain('<strong>');
      expect(out).toContain('&lt;div&gt;');
      expect(out).not.toMatch(/<div>/);
    });

    it('survives a content string that looks like a closing tag only', () => {
      const out = formatContentAsHtml('</div></div></div>', ctx);
      expect(out).not.toMatch(/<\/div>/);
      expect(out).toContain('&lt;/div&gt;');
    });
  });

  describe('renderEmbedAsHtml', () => {
    it('should render minimal embed', () => {
      const embed: Embed = {
        type: EmbedType.RICH,
      };

      const result = renderEmbedAsHtml(embed);

      expect(result).toContain('<div class="embed"');
      expect(result).toContain('</div>');
    });

    it('should render embed with title', () => {
      const embed: Embed = {
        type: EmbedType.RICH,
        title: 'Test Title',
      };

      const result = renderEmbedAsHtml(embed);

      expect(result).toContain('class="embed-title"');
      expect(result).toContain('Test Title');
    });

    it('should render embed with clickable title', () => {
      const embed: Embed = {
        type: EmbedType.RICH,
        title: 'Test Title',
        url: 'https://example.com',
      };

      const result = renderEmbedAsHtml(embed);

      expect(result).toContain('href="https://example.com"');
      expect(result).toContain('Test Title');
    });

    it('should render embed with description', () => {
      const embed: Embed = {
        type: EmbedType.RICH,
        description: 'Test description',
      };

      const result = renderEmbedAsHtml(embed);

      expect(result).toContain('class="embed-description"');
      expect(result).toContain('Test description');
    });

    it('should render embed with author', () => {
      const embed: Embed = {
        type: EmbedType.RICH,
        author: {
          name: 'Author Name',
          icon_url: 'https://example.com/icon.png',
        },
      };

      const result = renderEmbedAsHtml(embed);

      expect(result).toContain('class="embed-author"');
      expect(result).toContain('Author Name');
      expect(result).toContain('src="https://example.com/icon.png"');
    });

    it('should render embed with clickable author', () => {
      const embed: Embed = {
        type: EmbedType.RICH,
        author: {
          name: 'Author Name',
          url: 'https://author.com',
        },
      };

      const result = renderEmbedAsHtml(embed);

      expect(result).toContain('href="https://author.com"');
      expect(result).toContain('Author Name');
    });

    it('should render embed with fields', () => {
      const embed: Embed = {
        type: EmbedType.RICH,
        fields: [
          { name: 'Field 1', value: 'Value 1' },
          { name: 'Field 2', value: 'Value 2', inline: true },
        ],
      };

      const result = renderEmbedAsHtml(embed);

      expect(result).toContain('class="embed-fields"');
      expect(result).toContain('Field 1');
      expect(result).toContain('Value 1');
      expect(result).toContain('Field 2');
      expect(result).toContain('embed-field-inline');
    });

    it('should render embed with thumbnail', () => {
      const embed: Embed = {
        type: EmbedType.RICH,
        thumbnail: {
          url: 'https://example.com/thumb.png',
        },
      };

      const result = renderEmbedAsHtml(embed);

      expect(result).toContain('class="embed-thumbnail"');
      expect(result).toContain('src="https://example.com/thumb.png"');
    });

    it('should render embed with image', () => {
      const embed: Embed = {
        type: EmbedType.RICH,
        image: {
          url: 'https://example.com/image.png',
        },
      };

      const result = renderEmbedAsHtml(embed);

      expect(result).toContain('class="embed-image"');
      expect(result).toContain('src="https://example.com/image.png"');
    });

    it('should render embed with video', () => {
      const embed: Embed = {
        type: EmbedType.RICH,
        video: {
          url: 'https://example.com/video.mp4',
        },
      };

      const result = renderEmbedAsHtml(embed);

      expect(result).toContain('class="embed-video"');
      expect(result).toContain('src="https://example.com/video.mp4"');
      expect(result).toContain('<video');
    });

    it('should rewrite image/video/thumbnail URLs through mediaMap when provided', () => {
      const embed: Embed = {
        type: EmbedType.RICH,
        thumbnail: { url: 'https://media.tenor.com/abc/thumb.png' },
        image: { url: 'https://media.tenor.com/abc/image.png' },
        video: { url: 'https://media.tenor.com/abc/video.mp4' },
      };

      const result = renderEmbedAsHtml(embed, {
        mediaMap: {
          'https://media.tenor.com/abc/thumb.png': 'media/embed-thumbnails/1_1.png',
          'https://media.tenor.com/abc/image.png': 'media/embed-images/1_1.png',
          'https://media.tenor.com/abc/video.mp4': 'media/embed-videos/1_1.mp4',
        },
      });

      expect(result).toContain('src="media/embed-thumbnails/1_1.png"');
      expect(result).toContain('src="media/embed-images/1_1.png"');
      expect(result).toContain('src="media/embed-videos/1_1.mp4"');
      expect(result).not.toContain('https://media.tenor.com/');
    });

    it('should fall back to remote URL when mediaMap lookup misses', () => {
      const embed: Embed = {
        type: EmbedType.RICH,
        thumbnail: { url: 'https://media.tenor.com/missing/thumb.png' },
      };

      const result = renderEmbedAsHtml(embed, {
        mediaMap: {
          'https://media.tenor.com/other/thumb.png': 'media/embed-thumbnails/x.png',
        },
      });

      expect(result).toContain('src="https://media.tenor.com/missing/thumb.png"');
    });

    it('should behave identically to the no-options call when mediaMap is omitted', () => {
      const embed: Embed = {
        type: EmbedType.RICH,
        thumbnail: { url: 'https://example.com/thumb.png' },
        video: { url: 'https://example.com/video.mp4' },
      };

      const withoutOpts = renderEmbedAsHtml(embed);
      const withEmptyOpts = renderEmbedAsHtml(embed, {});

      expect(withoutOpts).toBe(withEmptyOpts);
      expect(withoutOpts).toContain('src="https://example.com/thumb.png"');
      expect(withoutOpts).toContain('src="https://example.com/video.mp4"');
    });

    it('should render embed with footer', () => {
      const embed: Embed = {
        type: EmbedType.RICH,
        footer: {
          text: 'Footer text',
          icon_url: 'https://example.com/footer-icon.png',
        },
      };

      const result = renderEmbedAsHtml(embed);

      expect(result).toContain('class="embed-footer"');
      expect(result).toContain('Footer text');
      expect(result).toContain('src="https://example.com/footer-icon.png"');
    });

    it('should render embed with timestamp', () => {
      const embed: Embed = {
        type: EmbedType.RICH,
        timestamp: '2024-01-15T12:00:00Z',
      };

      const result = renderEmbedAsHtml(embed);

      expect(result).toContain('class="embed-timestamp"');
      expect(result).toContain('2024');
    });

    it('should render embed with custom color', () => {
      const embed: Embed = {
        type: EmbedType.RICH,
        color: 16711680, // Red
      };

      const result = renderEmbedAsHtml(embed);

      expect(result).toContain('border-left: 4px solid #ff0000');
    });

    it('should use default color when not specified', () => {
      const embed: Embed = {
        type: EmbedType.RICH,
      };

      const result = renderEmbedAsHtml(embed);

      expect(result).toContain('border-left: 4px solid #7289da');
    });

    it('should respect includeImages option', () => {
      const embed: Embed = {
        type: EmbedType.RICH,
        image: {
          url: 'https://example.com/image.png',
        },
      };

      const result = renderEmbedAsHtml(embed, { includeImages: false });

      expect(result).not.toContain('class="embed-image"');
    });

    it('should respect includeVideos option', () => {
      const embed: Embed = {
        type: EmbedType.RICH,
        video: {
          url: 'https://example.com/video.mp4',
        },
      };

      const result = renderEmbedAsHtml(embed, { includeVideos: false });

      expect(result).not.toContain('class="embed-video"');
    });

    it('should escape HTML in embed content', () => {
      const embed: Embed = {
        type: EmbedType.RICH,
        title: '<script>alert("xss")</script>',
        description: '<img src=x onerror=alert(1)>',
      };

      const result = renderEmbedAsHtml(embed);

      expect(result).toContain('&lt;script&gt;');
      expect(result).toContain('&lt;img');
      expect(result).not.toContain('<script>alert');
      expect(result).not.toContain('<img src=x');
    });

    it('should render complete embed with all features', () => {
      const embed: Embed = {
        type: EmbedType.RICH,
        title: 'Full Embed',
        description: 'Complete description',
        url: 'https://example.com',
        color: 5814783,
        author: {
          name: 'Author',
          url: 'https://author.com',
          icon_url: 'https://author.com/icon.png',
        },
        thumbnail: {
          url: 'https://example.com/thumb.png',
        },
        image: {
          url: 'https://example.com/image.png',
        },
        fields: [
          { name: 'Field 1', value: 'Value 1' },
          { name: 'Field 2', value: 'Value 2', inline: true },
        ],
        footer: {
          text: 'Footer',
          icon_url: 'https://example.com/footer.png',
        },
        timestamp: '2024-01-15T12:00:00Z',
      };

      const result = renderEmbedAsHtml(embed);

      expect(result).toContain('Full Embed');
      expect(result).toContain('Complete description');
      expect(result).toContain('Author');
      expect(result).toContain('Field 1');
      expect(result).toContain('Footer');
      expect(result).toContain('embed-thumbnail');
      expect(result).toContain('embed-image');
    });
  });

  describe('renderEmbedAsHtml bare media embeds (#219)', () => {
    // Shapes taken from a live Discord capture of bare-URL unfurls.
    const bareImage: Embed = {
      type: EmbedType.IMAGE,
      url: 'https://cdn.7tv.app/emote/01FCY771D800007PQ2DF3GDTN6/4x.webp',
      thumbnail: {
        url: 'https://cdn.7tv.app/emote/01FCY771D800007PQ2DF3GDTN6/4x.webp',
        width: 128,
        height: 128,
      },
    };

    const gifv: Embed = {
      type: EmbedType.GIFV,
      url: 'https://tenor.com/view/tackle-mascot-gif-10629045',
      title: 'Tackle Mascot GIF - Discover & Share GIFs',
      provider: { name: 'Tenor', url: 'https://tenor.co' },
      thumbnail: { url: 'https://media1.tenor.com/m/x/tackle.gif', width: 444, height: 250 },
      video: { url: 'https://media.tenor.com/x/tackle.mp4', width: 444, height: 250 },
    };

    it('renders a bare image embed as a linked image with no card div', () => {
      const result = renderEmbedAsHtml(bareImage);
      expect(result).toContain('class="embed-image bare-embed-image"');
      expect(result).toContain('src="https://cdn.7tv.app/emote/01FCY771D800007PQ2DF3GDTN6/4x.webp"');
      expect(result).toContain('href="https://cdn.7tv.app/emote/01FCY771D800007PQ2DF3GDTN6/4x.webp"');
      expect(result).not.toContain('class="embed"');
      expect(result).not.toContain('border-left');
    });

    it('emits natural dimensions so stylesheets cannot upscale a small unfurl', () => {
      const result = renderEmbedAsHtml(bareImage);
      expect(result).toContain('width="128" height="128"');
    });

    it('caps emitted dimensions to the 400x300 inline box without upscaling', () => {
      const wide: Embed = {
        ...bareImage,
        thumbnail: { ...bareImage.thumbnail!, width: 1920, height: 1080 },
      };
      const result = renderEmbedAsHtml(wide);
      // 1920x1080 scaled by min(400/1920, 300/1080) = 400x225.
      expect(result).toContain('width="400" height="225"');
    });

    it('omits dimension attributes when the capture has none', () => {
      const dimless: Embed = {
        ...bareImage,
        thumbnail: { url: bareImage.thumbnail!.url },
      };
      const result = renderEmbedAsHtml(dimless);
      expect(result).toContain('class="embed-image bare-embed-image"');
      expect(result).not.toContain('width=');
    });

    it('routes the bare image through mediaMap for offline exports', () => {
      const result = renderEmbedAsHtml(bareImage, {
        mediaMap: {
          'https://cdn.7tv.app/emote/01FCY771D800007PQ2DF3GDTN6/4x.webp':
            'media/embed-thumbnails/1_1.webp',
        },
      });
      expect(result).toContain('src="media/embed-thumbnails/1_1.webp"');
    });

    it('renders a gifv embed as a muted autoplay loop, hiding provider title and card', () => {
      const result = renderEmbedAsHtml(gifv);
      expect(result).toContain('class="embed-video"');
      expect(result).toContain('autoplay loop muted playsinline');
      expect(result).toContain('src="https://media.tenor.com/x/tackle.mp4"');
      expect(result).not.toContain('Tackle Mascot');
      expect(result).not.toContain('class="embed"');
    });

    it('falls back to the gif thumbnail when the gifv video is not directly playable', () => {
      const embed: Embed = {
        ...gifv,
        video: { url: 'https://tenor.com/embed/player/10629045' },
      };
      const result = renderEmbedAsHtml(embed);
      expect(result).not.toContain('<video');
      expect(result).toContain('class="embed-image');
      expect(result).toContain('src="https://media1.tenor.com/m/x/tackle.gif"');
    });

    it('plays a downloaded gifv video even when its remote URL is not directly playable', () => {
      // Mirrors the card path: a mediaMap hit is a local file, always
      // playable, so the extension check applies to remote URLs only.
      const embed: Embed = {
        ...gifv,
        video: { url: 'https://tenor.com/embed/player/10629045' },
      };
      const result = renderEmbedAsHtml(embed, {
        mediaMap: { 'https://tenor.com/embed/player/10629045': 'media/embed-videos/1_1.mp4' },
      });
      expect(result).toContain('<video');
      expect(result).toContain('src="media/embed-videos/1_1.mp4"');
    });

    it('keeps the card for an image-typed embed that carries real card content', () => {
      const embed: Embed = {
        ...bareImage,
        title: 'A bot made this',
        description: 'with actual card content',
      };
      const result = renderEmbedAsHtml(embed);
      expect(result).toContain('class="embed"');
      expect(result).toContain('A bot made this');
    });

    it('falls back to a plain source link when images are excluded', () => {
      const result = renderEmbedAsHtml(bareImage, { includeImages: false });
      expect(result).not.toContain('<img');
      expect(result).toContain('href="https://cdn.7tv.app/emote/01FCY771D800007PQ2DF3GDTN6/4x.webp"');
    });

    it('renders a card-embed player-page video URL as a watch link, not a broken <video> (#219 sweep)', () => {
      const embed: Embed = {
        type: EmbedType.VIDEO,
        title: 'Some YouTube video',
        url: 'https://www.youtube.com/watch?v=abc123',
        video: { url: 'https://www.youtube.com/embed/abc123' },
      };
      const result = renderEmbedAsHtml(embed);
      expect(result).not.toContain('<video');
      expect(result).toContain('class="embed-video-link"');
      expect(result).toContain('href="https://www.youtube.com/watch?v=abc123"');
    });

    it('still plays a card-embed video when mediaMap resolved it to a local file', () => {
      const embed: Embed = {
        type: EmbedType.VIDEO,
        title: 'Some video',
        video: { url: 'https://www.youtube.com/embed/abc123' },
      };
      const result = renderEmbedAsHtml(embed, {
        mediaMap: { 'https://www.youtube.com/embed/abc123': 'media/embed-videos/1_1.mp4' },
      });
      expect(result).toContain('<video');
      expect(result).toContain('src="media/embed-videos/1_1.mp4"');
    });
  });
});
