export function SystemPageCopy({
  description,
  heading,
}: {
  description?: string | null
  heading: string
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <h1 className="max-w-2xl animate-[fade-in_.7s_ease-out_.12s_both] text-balance font-semibold leading-none tracking-tight text-foreground text-[clamp(2rem,8vw,3.75rem)]">
        {heading}
      </h1>
      {description ? (
        <p className="max-w-xl animate-[fade-in_.7s_ease-out_.2s_both] text-balance text-[clamp(1rem,2.6vw,1.125rem)] leading-7 text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  )
}
