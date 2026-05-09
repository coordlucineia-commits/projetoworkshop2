"use client";

import * as React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { cn } from "./ui/utils";

const triggerBase =
  "flex w-full hover:no-underline py-4 px-6 text-left items-center gap-3 rounded-none border-b-2 [&>svg:last-child]:text-primary [&>svg:last-child]:shrink-0 [&>svg:last-child]:self-center";

/** Mesmo shell visual nos cadastros, perfil, avaliações etc. Aceita single ou multiple. */
export function CadastroFormAccordion({ className, type = "multiple", ...rest }: React.ComponentProps<typeof Accordion>) {
  return <Accordion type={type} className={cn("w-full flex flex-col gap-4", className)} {...rest} />;
}

type CadastroFormAccordionSectionProps = {
  value: string;
  title: string;
  icon?: React.ReactNode;
  iconColor?: string;
  iconBg?: string;
  ordinal?: string;
  optional?: boolean;
  subtitle?: React.ReactNode;
  /** Mantém maiúsculas/minúsculas do título (ex.: nome do exercício). Default: headline em uppercase. */
  preserveTitleCase?: boolean;
  children: React.ReactNode;
  triggerClassName?: string;
};

export function CadastroFormAccordionSection({
  value,
  title,
  icon,
  iconColor = "#00F9E4",
  iconBg = "rgba(0,249,228,0.12)",
  ordinal,
  optional,
  subtitle,
  preserveTitleCase,
  children,
  triggerClassName,
}: CadastroFormAccordionSectionProps) {
  const headline = ordinal ? `${ordinal}. ${title}` : title;

  return (
    <AccordionItem value={value} className="rounded-[23px] border border-[#1E1E1E] bg-[#0D0D0D] overflow-hidden">
      <AccordionTrigger className={cn(triggerBase, triggerClassName)} style={{ borderBottomColor: iconColor }}>
        <div className="flex flex-1 min-w-0 items-start gap-3 text-start">
          {icon ? (
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: iconBg }}
              aria-hidden
            >
              {icon}
            </div>
          ) : (
            <div className="w-1 h-8 rounded-full shrink-0 mt-1" style={{ background: iconColor }} aria-hidden />
          )}
          <div className="min-w-0 flex-1 flex flex-wrap items-start gap-x-3 gap-y-1">
            <h2
              className={cn(
                "font-black tracking-tight text-base text-white",
                !preserveTitleCase && "uppercase",
              )}
            >
              {headline}
            </h2>
            {optional ? (
              <span
                className="inline-flex text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded-full shrink-0"
                style={{ color: "#606060", border: "1px solid #2A2A2A", background: "transparent" }}
              >
                Opcional
              </span>
            ) : null}
            {subtitle ? (
              <div className="w-full text-[11px] font-normal normal-case tracking-normal text-[#6B6B6B] -mt-0.5 space-y-1">
                {subtitle}
              </div>
            ) : null}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-5 pt-0">
        <div className="pt-1">{children}</div>
      </AccordionContent>
    </AccordionItem>
  );
}
