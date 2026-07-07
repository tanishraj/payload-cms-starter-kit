"use client";

import type { LucideIcon } from "lucide-react";
import {
  Archive,
  Book,
  Calendar,
  DollarSign,
  FileText,
  Handshake,
  MenuIcon,
  PlayCircle,
  Sunset,
  Trees,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface MenuItem {
  title: string;
  url?: string;
  description?: string;
  icon?: LucideIcon;
  openInNewTab?: boolean;
  items?: MenuItem[];
}

interface NavbarLogo {
  url?: string;
  src?: string;
  alt?: string;
  title?: string;
}

interface NavbarButton {
  title: string;
  url: string;
  openInNewTab?: boolean;
}

interface DesktopNavigationMenuProps {
  handleMobileMenu: () => void;
  logo: NavbarLogo;
  navigationItems: MenuItem[];
  open: boolean;
  primaryButton: NavbarButton | null;
  secondaryButtons: NavbarButton[];
}

interface MobileNavigationMenuProps {
  primaryButton: NavbarButton | null;
  secondaryButtons: NavbarButton[];
  navigationItems: MenuItem[];
  open: boolean;
}

const LOGO = {
  url: "https://www.shadcnblocks.com",
  src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/block-1.svg",
  alt: "logo",
  title: "Shadcnblocks.com",
};

const PRIMARY_BUTTON = {
  title: "Sign up",
  url: "#",
};

const SECONDARY_BUTTONS = [
  {
    title: "Explore",
    url: "#",
  },
  {
    title: "Log in",
    url: "#",
  },
];

const NAVIGATION_GROUPS = [
  {
    title: "Products",
    items: [
      {
        title: "Blog",
        description: "Latest news & updates",
        icon: Book,
        url: "#",
      },
      {
        title: "Company",
        description: "Innovate and empower",
        icon: Trees,
        url: "#",
      },
      {
        title: "Careers",
        description: "Jobs and workplace",
        icon: Sunset,
        url: "#",
      },
      {
        title: "Support",
        description: "Help & community",
        icon: Zap,
        url: "#",
      },
      {
        title: "Pricing",
        description: "Plans and subscriptions",
        icon: DollarSign,
        url: "#",
      },
      {
        title: "Documentation",
        description: "Guides and API docs",
        icon: FileText,
        url: "#",
      },
      {
        title: "Tutorials",
        description: "Learn step-by-step",
        icon: PlayCircle,
        url: "#",
      },
      {
        title: "Events",
        description: "Upcoming webinars & talks",
        icon: Calendar,
        url: "#",
      },
      {
        title: "Partners",
        description: "Our trusted allies",
        icon: Handshake,
        url: "#",
      },
      {
        title: "Resources",
        description: "Tools and downloads",
        icon: Archive,
        url: "#",
      },
    ],
  },
  {
    title: "Resources",
    items: [
      {
        title: "Help Center",
        url: "#",
      },
      {
        title: "Contact Us",
        url: "#",
      },
      {
        title: "Status",
        url: "#",
      },
      {
        title: "Terms of Service",
        url: "#",
      },
    ],
  },
  {
    title: "Community",
    items: [
      {
        title: "Forum",
        url: "#",
      },
      {
        title: "Slack Group",
        url: "#",
      },
      {
        title: "Contributors",
        url: "#",
      },
      {
        title: "Meetups",
        url: "#",
      },
    ],
  },
  {
    title: "Company",
    items: [
      {
        title: "About Us",
        url: "#",
      },
      {
        title: "Press",
        url: "#",
      },
      {
        title: "Blog",
        url: "#",
      },
      {
        title: "Careers",
        url: "#",
      },
    ],
  },
  {
    title: "Pricing",
    url: "#",
  },
];

const DESKTOP_NAVIGATION = [...NAVIGATION_GROUPS];

const MOBILE_BREAKPOINT = 1024;

export interface Navbar12Props {
  className?: string;
  logo?: NavbarLogo;
  navigationItems?: MenuItem[];
  primaryButton?: NavbarButton | null;
  secondaryButtons?: NavbarButton[];
}

const LinkAnchor = ({
  children,
  className,
  href,
  openInNewTab,
}: {
  children: React.ReactNode;
  className?: string;
  href?: string;
  openInNewTab?: boolean;
}) => {
  return (
    <a
      href={href ?? "#"}
      className={className}
      target={openInNewTab ? "_blank" : undefined}
      rel={openInNewTab ? "noreferrer noopener" : undefined}
    >
      {children}
    </a>
  );
};

const Navbar12 = ({
  className,
  logo = LOGO,
  navigationItems = DESKTOP_NAVIGATION,
  primaryButton = PRIMARY_BUTTON,
  secondaryButtons = SECONDARY_BUTTONS,
}: Navbar12Props) => {
  const [open, setOpen] = useState<boolean>(false);
  const mobileNavigation = [...navigationItems, ...(secondaryButtons[0] ? [secondaryButtons[0]] : [])];

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > MOBILE_BREAKPOINT) {
        setOpen(false);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
  }, [open]);

  const handleMobileMenu = () => {
    const nextOpen = !open;
    setOpen(nextOpen);
  };

  return (
    <section className={cn("", className)}>
      <div className="pointer-events-auto fixed top-0 z-999 w-full bg-background">
        <DesktopNavigationMenu
          handleMobileMenu={handleMobileMenu}
          logo={logo}
          open={open}
          navigationItems={navigationItems}
          primaryButton={primaryButton}
          secondaryButtons={secondaryButtons}
        />
      </div>
      <MobileNavigationMenu
        open={open}
        navigationItems={mobileNavigation}
        primaryButton={primaryButton}
        secondaryButtons={secondaryButtons}
      />
    </section>
  );
};

const DesktopNavigationMenu = ({
  handleMobileMenu,
  logo,
  navigationItems,
  open,
  primaryButton,
  secondaryButtons,
}: DesktopNavigationMenuProps) => {
  return (
    <div className={`border-b ${!open && "border-transparent"}`}>
      <div className="container flex h-[3.75rem] items-center justify-between gap-8.5">
        {logo.src || logo.title ? (
          <LinkAnchor
            href={logo.url}
            className="flex max-h-8 items-center gap-2 text-lg font-semibold tracking-tighter"
          >
            {logo.src && (
              <img
                src={logo.src}
                alt={logo.alt ?? "logo"}
                className="inline-block h-10 w-auto shrink-0 object-contain"
              />
            )}
            {logo.title ? <span className="hidden md:inline-block">{logo.title}</span> : null}
          </LinkAnchor>
        ) : null}
        <NavigationMenu viewport={false} className="hidden lg:flex">
          <NavigationMenuList className="">
            {navigationItems.map((item, index) =>
              renderDesktopMenuItem(item, index),
            )}
          </NavigationMenuList>
        </NavigationMenu>
        <div className="hidden h-full items-center justify-between lg:flex">
          <div className="flex items-center gap-2.5">
            {secondaryButtons[0] ? (
              <Button
                asChild
                variant="ghost"
                className="hidden h-[1.875rem] px-2.5 py-0 text-[0.9375rem] leading-[2.05] xl:flex"
              >
                <LinkAnchor href={secondaryButtons[0].url} openInNewTab={secondaryButtons[0].openInNewTab}>
                  {secondaryButtons[0].title}
                </LinkAnchor>
              </Button>
            ) : null}
            {secondaryButtons[0] && secondaryButtons[1] ? (
              <Separator
                orientation="vertical"
                decorative
                className="hidden !h-5 xl:flex"
              />
            ) : null}
            {secondaryButtons[1] ? (
              <Button
                asChild
                variant="ghost"
                className="hidden h-[1.875rem] px-2.5 py-0 text-[0.9375rem] leading-[2.05] xl:flex"
              >
                <LinkAnchor href={secondaryButtons[1].url} openInNewTab={secondaryButtons[1].openInNewTab}>
                  {secondaryButtons[1].title}
                </LinkAnchor>
              </Button>
            ) : null}
            {primaryButton ? (
              <Button
                asChild
                className="h-[1.875rem] px-2.5 py-0 text-[0.9375rem] leading-[2.05]"
              >
                <LinkAnchor href={primaryButton.url} openInNewTab={primaryButton.openInNewTab}>
                  {primaryButton.title}
                </LinkAnchor>
              </Button>
            ) : null}
          </div>
        </div>
        <div className="lg:hidden">
          <Button
            className="size-11"
            variant="ghost"
            onClick={handleMobileMenu}
          >
            {open ? (
              <X className="size-5.5" />
            ) : (
              <MenuIcon className="size-5.5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

const MobileNavigationMenu = ({
  open,
  navigationItems,
  primaryButton,
  secondaryButtons,
}: MobileNavigationMenuProps) => {
  return (
    <Sheet open={open}>
      <SheetContent
        aria-describedby={undefined}
        side="top"
        className="inset-0 z-998 h-dvh !animate-none bg-background pt-16 [&>button]:hidden"
      >
        <div className="relative h-full animate-[fade-in_.35s_ease-in-out_forwards]">
          <div className="absolute -m-px h-px w-px overflow-hidden border-0 mask-clip-border p-0 text-nowrap whitespace-nowrap">
            <SheetTitle className="text-primary">Mobile Navigation</SheetTitle>
          </div>
          <div className="h-[calc(100%-7.5rem)] overflow-y-auto">
            <div className="container">
              <Accordion
                type="multiple"
                className="w-full"
                defaultValue={["nav-0"]}
              >
                {navigationItems.map((item, index) =>
                  renderMobileMenuItem(item, index),
                )}
              </Accordion>
            </div>
          </div>
          <div className="sticky bottom-0">
            <div className="container">
              <div className="flex flex-col gap-4 border-t py-4">
                {primaryButton ? (
                  <Button asChild className="text-base leading-relaxed">
                    <LinkAnchor href={primaryButton.url} openInNewTab={primaryButton.openInNewTab}>
                      {primaryButton.title}
                    </LinkAnchor>
                  </Button>
                ) : null}
                {secondaryButtons[0] ? (
                  <Button
                    variant="outline"
                    asChild
                    className="text-base leading-relaxed"
                  >
                    <LinkAnchor
                      href={secondaryButtons[0].url}
                      openInNewTab={secondaryButtons[0].openInNewTab}
                    >
                      {secondaryButtons[0].title}
                    </LinkAnchor>
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

const renderMobileMenuItem = (item: MenuItem, index: number) => {
  if (item.items) {
    return (
      <AccordionItem key={item.title} value={`nav-${index}`}>
        <AccordionTrigger className="h-[3.75rem] items-center p-0 text-base leading-[3.75] font-bold no-underline hover:no-underline">
          {item.title}
        </AccordionTrigger>
        <AccordionContent className="[&_a]:no-underline">
          {item.items.map((subItem) => (
            <MobileSubMenuLink key={subItem.title} item={subItem} />
          ))}
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <LinkAnchor
      key={item.title}
      href={item.url}
      openInNewTab={item.openInNewTab}
      className="flex h-[3.75rem] items-center border-b p-0 text-left text-base leading-[3.75] font-bold no-underline ring-ring/10 outline-ring/50 transition-all focus-visible:ring-4 focus-visible:outline-1 nth-last-1:border-0"
    >
      {item.title}
    </LinkAnchor>
  );
};

const renderDesktopMenuItem = (item: MenuItem, index: number) => {
  if (item.items) {
    return (
      <NavigationMenuItem key={item.title} value={`${index}`}>
        <NavigationMenuTrigger className="h-[1.875rem] px-2.5 py-0 text-[0.9375rem] leading-[1.875rem]">
          <div>{item.title}</div>
        </NavigationMenuTrigger>
        <NavigationMenuContent className="px-1 py-1.5">
          <ul className="min-w-[8.125rem]">
            {item.items.map((subItem) => (
              <li key={subItem.title} className="w-full">
                <NavigationMenuLink asChild>
                  <DesktopSubMenuLink item={subItem} />
                </NavigationMenuLink>
              </li>
            ))}
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>
    );
  }

  return (
    <NavigationMenuItem key={item.title} value={`${index}`}>
      <NavigationMenuLink
        href={item.url}
        className={`${navigationMenuTriggerStyle()} h-[1.875rem] px-2.5 py-0 text-[0.9375rem] leading-[1.875rem]`}
      >
        {item.title}
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
};

const MobileSubMenuLink = ({ item }: { item: MenuItem }) => {
  return (
    <LinkAnchor
      className="flex w-full min-w-fit flex-row items-center gap-2.5 rounded-md px-2 py-[5px] no-underline transition-colors outline-none select-none hover:bg-muted hover:text-accent-foreground"
      href={item.url}
      openInNewTab={item.openInNewTab}
    >
      {item.icon && (
        <div className="basis-8.5">
          <div className="flex size-8.5 shrink-0 rounded-md border bg-background">
            <item.icon className="m-auto size-5" />
          </div>
        </div>
      )}
      <div className="text-base leading-normal whitespace-nowrap">
        {item.title}
      </div>
    </LinkAnchor>
  );
};

const DesktopSubMenuLink = ({ item }: { item: MenuItem }) => {
  return (
    <LinkAnchor
      className={`${item.icon && "pr-8"} flex w-full min-w-fit flex-row items-center gap-2.5 rounded-md px-2 py-[5px] transition-colors outline-none select-none hover:bg-muted hover:text-accent-foreground`}
      href={item.url}
      openInNewTab={item.openInNewTab}
    >
      {item.icon && (
        <div className="basis-8.5">
          <div className="flex size-8.5 shrink-0 rounded-md border bg-background">
            <item.icon className="m-auto size-5" />
          </div>
        </div>
      )}
      <div>
        <div className="text-[0.9375rem] leading-normal font-medium whitespace-nowrap">
          {item.title}
        </div>
        {item.description && (
          <p className="text-sm leading-[1.2] whitespace-nowrap text-muted-foreground">
            {item.description}
          </p>
        )}
      </div>
    </LinkAnchor>
  );
};

export { Navbar12 };
