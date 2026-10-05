import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

const cx = (...parts) => parts.filter(Boolean).join(" ");

const controlClasses = (error) =>
  cx(
    "min-h-11 w-full rounded-sm border bg-white px-3.5 py-2 text-base text-gray-900",
    "focus-visible:outline-2 focus-visible:outline-green-700",
    error ? "border-red-600" : "border-gray-300",
  );

const describedBy = (id, { hint, error }) =>
  error ? `${id}-error` : hint ? `${id}-hint` : undefined;

function FieldShell({ id, label, required, hint, error, className, children }) {
  return (
    <div className={cx("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-gray-900">
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </label>
      )}
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-sm text-gray-500">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-sm font-medium text-red-700"
        >
          {error}
        </p>
      )}
    </div>
  );
}

const GAP = 6; 
const EDGE = 8;
const MAX_HEIGHT = 256;

export function MultiSelect({
  label,
  hint,
  error,
  required,
  options,
  value = [],
  onChange,
  onBlur,
  placeholder = "Choisir…",
  max,
  disabled = false,
  className,
  name,
}) {
  const id = useId();
  const listId = `${id}-list`;
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const listRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const selected = new Set(value);
  const selectedLabels = options
    .filter((o) => selected.has(o.value))
    .map((o) => o.label);
  const limitReached = max !== undefined && value.length >= max;

  const summary =
    selectedLabels.length === 0
      ? null
      : selectedLabels.length > 3
        ? `${selectedLabels.length} sélectionnés`
        : selectedLabels.join(", ");

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
        onBlur?.();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, onBlur]);

    useLayoutEffect(() => {
    if (!open) return;

    const place = () => {
      const trigger = triggerRef.current;
      const list = listRef.current;
      if (!trigger || !list) return;

      const rect = trigger.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
 if (rect.bottom < 0 || rect.top > viewportHeight) {
        setOpen(false);
        return;
      }

      const wanted = Math.min(list.scrollHeight, MAX_HEIGHT);
      const spaceBelow = viewportHeight - rect.bottom - GAP - EDGE;
      const spaceAbove = rect.top - GAP - EDGE;
      const placeAbove = spaceBelow < wanted && spaceAbove > spaceBelow;
      const room = placeAbove ? spaceAbove : spaceBelow;

      const width = Math.min(rect.width, viewportWidth - 2 * EDGE);
      const left = Math.min(
        Math.max(rect.left, EDGE),
        viewportWidth - width - EDGE,
      );

      Object.assign(list.style, {
        left: `${left}px`,
        width: `${width}px`,
        maxHeight: `${Math.max(Math.min(MAX_HEIGHT, room), 0)}px`,
        top: placeAbove ? "auto" : `${rect.bottom + GAP}px`,
        bottom: placeAbove ? `${viewportHeight - rect.top + GAP}px` : "auto",
        visibility: "visible",
      });
      list.dataset.placement = placeAbove ? "top" : "bottom";
    };

    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, options.length]);

  useEffect(() => {
    if (!open) return;
    document
      .getElementById(`${id}-opt-${activeIndex}`)
      ?.scrollIntoView?.({ block: "nearest" });
  }, [open, activeIndex, id]);

  const emit = (nextValues) => {
    const next = new Set(nextValues);
    onChange?.(options.filter((o) => next.has(o.value)).map((o) => o.value));
  };

  const toggle = (optionValue) => {
    if (selected.has(optionValue)) emit(value.filter((v) => v !== optionValue));
    else if (!limitReached) emit([...value, optionValue]);
  };

  const openList = () => {
    const firstSelected = options.findIndex((o) => selected.has(o.value));
    setActiveIndex(firstSelected >= 0 ? firstSelected : 0);
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    onBlur?.();
  };

  const onKeyDown = (event) => {
    if (disabled) return;
    const last = options.length - 1;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!open) openList();
        else setActiveIndex((i) => Math.min(i + 1, last));
        break;
      case "ArrowUp":
        event.preventDefault();
        if (!open) openList();
        else setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case "Home":
        if (open) {
          event.preventDefault();
          setActiveIndex(0);
        }
        break;
      case "End":
        if (open) {
          event.preventDefault();
          setActiveIndex(last);
        }
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (!open) openList();
        else if (options[activeIndex]) toggle(options[activeIndex].value);
        break;
      case "Escape":
        if (open) {
          event.preventDefault();
          close();
        }
        break;
      case "Tab":
        if (open) close();
        break;
      default:
    }
  };

  return (
    <FieldShell
      id={id}
      label={label}
      required={required}
      hint={hint}
      error={error}
      className={className}
    >
      <div ref={rootRef} className="relative">
        <button
          id={id}
          ref={triggerRef}
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={open ? `${id}-opt-${activeIndex}` : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, { hint, error })}
          aria-required={required || undefined}
          disabled={disabled}
          onClick={() => (open ? close() : openList())}
          onKeyDown={onKeyDown}
          className={cx(
            controlClasses(error),
            "flex items-center justify-between gap-3 text-left disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          <span className={cx("truncate", !summary && "text-gray-400")}>
            {summary ?? placeholder}
          </span>
          <ChevronDown
            aria-hidden="true"
            className={cx(
              "size-4 shrink-0 text-gray-500 transition-transform",
              open && "rotate-180",
            )}
          />
        </button>

        {name &&
          value.map((v) => (
            <input key={String(v)} type="hidden" name={`${name}[]`} value={v} />
          ))}

        {open && (
          <ul
            id={listId}
            ref={listRef}
            role="listbox"
            aria-multiselectable="true"
            aria-label={label}
            style={{ visibility: "hidden" }}
            className="fixed z-50 overflow-auto rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg"
          >
            {options.map((option, index) => {
              const isSelected = selected.has(option.value);
              const isDisabled = !isSelected && limitReached;
              return (
                <li
                  key={option.value}
                  id={`${id}-opt-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={isDisabled || undefined}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => !isDisabled && toggle(option.value)}
                  onMouseMove={() => setActiveIndex(index)}
                  className={cx(
                    "flex min-h-10 cursor-pointer items-center gap-3 rounded-sm px-2.5 py-2 text-base",
                    index === activeIndex && "bg-green-50",
                    isDisabled && "cursor-not-allowed opacity-45",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cx(
                      "flex size-5 shrink-0 items-center justify-center rounded border",
                      isSelected
                        ? "border-green-700 bg-green-700 text-white"
                        : "border-gray-200 bg-white",
                    )}
                  >
                    {isSelected && (
                      <Check className="size-3.5" strokeWidth={3} />
                    )}
                  </span>
                  <span className="flex-1">{option.label}</span>
                </li>
              );
            })}
            {max !== undefined && (
              <li
                role="presentation"
                className="px-2.5 pt-1.5 pb-1 text-xs text-gray-500"
                aria-live="polite"
              >
                {value.length} / {max} sélectionnés
              </li>
            )}
          </ul>
        )}
      </div>
    </FieldShell>
  );
}