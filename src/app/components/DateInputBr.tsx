"use client";

import * as React from "react";
import type { CSSProperties } from "react";
import { CalendarIcon } from "lucide-react";
import { ptBR } from "date-fns/locale";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  formatIsoParaDataBrasil,
  maskDigitarDataBrasil,
  parseDataBrasilParaIso,
} from "../../lib/datetimeBr";

type CalendarProps = React.ComponentProps<typeof Calendar>;

export type DateInputBrProps = Omit<
  React.ComponentPropsWithoutRef<"input">,
  "type" | "value" | "defaultValue" | "onChange"
> & {
  valueIso: string;
  /** Sempre `yyyy-mm-dd` (10 caracteres) ou string vazia. */
  onChangeIso: (isoYmd: string) => void;
  /** Classes aplicadas ao `<input type="text">`. */
  inputClassName: string;
  wrapperClassName?: string;
  inputStyle?: CSSProperties;
  disabledDates?: CalendarProps["disabled"];
  modifiersClassNames?: CalendarProps["modifiersClassNames"];
  /** Esconder botão do calendário (só digitação). */
  hideCalendarButton?: boolean;
  popoverAlign?: "start" | "center" | "end";
  popoverContentClassName?: string;
};

function isoToLocalCalendarDate(iso: string): Date | undefined {
  const slice = iso.trim().slice(0, 10);
  const parts = slice.split("-");
  if (parts.length !== 3) return undefined;
  const y = Number(parts[0]);
  const mo = Number(parts[1]);
  const d = Number(parts[2]);
  if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d)) return undefined;
  return new Date(y, mo - 1, d);
}

function localCalendarDateToIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export const DateInputBr = React.forwardRef<HTMLInputElement, DateInputBrProps>(
  function DateInputBr(
    {
      valueIso,
      onChangeIso,
      inputClassName,
      wrapperClassName = "",
      inputStyle,
      disabledDates,
      modifiersClassNames,
      hideCalendarButton,
      readOnly,
      disabled,
      popoverAlign = "end",
      popoverContentClassName = "w-auto border-[#303030] p-0",
      placeholder = "DD/MM/AAAA",
      onBlur,
      onFocus,
      required,
      name,
      id,
      autoComplete = "off",
      ...restInput
    },
    ref,
  ) {
    const innerRef = React.useRef<HTMLInputElement | null>(null);
    const setInputRef = React.useCallback(
      (node: HTMLInputElement | null) => {
        innerRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref],
    );

    const [open, setOpen] = React.useState(false);

    const { style: restStyle, ...restPassthrough } = restInput;

    const [text, setText] = React.useState(() => formatIsoParaDataBrasil(valueIso));

    React.useEffect(() => {
      if (document.activeElement === innerRef.current) return;
      setText(formatIsoParaDataBrasil(valueIso));
    }, [valueIso]);

    const showCalendarBtn = !(hideCalendarButton ?? readOnly) && !readOnly && !disabled;

    const mergedInputClass =
      inputClassName + (showCalendarBtn ? " pr-11" : "") + (readOnly ? " cursor-not-allowed opacity-95" : "");

    const notifyChange = React.useCallback(
      (iso: string) => {
        onChangeIso(iso);
      },
      [onChangeIso],
    );

    const handleChangeText = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (readOnly) return;
      const next = maskDigitarDataBrasil(e.target.value);
      setText(next);
      if (next.trim() === "") {
        notifyChange("");
        return;
      }
      const iso = parseDataBrasilParaIso(next);
      if (iso) notifyChange(iso);
    };

    const handleBlurInternal: React.FocusEventHandler<HTMLInputElement> = (e) => {
      const trimmed = text.trim();
      if (trimmed === "") {
        notifyChange("");
        onBlur?.(e);
        return;
      }
      const iso = parseDataBrasilParaIso(text);
      if (!iso) {
        setText(formatIsoParaDataBrasil(valueIso));
      } else if (iso !== valueIso) {
        notifyChange(iso);
      }
      onBlur?.(e);
    };

    const selectedDate = React.useMemo(() => isoToLocalCalendarDate(valueIso), [valueIso]);

    return (
      <div className={"relative " + wrapperClassName}>
        <input
          ref={setInputRef}
          type="text"
          inputMode="numeric"
          id={id}
          name={name}
          autoComplete={autoComplete}
          required={required}
          readOnly={readOnly}
          disabled={disabled}
          placeholder={placeholder}
          maxLength={10}
          className={mergedInputClass}
          style={{ ...restStyle, ...inputStyle }}
          value={text}
          onChange={handleChangeText}
          onBlur={handleBlurInternal}
          onFocus={onFocus}
          {...restPassthrough}
        />
        {showCalendarBtn ? (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label="Abrir calendário"
                disabled={disabled}
                className="absolute right-1 top-1/2 z-10 -translate-y-1/2 rounded-full p-2.5 text-[#00F9E4] transition-colors hover:bg-[#252525] disabled:pointer-events-none disabled:opacity-40 outline-none focus-visible:ring-2 focus-visible:ring-[#00F9E4] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]"
              >
                <CalendarIcon size={18} aria-hidden />
              </button>
            </PopoverTrigger>
            <PopoverContent
              className={popoverContentClassName}
              align={popoverAlign}
              style={{ background: "#111111", color: "#fff" }}
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <Calendar
                locale={ptBR}
                mode="single"
                selected={selectedDate}
                disabled={disabledDates}
                modifiersClassNames={
                  modifiersClassNames ?? {
                    selected: "!bg-[#00F9E4] !text-[#0A0A0A]",
                  }
                }
                onSelect={(d) => {
                  if (!d) return;
                  const iso = localCalendarDateToIso(d);
                  const br = formatIsoParaDataBrasil(iso);
                  setText(br);
                  notifyChange(iso);
                  setOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
        ) : null}
      </div>
    );
  }
);
