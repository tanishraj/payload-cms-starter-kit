import Link from 'next/link'
import { ArrowRight, Blocks, Layers3, ShieldCheck } from 'lucide-react'
import React from 'react'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getAdminPath } from '@/lib/payload'
import { getPageBySlug } from '@/lib/pages'

export default async function HomePage() {
  const page = await getPageBySlug('home')

  if (page) {
    return <RenderBlocks blocks={page.layout} />
  }

  const adminPath = await getAdminPath()

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,rgba(251,191,36,0.08),transparent_26%),radial-gradient(circle_at_top,rgba(234,88,12,0.16),transparent_40%),linear-gradient(180deg,#fffdf7_0%,#fffaf0_100%)]">
      <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div className="space-y-8">
            <Badge>Payload + Tailwind + shadcn-ready</Badge>
            <div className="space-y-5">
              <h1 className="max-w-4xl text-5xl font-semibold tracking-tighter text-balance sm:text-6xl lg:text-7xl">
                Your CMS is ready for shadcnblocks-backed page building.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
                Tailwind v4 is installed, shadcn-compatible styling is live, and a Payload Pages
                collection now renders block-based frontend sections through a dedicated React map.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href={adminPath}>
                  Open Payload admin
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="https://ui.shadcn.com/docs/installation/next">shadcn docs</Link>
              </Button>
            </div>
          </div>
          <Card className="overflow-hidden border-primary/15 bg-background/85">
            <CardHeader className="border-b border-border/60">
              <CardTitle>Next steps</CardTitle>
              <CardDescription>
                Create a page with slug <code className="font-mono">home</code> and add blocks from
                the new Pages collection.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="rounded-2xl border border-border/60 bg-secondary/35 p-4">
                <p className="text-sm font-medium">Environment</p>
                <p className="mt-1 text-sm leading-7 text-muted-foreground">
                  Add <code className="font-mono">SHADCNBLOCKS_API_KEY</code> to your local{' '}
                  <code className="font-mono">.env</code> when you are ready to pull private Pro
                  blocks.
                </p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-secondary/35 p-4">
                <p className="text-sm font-medium">Block location</p>
                <p className="mt-1 text-sm leading-7 text-muted-foreground">
                  Frontend block components live under{' '}
                  <code className="font-mono">src/blocks/&lt;BlockName&gt;</code>.
                </p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-secondary/35 p-4">
                <p className="text-sm font-medium">Renderer</p>
                <p className="mt-1 text-sm leading-7 text-muted-foreground">
                  Register each new Pro block once in{' '}
                  <code className="font-mono">src/blocks/RenderBlocks.tsx</code>.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Blocks />
              </div>
              <CardTitle>Page builder collection</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm leading-7">
                Payload now includes a <code className="font-mono">pages</code> collection with a{' '}
                <code className="font-mono">layout</code> blocks field and draft support.
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Layers3 />
              </div>
              <CardTitle>Tailwind v4 base</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm leading-7">
                The old starter CSS is gone. The frontend now runs on Tailwind tokens, utilities,
                and shadcn-style CSS variables.
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ShieldCheck />
              </div>
              <CardTitle>Safe integration path</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm leading-7">
                Pro blocks can be added incrementally without hardcoding secrets or rewriting the
                frontend routing structure.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
