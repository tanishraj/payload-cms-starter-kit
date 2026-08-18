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
 * Project-owned editors share one writing feature set. H1 remains reserved for
 * the surrounding document title; toolbar variants change only the Admin UI.
 */
type ProjectEditorToolbar = 'fixed' | 'inline'

const createProjectEditor = (toolbar: ProjectEditorToolbar) =>
  lexicalEditor({
    ...(toolbar === 'fixed'
      ? {
          admin: {
            hideGutter: true,
            hideAddBlockButton: true,
            hideDraggableBlockElement: true,
            hideInsertParagraphAtEnd: true,
          },
        }
      : {}),
    features: [
      ParagraphFeature(),
      HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4', 'h5', 'h6'] }),
      BlockquoteFeature(),
      HorizontalRuleFeature(),
      BoldFeature(),
      ItalicFeature(),
      UnderlineFeature(),
      StrikethroughFeature(),
      InlineCodeFeature(),
      OrderedListFeature(),
      UnorderedListFeature(),
      ChecklistFeature(),
      LinkFeature({ enabledCollections: ['pages'] }),
      UploadFeature({ enabledCollections: ['media'] }),
      AlignFeature(),
      IndentFeature(),
      toolbar === 'fixed' ? FixedToolbarFeature() : InlineToolbarFeature(),
    ],
  })

export const bodyEditor = createProjectEditor('fixed')
export const embeddedContentEditor = createProjectEditor('inline')
