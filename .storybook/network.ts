/** Storybook never connects its synthetic content to the CMS. */
if (typeof window !== 'undefined') {
  const fetch = window.fetch.bind(window)
  window.fetch = (input, init) => {
    const url = new URL(
      typeof input === 'string' ? input : input instanceof URL ? input.href : input.url,
      window.location.href,
    )
    if (url.origin === window.location.origin && url.pathname.startsWith('/api/')) {
      return Promise.resolve(
        Response.json(
          { error: 'CMS requests are unavailable in Storybook. No data was saved or sent.' },
          { status: 503 },
        ),
      )
    }
    return fetch(input, init)
  }
}
