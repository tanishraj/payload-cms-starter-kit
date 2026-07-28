# Site Search Guide

## What This Section Is

The website has a built-in full-text search that lets visitors find pages, articles, and news and events quickly. There is no configuration required in the CMS to enable search — it is always active.

## How Search Works For Visitors

Visitors can reach search in two ways:

**Keyboard shortcut** — pressing `Cmd+K` (Mac) or `Ctrl+K` (Windows and Linux) opens a search dialog anywhere on the website. The dialog shows instant results as the visitor types, with keyboard navigation using the arrow keys and Enter to open a result.

**Search page** — visiting `/search` directly, or clicking the search icon in the site header, opens a full search results page. Results are grouped and labelled by content type.

Both surfaces search across:
- public pages
- published articles
- published news and events

## What Search Finds

Search matches against:

| Content type | Fields searched |
|---|---|
| Pages | Title |
| Articles | Title, excerpt, author name |
| News and Events | Title, excerpt |

Search requires at least two characters before returning results.

## How It Connects To The Website

The search dialog is embedded in the site layout and is available on every page without any configuration. The search icon appears automatically in the site header next to the navigation.

Search results link directly to the relevant content page. Clicking a result from the dialog or the search page takes the visitor straight to that article, news entry, or page.

Search is not indexed by Google because it is a dynamic query surface (`robots: noindex` is set on the `/search` page).

## Google Sitelinks Search Box

The website includes a `WebSite` structured data schema with a `SearchAction` that tells Google about the search endpoint. When Google indexes the website, it may display a search box directly in search results that sends queries to the website's `/search` page. This is a passive SEO benefit with no required CMS configuration.

## Step-By-Step Medical College Example

A prospective student wants to find all content about the admissions process:

1. They press `Cmd+K` from any page on the North Valley Medical College website.
2. They type `admissions`.
3. The dialog instantly shows matching pages, articles, and news entries.
4. They click the most relevant result.

The visitor found the content without needing to use the navigation.

## Best Practices

- keep article titles and excerpts clear and specific — these are the primary fields that search matches against
- use consistent terminology in titles and excerpts across related content so search returns a coherent result set
- publish an excerpt on every article and news entry because the search results display the excerpt as the result description

## Common Mistakes And Recovery

- search results appear empty for content that has not been published — draft content is not searchable
- search does not return results for media files, PDF downloads, or embedded content — it only searches the text fields listed above
- if a recently published page does not appear in search, wait a few seconds and try again — there is no indexing delay but the database query runs live

## Related Guides

- [Pages](./pages.md)
- [Articles](./articles.md)
