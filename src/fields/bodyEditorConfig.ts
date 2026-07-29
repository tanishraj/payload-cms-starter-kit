import {
  AlignFeature,
  BlockquoteFeature,
  BoldFeature,
  ChecklistFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  IndentFeature,
  InlineCodeFeature,
  InlineToolbarFeature,
  ItalicFeature,
  lexicalEditor,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  StrikethroughFeature,
  UnderlineFeature,
  UnorderedListFeature,
  UploadFeature,
} from '@payloadcms/richtext-lexical'

/**
 * Shared Lexical editor for article/news-event body fields.
 *
 * Includes a fixed top toolbar plus the full set of writing-focused features:
 * headings H2–H4, inline formatting, lists, blockquote, links, inline images,
 * horizontal rule, alignment, and indentation.
 *
 * H1 is intentionally excluded — the document title field serves that role.
 * Font-family, font-size, and colour pickers are excluded to keep the writing
 * experience clean and consistent with the site's typography system.
 */
export const bodyEditor = lexicalEditor({
  features: [
    // Structure
    ParagraphFeature(),
    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
    BlockquoteFeature(),
    HorizontalRuleFeature(),

    // Inline formatting
    BoldFeature(),
    ItalicFeature(),
    UnderlineFeature(),
    StrikethroughFeature(),
    InlineCodeFeature(),

    // Lists
    OrderedListFeature(),
    UnorderedListFeature(),
    ChecklistFeature(),

    // Links & media
    LinkFeature({ enabledCollections: ['pages'] }),
    UploadFeature({ enabledCollections: ['media'] }),

    // Layout
    AlignFeature(),
    IndentFeature(),

    // Toolbars — FixedToolbarFeature renders the persistent top bar
    FixedToolbarFeature(),
    InlineToolbarFeature(),
  ],
})
