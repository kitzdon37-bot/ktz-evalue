"use client";

import { useActionState, useRef, useState } from "react";
import { Globe, ImagePlus, Mail, Palette, Phone, Trash2, Upload } from "lucide-react";
import { ActionButton, FormMessage } from "@/components/form";
import { btn, input, label } from "@/components/ui";
import { COUNTRIES } from "@/lib/countries";
import { MAX_LOGO_CHARS } from "@/lib/company/logo";
import { updateCompany } from "./actions";

export type CompanyValues = {
  name: string;
  sector: string;
  country: string;
  city: string;
  primaryColor: string;
  description: string;
  website: string;
  contactEmail: string;
  contactPhone: string;
  logoUrl: string;
};

const DEFAULT_COLOR = "#ea580c";
const PRESETS = ["#ea580c", "#dc2626", "#db2777", "#7c3aed", "#2563eb", "#0891b2", "#059669", "#65a30d", "#ca8a04", "#1c1917"];
const MAX_SIDE = 512;

function Errors({ list }: { list?: string[] }) {
  return list?.map((e) => (
    <p key={e} className="mt-1 text-sm text-red-700">
      {e}
    </p>
  ));
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("illisible"));
    };
    img.src = url;
  });
}

// Réduit le logo (512 px au plus). On garde le PNG pour la transparence ; s'il est trop
// lourd, on passe en JPEG sur fond blanc. Renvoie aussi la couleur dominante du logo.
async function prepareLogo(file: File): Promise<{ data: string; color: string | null }> {
  const img = await loadImage(file);
  const w = img.naturalWidth || img.width || MAX_SIDE;
  const h = img.naturalHeight || img.height || MAX_SIDE;
  const scale = Math.min(1, MAX_SIDE / Math.max(w, h));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(w * scale));
  canvas.height = Math.max(1, Math.round(h * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const color = dominantColor(ctx, canvas.width, canvas.height);

  let data = canvas.toDataURL("image/png");
  if (data.length > MAX_LOGO_CHARS) {
    const flat = document.createElement("canvas");
    flat.width = canvas.width;
    flat.height = canvas.height;
    const f = flat.getContext("2d");
    if (!f) throw new Error("canvas");
    f.fillStyle = "#fff";
    f.fillRect(0, 0, flat.width, flat.height);
    f.drawImage(canvas, 0, 0);
    data = "";
    for (const q of [0.9, 0.8, 0.65, 0.5]) {
      const jpeg = flat.toDataURL("image/jpeg", q);
      if (jpeg.length <= MAX_LOGO_CHARS) {
        data = jpeg;
        break;
      }
    }
    if (!data) throw new Error("trop lourd");
  }
  return { data, color };
}

// Couleur la plus présente parmi les pixels colorés (ni blancs, ni gris, ni transparents).
function dominantColor(ctx: CanvasRenderingContext2D, w: number, h: number): string | null {
  const { data } = ctx.getImageData(0, 0, w, h);
  const buckets = new Map<string, { n: number; r: number; g: number; b: number }>();
  const step = Math.max(1, Math.floor((w * h) / 6000)) * 4;
  for (let i = 0; i < data.length; i += step) {
    const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
    if (a < 160) continue;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    if (max - min < 40 || max < 50 || min > 225) continue; // gris, noir ou blanc
    const key = `${r >> 5}-${g >> 5}-${b >> 5}`;
    const e = buckets.get(key) ?? { n: 0, r: 0, g: 0, b: 0 };
    e.n++;
    e.r += r;
    e.g += g;
    e.b += b;
    buckets.set(key, e);
  }
  let best: { n: number; r: number; g: number; b: number } | null = null;
  for (const e of buckets.values()) if (!best || e.n > best.n) best = e;
  if (!best || best.n < 5) return null;
  const hex = (v: number) => Math.round(v / best!.n).toString(16).padStart(2, "0");
  return `#${hex(best.r)}${hex(best.g)}${hex(best.b)}`;
}

export function CompanyForm({ values, readOnly }: { values: CompanyValues; readOnly: boolean }) {
  const [state, action] = useActionState(updateCompany, undefined);
  const [name, setName] = useState(values.name);
  const [description, setDescription] = useState(values.description);
  const [color, setColor] = useState(values.primaryColor || DEFAULT_COLOR);
  const [logoPreview, setLogoPreview] = useState(values.logoUrl);
  const [logoField, setLogoField] = useState("keep");
  const [logoColor, setLogoColor] = useState<string | null>(null);
  const [logoError, setLogoError] = useState("");
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setLogoError("");
    if (!file.type.startsWith("image/")) return setLogoError("Choisissez une image : PNG, JPEG, SVG ou WebP.");
    setBusy(true);
    try {
      const { data, color: found } = await prepareLogo(file);
      setLogoPreview(data);
      setLogoField(data);
      setLogoColor(found);
    } catch {
      setLogoError("Ce fichier n'a pas pu être utilisé. Essayez une autre image (PNG ou JPEG de préférence).");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removeLogo = () => {
    setLogoPreview("");
    setLogoField("");
    setLogoColor(null);
  };

  const initial = (name.trim()[0] ?? "?").toUpperCase();

  return (
    <form action={action} className="space-y-6">
      <FormMessage state={state} />
      <input type="hidden" name="logo" value={logoField} />
      <input type="hidden" name="primaryColor" value={color} />

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <fieldset disabled={readOnly} className="space-y-6">
          {/* Logo */}
          <section>
            <p className={label}>Logo</p>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                if (!readOnly) pick(e.dataTransfer.files?.[0]);
              }}
              className={`mt-2 flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed p-4 transition sm:flex-row ${
                dragOver ? "border-brand-500 bg-brand-50" : "border-stone-200 bg-stone-50/60"
              }`}
            >
              <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                {logoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element -- data: ou logo servi par le site
                  <img src={logoPreview} alt="Logo de l'entreprise" className="max-h-20 max-w-20 object-contain" />
                ) : (
                  <span className="text-3xl font-extrabold text-white" style={{ background: color, width: "100%", height: "100%", display: "grid", placeItems: "center" }}>
                    {initial}
                  </span>
                )}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <p className="text-sm text-stone-700">
                  {busy ? "Préparation du logo…" : "Glissez votre logo ici, ou choisissez un fichier."}
                </p>
                <p className="mt-0.5 text-xs text-stone-500">PNG avec fond transparent idéal. Réduit automatiquement pour charger vite.</p>
                {!readOnly && (
                  <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                    <button type="button" className={btn.small} onClick={() => fileRef.current?.click()} disabled={busy}>
                      {logoPreview ? <ImagePlus className="h-3.5 w-3.5" /> : <Upload className="h-3.5 w-3.5" />}
                      {logoPreview ? "Changer le logo" : "Choisir un fichier"}
                    </button>
                    {logoPreview && (
                      <button type="button" className={`${btn.small} text-red-700`} onClick={removeLogo}>
                        <Trash2 className="h-3.5 w-3.5" /> Retirer
                      </button>
                    )}
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                  className="hidden"
                  onChange={(e) => pick(e.target.files?.[0])}
                />
              </div>
            </div>
            {logoError && <p className="mt-1 text-sm text-red-700">{logoError}</p>}
            <Errors list={state?.errors?.logo} />
          </section>

          {/* Identité */}
          <section className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="name" className={label}>
                Nom de l&apos;entreprise (affiché aux candidats)
              </label>
              <input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} className={`${input} mt-1`} />
              <Errors list={state?.errors?.name} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="description" className={label}>
                Présentation courte <span className="font-normal text-stone-500">(montrée aux candidats avant le test)</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                maxLength={500}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex. : Cabinet comptable installé à Bangui depuis 2010, nous accompagnons PME et ONG."
                className={`${input} mt-1`}
              />
              <p className="mt-1 text-right text-xs text-stone-500">{description.length}/500</p>
              <Errors list={state?.errors?.description} />
            </div>
            <div>
              <label htmlFor="sector" className={label}>
                Secteur
              </label>
              <input id="sector" name="sector" defaultValue={values.sector} placeholder="Ex. : ONG, banque, BTP" className={`${input} mt-1`} />
            </div>
            <div>
              <label htmlFor="country" className={label}>
                Pays
              </label>
              <select id="country" name="country" defaultValue={values.country} className={`${input} mt-1`}>
                {Object.entries(COUNTRIES).map(([code, n]) => (
                  <option key={code} value={code}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="city" className={label}>
                Ville
              </label>
              <input id="city" name="city" defaultValue={values.city} placeholder="Ex. : Bangui" className={`${input} mt-1`} />
            </div>
            <div>
              <label htmlFor="website" className={label}>
                <Globe className="mr-1 inline h-3.5 w-3.5" /> Site web
              </label>
              <input id="website" name="website" defaultValue={values.website} placeholder="www.mon-entreprise.com" className={`${input} mt-1`} />
              <Errors list={state?.errors?.website} />
            </div>
          </section>

          {/* Contact recrutement */}
          <section>
            <p className={label}>Contact pour les candidats</p>
            <p className="mt-0.5 text-xs text-stone-500">Facultatif. Affiché à la fin du test, pour qu&apos;un candidat puisse poser une question.</p>
            <div className="mt-2 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="contactEmail" className="sr-only">
                  Email de contact
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  <input id="contactEmail" name="contactEmail" type="email" defaultValue={values.contactEmail} placeholder="recrutement@entreprise.com" className={`${input} pl-9`} />
                </div>
                <Errors list={state?.errors?.contactEmail} />
              </div>
              <div>
                <label htmlFor="contactPhone" className="sr-only">
                  Téléphone ou WhatsApp
                </label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  <input id="contactPhone" name="contactPhone" type="tel" defaultValue={values.contactPhone} placeholder="+236 70 00 00 00" className={`${input} pl-9`} />
                </div>
                <Errors list={state?.errors?.contactPhone} />
              </div>
            </div>
          </section>

          {/* Couleur */}
          <section>
            <p className={label}>
              <Palette className="mr-1 inline h-3.5 w-3.5" /> Couleur des pages candidat
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Couleur ${c}`}
                  onClick={() => setColor(c)}
                  className={`h-8 w-8 rounded-full border-2 transition hover:scale-110 ${color.toLowerCase() === c ? "border-stone-900 ring-2 ring-stone-900/20" : "border-white shadow"}`}
                  style={{ background: c }}
                />
              ))}
              <label className="relative h-8 w-8 cursor-pointer overflow-hidden rounded-full border-2 border-white shadow" title="Autre couleur">
                <span className="absolute inset-0" style={{ background: "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)" }} />
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" aria-label="Choisir une autre couleur" />
              </label>
              {logoColor && logoColor.toLowerCase() !== color.toLowerCase() && (
                <button type="button" onClick={() => setColor(logoColor)} className={`${btn.small} ml-1`}>
                  <span className="h-3.5 w-3.5 rounded-full" style={{ background: logoColor }} /> Prendre la couleur du logo
                </button>
              )}
            </div>
            <Errors list={state?.errors?.primaryColor} />
          </section>
        </fieldset>

        {/* Aperçu de ce que voit le candidat */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-stone-500">Aperçu côté candidat</p>
          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-soft">
            <div className="relative h-24" style={{ background: `linear-gradient(135deg, ${color}, ${color}cc 60%, #1c1917)` }}>
              <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-white/95 py-1 pl-1 pr-3 shadow">
                {logoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoPreview} alt="" className="h-7 max-w-16 rounded-md object-contain" />
                ) : (
                  <span className="grid h-7 w-7 place-items-center rounded-full text-xs font-bold text-white" style={{ background: color }}>
                    {initial}
                  </span>
                )}
                <span className="max-w-40 truncate text-xs font-bold text-stone-900">{name || "Votre entreprise"}</span>
              </div>
            </div>
            <div className="space-y-2 p-4">
              <p className="text-xs text-stone-500">Bonjour Awa 👋</p>
              <p className="font-extrabold text-stone-900">Test : Assistant(e) comptable</p>
              {description && <p className="line-clamp-3 text-xs text-stone-600">{description}</p>}
              <span className="mt-2 inline-block rounded-lg px-3 py-1.5 text-xs font-bold text-white" style={{ background: color }}>
                Commencer le test →
              </span>
            </div>
          </div>
        </aside>
      </div>

      {!readOnly && <ActionButton className={btn.primary}>Enregistrer la fiche</ActionButton>}
    </form>
  );
}
