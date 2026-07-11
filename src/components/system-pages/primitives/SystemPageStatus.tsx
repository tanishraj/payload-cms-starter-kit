export function SystemPageStatus({
  children,
  className,
}: {
  children: string
  className?: string
}) {
  return (
    <div
      className={[
        'animate-[fade-in_.7s_ease-out_both] font-semibold leading-none tracking-tight text-foreground/20',
        className ?? 'text-[clamp(4.5rem,18vw,8rem)]',
      ]
        .join(' ')
        .trim()}
    >
      {children}
    </div>
  )
}
