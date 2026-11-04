"use client";

import { useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { btn, label } from "@/components/ui";
import { MAX_IMAGE_CHARS } from "@/lib/tests/model";

// Illustration d'une question : l'image choisie est réduite (900 px de large au plus) et
// compressée en JPEG dans le navigateur, pour rester légère sur la connexion des candidats.
// Elle est envoyée avec le formulaire de la question (champ caché « image »).
const MAX_SIDE = 900;

function compress(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("canvas"));
      ctx.fillStyle = "#fff"; // fond blanc pour les images transparentes
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      // Qualité réduite progressivement jusqu'à passer sous la limite.
      for (const quality of [0.82, 0.7, 0.55, 0.4]) {
        const data = canvas.toDataURL("image/jpeg", quality);
        if (data.length <= MAX_IMAGE_CHARS) return resolve(data);
      }
      reject(new Error("trop lourde"));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("illisible"));
    };
    img.src = url;
  });
}

export function ImageField({ name, initial }: { name: string; initial: string | null | undefined }) {
  const [value, setValue] = useState(initial ?? "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    if (!file.type.startsWith("image/")) return setError("Choisissez une image (photo, schéma, capture d'écran…).");
    setBusy(true);
    try {
      setValue(await compress(file));
    } catch {
      setError("Image impossible à utiliser : essayez une image plus petite ou dans un autre format.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const kb = value.startsWith("data:") ? Math.round((value.length * 3) / 4 / 1024) : null;

  return (
    <div>
      <p className={label}>Illustration (facultative)</p>
      <input type="hidden" name="image" value={value} />
      {value ? (
        <div className="mt-2 overflow-hidden rounded-xl border border-stone-200 bg-stone-50">
          {/* eslint-disable-next-line @next/next/no-img-element -- image locale ou data:, pas d'optimisation possible */}
          <img src={value} alt="Illustration de la question" className="mx-auto max-h-64 w-auto" />
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-stone-200 bg-white px-3 py-2 text-xs text-stone-600">
            <span>{kb !== null ? `Image compressée : ${kb} Ko` : "Illustration de la banque KTZ"}</span>
            <span className="flex gap-2">
              <button type="button" className={btn.small} onClick={() => fileRef.current?.click()}>
                <ImagePlus className="h-3.5 w-3.5" /> Remplacer
              </button>
              <button type="button" className={`${btn.small} text-red-700`} onClick={() => setValue("")}>
                <Trash2 className="h-3.5 w-3.5" /> Retirer
              </button>
            </span>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-stone-300 bg-white px-4 py-5 text-sm font-semibold text-stone-600 transition hover:border-brand-400 hover:text-brand-700"
        >
          <ImagePlus className="h-5 w-5" />
          {busy ? "Compression de l'image…" : "Ajouter une image : schéma, graphique, photo, plan…"}
        </button>
      )}
      <input
        ref={fileRef}
        id={`${name}-image`}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => pick(e.target.files?.[0])}
      />
      {error && <p className="mt-1 text-sm text-red-700">{error}</p>}
      <p className="mt-1 text-xs text-stone-500">L&apos;image est réduite automatiquement pour s&apos;afficher vite, même en 3G.</p>
    </div>
  );
}
