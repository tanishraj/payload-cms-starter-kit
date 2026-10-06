import { useLayoutEffect } from 'react'
import type { Decorator } from '@storybook/nextjs-vite'
import websiteCSS from './website.css?inline'

let mountedWebsiteStories = 0
let previousTheme: string | null = null
let websiteStyle: HTMLStyleElement | null = null

function WebsiteStyles() {
  useLayoutEffect(() => {
    const root = document.documentElement
    if (mountedWebsiteStories === 0) {
      previousTheme = root.getAttribute('data-theme-color')
      root.setAttribute('data-theme-color', 'snmih-blue')
      websiteStyle = document.createElement('style')
      websiteStyle.dataset.storybookWebsiteStyles = 'true'
      websiteStyle.textContent = websiteCSS
      document.head.append(websiteStyle)
    }
    mountedWebsiteStories += 1
    return () => {
      mountedWebsiteStories -= 1
      if (mountedWebsiteStories === 0) {
        websiteStyle?.remove()
        websiteStyle = null
        if (previousTheme === null) root.removeAttribute('data-theme-color')
        else root.setAttribute('data-theme-color', previousTheme)
      }
    }
  }, [])
  return null
}

/** Production CSS exists only while an existing website block is mounted. */
export const withWebsiteBlockStyles: Decorator = (Story, context) =>
  context.parameters.websiteBlock ? (
    <>
      <WebsiteStyles />
      <Story />
    </>
  ) : (
    <Story />
  )
