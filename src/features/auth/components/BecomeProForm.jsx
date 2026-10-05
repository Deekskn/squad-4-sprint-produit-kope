import { useEffect, useId, useRef, useState } from "react";
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/shared/context/AuthContext.jsx';
import { useAuthModal } from '@/shared/context/AuthModalContext.jsx';
import { useNotification } from '@/shared/context/NotificationContext.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { FormField } from '@/components/ui/FormField.jsx';
import { Input } from '@/components/ui/Input.jsx';
import { Select } from '@/components/ui/Select.jsx';
import { Check, ChevronDown } from "lucide-react";
import { Textarea } from '@/components/ui/Textarea.jsx';
import { Card } from '@/components/ui/Card.jsx';
import { Spinner } from '@/components/ui/Spinner.jsx';
import { useForm } from '@/components/form/useForm.js';
import { becomeProfessionalSchema } from '@/components/form/validators.js';
import { becomeProfessional } from '../services/auth.service.js';
import { useReferenceData } from '@/features/reference/hooks/useReferenceData.js';
import { ROUTES } from '@/lib/constants.js';

const INITIAL = { displayName: '', tradeId: '', zoneIds: [], yearsExperience: '', description: '' };
const STEP1_FIELDS = { displayName: true, tradeId: true, zoneIds: true };







function toggleZone(list, id, on) {
  const n = Number(id);
  if (on) return Array.from(new Set([...list, n]));
  return list.filter((z) => z !== n);
}



const cx = (...parts) => parts.filter(Boolean).join(" ");

const controlClasses = (error) =>
  cx(
    "min-h-11 w-full rounded-lg border bg-white px-3.5 py-2 text-base text-gray-900",
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

  // Fermeture au clic en dehors
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

  // Garde l'option active visible pendant la navigation au clavier
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
            role="listbox"
            aria-multiselectable="true"
            aria-label={label}
            className="absolute z-20 mt-1.5 max-h-64 w-full overflow-auto rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg"
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
                  // mouseDown : évite que le bouton perde le focus avant le clic
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => !isDisabled && toggle(option.value)}
                  onMouseMove={() => setActiveIndex(index)}
                  className={cx(
                    "flex min-h-10 cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-base",
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



export function BecomeProForm({ bare = false } = {}) {
  const { refresh } = useAuthContext();
  const { close: closeModal } = useAuthModal();
  const navigate = useNavigate();
  const { toast } = useNotification();
  const { trades, zones, loading: loadingRefs } = useReferenceData();
  const [step, setStep] = useState(1);

  const { values, errors, submitting, setField, handleSubmit, setErrors } = useForm(
    becomeProfessionalSchema,
    INITIAL,
    async (data) => becomeProfessional(data),
  );

  const goNext = () => {
    const r = becomeProfessionalSchema.pick(STEP1_FIELDS).safeParse(values);
    if (!r.success) {
      const fe = z.flattenError(r.error).fieldErrors;
      setErrors(Object.fromEntries(Object.entries(fe).map(([k, v]) => [k, v[0]])));
      return;
    }
    setErrors({});
    setStep(2);
  };

  const onSubmit = async (e) => {
    const res = await handleSubmit(e);
    if (res.ok) {
      toast({ message: 'Votre compte est maintenant professionnel !', type: 'success' });
      closeModal();
      await refresh();
      navigate(ROUTES.DASHBOARD_PRO, { replace: true });
    } else if (res.error?.errors) {
      setErrors((prev) => ({ ...prev, ...res.error.errors }));
      toast({ message: res.error.message || 'Veuillez corriger les erreurs.', type: 'error' });
    } else if (res.error?.message) {
      toast({ message: res.error.message, type: 'error' });
    }
  };

  return (
    <Card className={bare ? 'p-6 border-0 shadow-none' : 'p-6 sm:p-8'}>
      <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Faites connaître votre métier.</h1>
      <p className="mt-1 text-sm text-gray-500">
        Commencez par l'essentiel. Vous compléterez votre profil ensuite.
      </p>
      {loadingRefs && (
        <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
          <Spinner /> Chargement des métiers et zones...
        </div>
      )}
      <form className="mt-6 space-y-5" onSubmit={onSubmit} noValidate hidden={loadingRefs}>
        {step === 1 && (
          <>
            <FormField
              id="bp-display"
              label="Nom affiché (votre nom plus le grand public)"
              required
              error={errors.displayName}
              placeholder="Ex : Plomberie Makélékélé Services"
              value={values.displayName}
              onChange={(e) => setField('displayName', e.target.value)}
            />
            <FormField id="bp-trade" label="Métier" required error={errors.tradeId} as="select">
              <Select
                id="bp-trade"
                name="tradeId"
                className="border border-gray-200 "
                value={values.tradeId}
                error={errors.tradeId}
                onChange={(e) => setField('tradeId', e.target.value)}
              >
                <option value="">Choisissez un métier</option>
                {trades.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </Select>
            </FormField>
            <MultiSelect
              label="Zone"
              required
              hint="Sélectionnez au moins une zone."
              error={errors.zoneIds}
              options={zones.map((z) => ({ value: z.id, label: z.name }))}
              value={values.zoneIds || []}
              onChange={(ids) => setField('zoneIds', ids)}
            />
            <Button type="button" onClick={goNext} size="lg" className="w-full sm:w-auto sm:px-8">
              Suivant
            </Button>
          </>
        )}
        {step === 2 && (
          <>
            <FormField
              id="bp-years"
              label="Années d'expérience"
              required
              error={errors.yearsExperience}
              help="Entre 0 et 60 ans"
              as="input"
            >
              <Input
                id="bp-years"
                type="number"
                min="0"
                max="60"
                value={values.yearsExperience}
                onChange={(e) => setField('yearsExperience', e.target.value)}
                placeholder="Ex : 5"
              />
            </FormField>
            <FormField
              id="bp-description"
              label="Description"
              required
              error={errors.description}
              help="30 caractères minimum, 500 maximum"
              as="textarea"
            >
              <Textarea
                id="bp-description"
                rows={5}
                value={values.description}
                onChange={(e) => setField('description', e.target.value)}
                placeholder="Décrivez vos services, votre secteur, votre expérience..."
              />
            </FormField>
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" variant="secondary" size="lg" onClick={() => setStep(1)}>
                Précédent
              </Button>
              <Button type="submit" loading={submitting} size="lg" className="sm:px-8">
                Valider
              </Button>
            </div>
          </>
        )}
      </form>
    </Card>
  );
}
