import {
  ArrowRight,
  Blocks,
  Database,
  LayoutPanelTop,
  LucideIcon,
  Rocket,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { cn } from "@/lib/utils";

export interface Hero36Card {
  title: string;
  description: string;
  image?: Hero36Image;
  icon?: Hero36IconName | React.ReactNode;
  href?: string;
  openInNewTab?: boolean;
}
export interface Hero36Image {
  src: string;
  alt: string;
  srcDark?: string;
}
export interface Hero36Badge {
  text: string;
  announcement?: string;
  url?: string;
}

export interface Hero36Props {
  badge?: Hero36Badge;
  heading: string;
  description?: string;
  cards: Hero36Card[];
  className?: string;
}

type Props = Partial<Hero36Props>;

const hero36Icons = {
  blocks: Blocks,
  database: Database,
  layout: LayoutPanelTop,
  rocket: Rocket,
} satisfies Record<string, LucideIcon>;

export type Hero36IconName = keyof typeof hero36Icons;

const isHero36IconName = (value: string): value is Hero36IconName =>
  value in hero36Icons;

const defaultProps: Hero36Props = {
  badge: { text: "New Release" },
  heading: "Blocks Built With Shadcn & Tailwind",
  description:
    "Finely crafted components built with React, Tailwind and shadcn/ui. Developers can copy and paste these blocks directly into their project.",
  cards: [
    {
      title: "Page Builder",
      description:
        "Compose reusable landing page sections with a polished hero, card layouts, and clear calls to action.",
      icon: "layout",
    },
    {
      title: "Typed CMS",
      description:
        "Model content in Payload and keep your frontend aligned with generated TypeScript types.",
      icon: "database",
    },
    {
      title: "Fast Launches",
      description:
        "Ship quickly with Next.js, Tailwind, shadcn/ui, and a clean Payload starter foundation.",
      icon: "rocket",
    },
  ],
};

const renderCardVisual = (card: Hero36Card) => {
  if (card.image) {
    return (
      <div className="mb-6 flex aspect-square w-16 items-center justify-center overflow-hidden rounded-lg md:w-20 lg:mb-8">
        <img
          src={card.image.src}
          alt={card.image.alt}
          className="h-full w-full object-cover object-center"
        />
      </div>
    );
  }

  if (typeof card.icon === "string") {
    const Icon = isHero36IconName(card.icon) ? hero36Icons[card.icon] : null;

    if (Icon) {
      return (
        <div className="mb-6 flex size-16 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary md:size-20 lg:mb-8">
          <Icon className="size-8 md:size-10" />
        </div>
      );
    }
  }

  if (card.icon) {
    return (
      <div className="mb-6 flex size-16 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary md:size-20 lg:mb-8">
        {card.icon}
      </div>
    );
  }

  return null;
};

const Hero36 = (props: Props) => {
  const { badge, heading, description, cards, className } = {
    ...defaultProps,
    ...props,
  };

  return (
    <section
      className={cn(
        "relative overflow-hidden bg-accent py-24 md:py-32",
        className,
      )}
    >
      <div className="absolute inset-0 opacity-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)]"></div>
      </div>
      <div className="relative container flex flex-col items-center text-center">
        {badge && (
          <Badge
            variant="outline"
            className="px-4 py-1.5 text-xs font-medium uppercase"
          >
            {badge.text}
          </Badge>
        )}
        <h1 className="my-4 max-w-3xl text-2xl font-bold text-pretty sm:text-4xl md:my-6 lg:text-5xl">
          {heading}
        </h1>
        {description && (
          <p className="max-w-2xl text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="container mt-12 grid gap-6 md:mt-16 md:grid-cols-3 md:gap-8">
        {cards.slice(0, 3).map((item, index) => (
          <a
            key={index}
            href={item.href ?? "#"}
            target={item.openInNewTab ? "_blank" : undefined}
            rel={item.openInNewTab ? "noreferrer noopener" : undefined}
            className={cn(
              "relative flex flex-col items-center rounded-xl border bg-background/70 px-6 py-10 text-center backdrop-blur-sm lg:px-8 lg:py-12",
              index === 1 && "md:translate-y-4",
            )}
          >
            {renderCardVisual(item)}
            <h3 className="mb-3 text-lg font-semibold md:text-xl">
              {item.title}
            </h3>
            <p className="mb-auto text-sm text-muted-foreground">
              {item.description}
            </p>
            <div className="mt-8 flex items-center text-primary md:mt-10">
              <span className="font-medium">See more</span>
              <ArrowRight className="ml-2 size-4" />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

export { Hero36 };
