"use client";

import { useId, useMemo, useState } from "react";
import { Lightbulb } from "lucide-react";
import { input as inputCls } from "@/components/ui";
import { normalize, searchSkills } from "@/lib/tests/suggestions";

/**
 * Champ « compétence » avec suggestions pendant la frappe.
 * - Les compétences du poste sont proposées dès que le champ reçoit le focus.
 * - Flèches haut/bas pour naviguer, Entrée pour choisir, Échap pour fermer.
 * - onPick : appelé quand une suggestion est choisie (ou Entrée sur un texte libre).
 */
export function SkillInput({
  value,
  onChange,
  onPick,
  jobTitle,
  exclude = [],
  name,
  placeholder = "Ex. : Comptabilité OHADA",
  className = "",
  ariaLabel = "Nom de la compétence",
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  onPick?: (v: string) => void;
  jobTitle?: string;
  exclude?: string[];
  name?: string;
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const listId = useId();
  const items = useMemo(
    () => searchSkills(value, { jobTitle, exclude: exclude.filter((e) => e !== value), limit: 8 }).filter((s) => s !== value),
    [value, jobTitle, exclude],
  );
  const show = open && items.length > 0 && !disabled;
  // Compétence déjà présente qui correspond à ce qui est tapé (« fisc » → « Fiscalité et TVA »).
  const q = normalize(value);
  const duplicate = q.length >= 2 ? exclude.find((e) => e && e !== value && normalize(e).includes(q)) : undefined;
  const [hint, setHint] = useState("");

  const choose = (s: string) => {
    onChange(s);
    onPick?.(s);
    setOpen(false);
    setActive(-1);
    setHint("");
  };

  return (
    <div className={`relative ${className}`}>
      <input
        name={name}
        value={value}
        disabled={disabled}
        autoComplete="off"
        role="combobox"
        aria-label={ariaLabel}
        aria-expanded={show}
        aria-controls={listId}
        aria-autocomplete="list"
        placeholder={placeholder}
        maxLength={80}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActive(-1);
          setHint("");
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && items.length) {
            e.preventDefault();
            setOpen(true);
            setActive((a) => (a + 1) % items.length);
          } else if (e.key === "ArrowUp" && items.length) {
            e.preventDefault();
            setActive((a) => (a <= 0 ? items.length - 1 : a - 1));
          } else if (e.key === "Enter") {
            // Entrée (sans envoyer le formulaire) : la suggestion surlignée, sinon la première ;
            // sinon le texte saisi, s'il n'est pas déjà dans la liste.
            e.preventDefault();
            if (show) choose(items[Math.max(active, 0)]);
            else if (duplicate) setHint(`« ${duplicate} » est déjà dans la liste.`);
            else if (value.trim().length >= 2) {
              onPick?.(value.trim());
              setOpen(false);
              setHint("");
            }
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        className={inputCls}
      />
      {(hint || (!show && open && duplicate)) && (
        <p role="status" className="mt-1 text-xs font-medium text-sun-700">
          {hint || `« ${duplicate} » est déjà dans la liste.`}
        </p>
      )}
      {show && (
        <ul id={listId} role="listbox" className="absolute z-30 mt-1.5 max-h-72 w-full overflow-auto rounded-2xl border border-stone-200 bg-white p-1.5 shadow-lift">
          <li className="flex items-center gap-1.5 px-3 pb-1 pt-1.5 text-xs font-bold uppercase tracking-wider text-stone-400">
            <Lightbulb className="h-3.5 w-3.5 text-brand-500" /> {value.trim() ? "Suggestions" : "Suggérées pour ce poste"}
          </li>
          {items.map((s, i) => (
            <li
              key={s}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault();
                choose(s);
              }}
              onMouseEnter={() => setActive(i)}
              className={`cursor-pointer rounded-xl px-3 py-2 text-sm ${i === active ? "bg-brand-50 font-semibold text-brand-900" : "text-stone-800"}`}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
