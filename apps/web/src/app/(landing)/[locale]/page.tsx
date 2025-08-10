import React from "react";
import { Check, Star } from "lucide-react";
import { MockDiscordUI } from "@/components/mock-discord-ui";
import { AnimatedList } from "@/components/animated-list";
import {
  DiscordMessage,
  DiscordMessageProps,
} from "@/components/discord-message";
import Image from "next/image";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Icons } from "@/components/icons";
import { MaxWidthWrapper } from "@/components/max-width-wrapper";
import { Heading } from "@/components/heading";
import { ShinyButton } from "@/components/shiny-button";
import { useTranslations } from "next-intl";

const featureKeys = ["realtime", "lifetime", "track"] as const;
type FeatureKey = (typeof featureKeys)[number];

const codeSnippet = `await fetch("http://localhost:3000/api/v1/events", {
  method: "POST",
  body: JSON.stringify({
    category: "sale",
    fields: {
      plan: "PRO",
      email: "zoe.martinez2001@email.com",
      amount: 49.00
    }
  }),
  headers: {
    Authorization: "Bearer <YOUR_API_KEY>"
  }
})`;

const Page = () => {
  const hero = useTranslations("Hero");
  const bento = useTranslations("Bento");
  const testimonial = useTranslations("Testimonials");
  const messages = useTranslations("Discord");

  const discordMessages: DiscordMessageProps[] = [
    {
      timestamp: messages("signUp.timestamp"),
      badgeText: messages("signUp.badgeText"),
      badgeColor: "#43b581",
      title: messages("signUp.title"),
      content: {
        [messages("signUp.fields.name")]: "Mateo Ortiz",
        [messages("signUp.fields.email")]: "mateo@mail.com",
      },
    },
    {
      timestamp: messages("revenue.timestamp"),
      badgeText: messages("revenue.badgeText"),
      badgeColor: "#faa61a",
      title: messages("revenue.title"),
      content: {
        [messages("revenue.fields.amount")]: "$49.00",
        [messages("revenue.fields.email")]: "zoe.martinez2001@email.com",
        [messages("revenue.fields.plan")]: "PRO",
      },
    },
    {
      timestamp: messages("milestone.timestamp"),
      badgeText: messages("milestone.badgeText"),
      badgeColor: "#5865f2",
      title: messages("milestone.title"),
      content: {
        [messages("milestone.fields.recurringRevenue")]: "$5.000 USD",
        [messages("milestone.fields.growth")]: "+8.2%",
      },
    },
  ];

  return (
    <>
      {/* <HeroSection /> */}
      <img src="https://images.pexels.com/photos/33323358/pexels-photo-33323358.jpeg?_gl=1*mib30d*_ga*MjIwMDI5OTAwLjE3NTQxMzM0OTM.*_ga_8JE65Q40S6*czE3NTQ4MzE2NTEkbzMkZzEkdDE3NTQ4MzE2NzkkajMyJGwwJGgw" />
      <section className="relative py-24 sm:py-32 bg-background">
        <MaxWidthWrapper className="text-center">
          <div className="relative mx-auto text-center flex flex-col items-center gap-10">
            <div>
              <Heading className="max-w-2xl text-balance">
                <span>{hero("heading1")}</span>{" "}
                <span className="relative bg-gradient-to-r from-primary/80 to-primary text-transparent bg-clip-text">
                  {hero("heading2")}
                </span>
              </Heading>
            </div>

            <p className="text-base/7 text-muted-foreground max-w-prose text-center text-pretty">
              {hero.rich("paragraph", {
                b: (chunks) => (
                  <span className="font-semibold text-muted-foreground">
                    {chunks}
                  </span>
                ),
              })}
            </p>

            <ul className="space-y-2 max-w-md text-base/7 text-muted-foreground text-left flex flex-col items-start">
              {featureKeys.map((key: FeatureKey) => (
                <li key={key} className="flex gap-2 items-center text-left">
                  <Check className="size-5 shrink-0 text-primary" />
                  {hero(`features.${key}`)}
                </li>
              ))}
            </ul>

            <div className="w-full max-w-80">
              <ShinyButton
                href="/sign-up"
                className="relative z-10 h-14 w-full text-base shadow-lg transition-shadow duration-300 hover:shadow-xl"
              >
                {hero("button")}
              </ShinyButton>
            </div>
          </div>
        </MaxWidthWrapper>
      </section>

      <section className="relative bg-background pb-4">
        <div className="absolute inset-x-0 bottom-24 top-24 bg-primary" />
        <div className="relative mx-auto">
          <MaxWidthWrapper className="relative">
            <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
              <MockDiscordUI>
                <AnimatedList>
                  {discordMessages.map((message, index) => (
                    <DiscordMessage key={index} {...message} />
                  ))}
                </AnimatedList>
              </MockDiscordUI>
            </div>
          </MaxWidthWrapper>
        </div>
      </section>

      <section className="relative py-24 sm:py-32 bg-background">
        <MaxWidthWrapper className="flex flex-col items-center gap-16 sm:gap-20">
          <div>
            <h2 className="text-center text-base/7 font-semibold text-primary">
              {bento("subheading")}
            </h2>
            <Heading className="text-center leading-snug">
              {bento("heading")}
            </Heading>
          </div>

          <div className="grid gap-4 lg:grid-cols-3 lg:grid-rows-2">
            {/* first bento grid element */}
            <div className="relative lg:row-span-2">
              <div className="absolute inset-px rounded-lg bg-accent lg:rounded-l-[2rem]" />

              <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] lg:rounded-l-[calc(2rem+1px)]">
                <div className="px-8 pb-3 pt-8 sm:px-10 sm:pb-0 sm:pt-10">
                  <p className="mt-2 text-lg/7 font-medium text-card-foreground tracking-tight max-lg:text-center">
                    {bento("realtime.title")}
                  </p>
                  <p className="mt-2 max-w-lg text-sm/6 text-muted-foreground max-lg:text-center">
                    {bento("realtime.desc")}
                  </p>
                </div>

                <div className="relative min-h-[30rem] w-full grow [container-type:inline-size] max-lg:mx-auto max-lg:max-w-sm">
                  <div className="absolute inset-x-10 bottom-0 top-10 overflow-hidden rounded-t-[12cqw] border-x-[3cqw] border-t-[3cqw] border-gray-700 bg-gray-900 shadow-2xl">
                    <Image
                      className="size-full object-cover object-top"
                      src="/phone-screen.png"
                      alt="Phone screen displaying app interface"
                      fill
                    />
                  </div>
                </div>
              </div>

              <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5 lg:rounded-l-[2rem]" />
            </div>

            {/* second bento grid element */}
            <div className="relative max-lg:row-start-1">
              <div className="absolute inset-px rounded-lg bg-accent max-lg:rounded-t-[2rem]" />
              <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] max-lg:rounded-t-[calc(2rem+1px)]">
                <div className="px-8 pt-8 sm:px-10 sm:pt-10">
                  <p className="mt-2 text-lg/7 font-medium tracking-tight text-card-foreground max-lg:text-center">
                    {bento("event.title")}
                  </p>
                  <p className="mt-2 max-w-lg text-sm/6 text-muted-foreground max-lg:text-center">
                    {bento("event.desc")}
                  </p>
                </div>
                <div className="flex flex-1 items-center justify-center px-8 max-lg:pb-12 max-lg:pt-10 sm:px-10 lg:pb-2">
                  <Image
                    className="w-full max-lg:max-w-xs"
                    src="/bento-any-event.png"
                    alt="Bento box illustrating event tracking"
                    width={500}
                    height={300}
                  />
                </div>
              </div>

              <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5 max-lg:rounded-t-[2rem]" />
            </div>

            {/* third bento grid element */}
            <div className="relative max-lg:row-start-3 lg:col-start-2 lg:row-start-2">
              <div className="absolute inset-px rounded-lg bg-accent" />
              <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)]">
                <div className="px-8 pt-8 sm:px-10 sm:pt-10">
                  <p className="mt-2 text-lg/7 font-medium text-card-foreground tracking-tight max-lg:text-center">
                    {bento("properties.title")}
                  </p>
                  <p className="mt-2 max-w-lg text-sm/6 text-muted-foreground max-lg:text-center">
                    {bento("properties.desc")}
                  </p>
                </div>

                <div className="flex flex-1 items-center justify-center px-8 max-lg:pb-12 max-lg:pt-10 sm:px-10 lg:pb-2">
                  <Image
                    className="w-full max-lg:max-w-xs"
                    src="/bento-custom-data.png"
                    alt="Bento box illustrating custom data tracking"
                    width={500}
                    height={300}
                  />
                </div>
              </div>

              <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5" />
            </div>

            {/* fourth bento grid element */}
            <div className="relative lg:row-span-2">
              <div className="absolute inset-px rounded-lg bg-accent max-lg:rounded-b-[2rem] lg:rounded-r-[2rem]" />

              <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] max-lg:rounded-b-[calc(2rem+1px)] lg:rounded-r-[calc(2rem+1px)]">
                <div className="px-8 pb-3 pt-8 sm:px-10 sm:pb-0 sm:pt-10">
                  <p className="mt-2 text-lg/7 font-medium tracking-tight text-card-foreground max-lg:text-center">
                    {bento("integration.title")}
                  </p>
                  <p className="mt-2 max-w-lg text-sm/6 text-muted-foreground max-lg:text-center">
                    {bento("integration.desc")}
                  </p>
                </div>

                <div className="relative min-h-[30rem] w-full grow">
                  <div className="absolute bottom-0 left-10 right-0 top-10 overflow-hidden rounded-tl-xl bg-gray-900 shadow-2xl">
                    <div className="flex bg-gray-800/40 ring-1 ring-white/5">
                      <div className="-mb-px flex text-sm/6 font-medium text-gray-400">
                        <div className="border-b border-r border-b-white/20 border-r-white/10 bg-white/5 px-4 py-2 text-white">
                          pulsebear.js
                        </div>
                      </div>
                    </div>

                    <div className="overflow-hidden">
                      <div className="max-h-[30rem]">
                        <SyntaxHighlighter
                          language="typescript"
                          style={{
                            ...oneDark,
                            'pre[class*="language-"]': {
                              ...oneDark['pre[class*="language-"]'],
                              background: "transparent",
                              overflow: "hidden",
                            },
                            'code[class*="language-"]': {
                              ...oneDark['code[class*="language-"]'],
                              background: "transparent",
                            },
                          }}
                        >
                          {codeSnippet}
                        </SyntaxHighlighter>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5 max-lg:rounded-b-[2rem] lg:rounded-r-[2rem]" />
            </div>
          </div>
        </MaxWidthWrapper>
      </section>

      <section className="relative py-24 sm:py-32 bg-accent">
        <MaxWidthWrapper className="flex flex-col items-center gap-16 sm:gap-20">
          <div>
            <h2 className="text-center text-base/7 font-semibold text-primary">
              {testimonial("subheading")}
            </h2>
            <Heading className="text-center text-foreground">
              {testimonial("heading")}
            </Heading>
          </div>

          <div className="mx-auto grid max-w-2xl grid-cols-1 px-4 lg:mx-0 lg:max-w-none lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
            {/* first customer review */}
            <div className="flex flex-auto flex-col gap-4 bg-background p-6 sm:p-8 lg:p-16 rounded-t-[2rem] border lg:rounded-tr-none lg:rounded-l-[2rem]">
              <div className="flex gap-0.5 mb-2 justify-center lg:justify-start">
                <Star className="size-5 text-primary fill-primary" />
                <Star className="size-5 text-primary fill-primary" />
                <Star className="size-5 text-primary fill-primary" />
                <Star className="size-5 text-primary fill-primary" />
                <Star className="size-5 text-primary fill-primary" />
              </div>

              <p className="text-base sm:text-lg lg:text-lg/8 font-medium tracking-tight text-foreground text-center lg:text-left text-pretty">
                {testimonial("testimonial1.content")}
              </p>

              <div className="flex flex-col justify-center lg:justify-start sm:flex-row items-center sm:items-start gap-4 mt-2">
                <Image
                  src="/user-2.png"
                  className="rounded-full object-cover"
                  alt="Random user"
                  width={48}
                  height={48}
                />
                <div className="flex flex-col items-center sm:items-start">
                  <p className="font-semibold flex items-center">
                    Freya Larsson
                    <Icons.verificationBadge className="size-4 inline-block ml-1.5" />
                  </p>
                  <p className="text-sm text-gray-600">@itsfreya</p>
                </div>
              </div>
            </div>

            {/* second customer review */}
            <div className="flex flex-auto flex-col gap-4 bg-background border border-l-0 p-6 sm:p-8 lg:p-16 rounded-b-[2rem] lg:rounded-bl-none lg:rounded-r-[2rem]">
              <div className="flex gap-0.5 mb-2 justify-center lg:justify-start">
                <Star className="size-5 text-primary fill-primary" />
                <Star className="size-5 text-primary fill-primary" />
                <Star className="size-5 text-primary fill-primary" />
                <Star className="size-5 text-primary fill-primary" />
                <Star className="size-5 text-primary fill-primary" />
              </div>

              <p className="text-base sm:text-lg lg:text-lg/8 font-medium tracking-tight text-foreground text-center lg:text-left text-pretty">
                {testimonial("testimonial2.content")}
              </p>

              <div className="flex flex-col justify-center lg:justify-start sm:flex-row items-center sm:items-start gap-4 mt-2">
                <Image
                  src="/user-1.png"
                  className="rounded-full object-cover"
                  alt="Random user"
                  width={48}
                  height={48}
                />
                <div className="flex flex-col items-center sm:items-start">
                  <p className="font-semibold flex items-center">
                    Kai Durant
                    <Icons.verificationBadge className="size-4 inline-block ml-1.5" />
                  </p>
                  <p className="text-sm text-gray-600">@kdurant_</p>
                </div>
              </div>
            </div>
          </div>

          <ShinyButton
            href="/sign-up"
            className="relative z-10 h-14 w-full max-w-xs text-base shadow-lg transition-shadow duration-300 hover:shadow-xl"
          >
            {testimonial("button")}
          </ShinyButton>
        </MaxWidthWrapper>
      </section>
    </>
  );
};

export default Page;
