import "server-only";
import { getQuickJS, shouldInterruptAfterDeadline } from "quickjs-emscripten";
import { isIdentifier, type CodeSpec } from "@/lib/tests/model";

// Exécution du code d'un candidat (exercices de programmation JavaScript).
// Le code tourne dans QuickJS compilé en WebAssembly : un interpréteur isolé, sans accès au
// serveur (ni fichiers, ni réseau, ni variables d'environnement), avec une limite de temps et
// de mémoire pour chaque test. Un nouvel environnement vierge est créé pour chaque test.

const TIME_LIMIT_MS = 1000;
const MEMORY_LIMIT = 32 * 1024 * 1024;
export const MAX_CODE_CHARS = 20_000;

export type CodeTestResult = { passed: boolean; hidden: boolean; got?: string; error?: string };

// Égalité de deux valeurs JSON (ordre des clés indifférent, petits écarts de calcul tolérés).
export function sameValue(a: unknown, b: unknown): boolean {
  if (typeof a === "number" && typeof b === "number") return Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b));
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((v, i) => sameValue(v, b[i]));
  if (a && b && typeof a === "object" && typeof b === "object" && !Array.isArray(a) && !Array.isArray(b)) {
    const ka = Object.keys(a as object).sort();
    const kb = Object.keys(b as object).sort();
    return (
      ka.length === kb.length &&
      ka.every((k, i) => k === kb[i] && sameValue((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]))
    );
  }
  return a === b;
}

export async function runCodeTests(code: string, spec: CodeSpec): Promise<CodeTestResult[]> {
  if (!isIdentifier(spec.functionName)) return spec.tests.map((t) => ({ passed: false, hidden: t.hidden, error: "Exercice mal configuré." }));
  const QuickJS = await getQuickJS();
  const fn = spec.functionName;
  const source = code.slice(0, MAX_CODE_CHARS);

  return spec.tests.map((test) => {
    const runtime = QuickJS.newRuntime();
    runtime.setMemoryLimit(MEMORY_LIMIT);
    runtime.setMaxStackSize(512 * 1024);
    runtime.setInterruptHandler(shouldInterruptAfterDeadline(Date.now() + TIME_LIMIT_MS));
    const vm = runtime.newContext();
    try {
      // Les arguments sont passés en JSON : le candidat ne peut pas modifier ceux des autres tests.
      const call = `\n;(function(){if(typeof ${fn}!=="function")throw new Error("La fonction ${fn} est introuvable.");` +
        `var r=${fn}.apply(null,${JSON.stringify(test.args)});return r===undefined?"__undefined__":JSON.stringify(r);})()`;
      const result = vm.evalCode(source + call, "candidat.js");
      if (result.error) {
        const err = vm.dump(result.error) as { name?: string; message?: string } | string;
        result.error.dispose();
        const message = typeof err === "string" ? err : `${err?.name ?? "Erreur"} : ${err?.message ?? ""}`;
        return { passed: false, hidden: test.hidden, error: /interrupted/i.test(message) ? "Temps dépassé (boucle infinie ?)" : message.slice(0, 300) };
      }
      const out = vm.dump(result.value) as string;
      result.value.dispose();
      if (out === "__undefined__") return { passed: false, hidden: test.hidden, got: "undefined (la fonction ne renvoie rien)" };
      let value: unknown;
      try {
        value = JSON.parse(out);
      } catch {
        return { passed: false, hidden: test.hidden, got: String(out).slice(0, 200) };
      }
      return { passed: sameValue(value, test.expected), hidden: test.hidden, got: String(out).slice(0, 200) };
    } catch (e) {
      return { passed: false, hidden: test.hidden, error: e instanceof Error ? e.message.slice(0, 300) : "Erreur d'exécution." };
    } finally {
      vm.dispose();
      runtime.dispose();
    }
  });
}

// Points obtenus : proportion de tests réussis.
export function codePoints(results: CodeTestResult[], points: number) {
  if (results.length === 0) return 0;
  const ok = results.filter((r) => r.passed).length;
  return Math.round((ok / results.length) * points * 100) / 100;
}
