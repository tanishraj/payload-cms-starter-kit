# Gallery Albums Guide

## What This Section Is

`Gallery Albums` stores ordered, versioned image sets for the `Event Gallery` page block. The first image is the album cover; the remaining order is the full-screen viewer order.

## Step-By-Step Medical College Example

1. Open `Gallery Albums` in `Media` and create `White Coat Ceremony 2026`.
2. Add an optional description and event date.
3. Add at least one image, write captions where useful, and drag rows into the intended viewing order.
4. Publish the album.
5. Edit a Page, add an `Event Gallery` block, and explicitly select the album.
6. Choose `Latest Event Date` or `Manual` display order and publish the Page.
7. Verify the cover card, image counter, captions, keyboard controls, thumbnails, and previous/next navigation.

## Important Behavior

- albums do not receive standalone public routes
- normal frontend rendering excludes draft albums
- the Event Gallery only loads albums selected on that block
- selecting `Manual` preserves the relationship order chosen in the block
- a referenced image cannot be deleted from Media until its album reference is removed

## Related Guides

- [Media](./media.md)
- [Pages](./pages.md)
- [Page Blocks](./blocks.md)
