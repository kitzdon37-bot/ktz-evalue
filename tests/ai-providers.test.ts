import { afterEach, describe, expect, it, vi } from "vitest";
import * as z from "zod";

vi.mock("server-only", () => ({}));

import { extractJson, groqProvider, mistralProvider } from "@/lib/ai/openai-compatible";

const Schema = z.object({ questions: z.array(z.object({ prompt: z.string(), points: z.int() })) });
const req = { system: "Tu rédiges des questions.", prompt: "Deux questions.", schema: Schema };

function reply(content: string, status = 200) {
  return new Response(
    JSON.stringify({ model: "modele-test", choices: [{ message: { content }, finish_reason: "stop" }], usage: { prompt_tokens: 10, completion_tokens: 5 } }),
    { status, headers: { "Content-Type": "application/json" } },
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("IA gratuites (Mistral, Groq)", () => {
  it("lit le JSON, même entouré d'un bloc de code", () => {
    expect(extractJson('Voici :\n```json\n{"a": 1}\n```')).toEqual({ a: 1 });
    expect(extractJson('{"a": [1, 2]}')).toEqual({ a: [1, 2] });
    expect(() => extractJson("pas de json")).toThrow();
  });

  it("ne sont actives qu'avec une clé, et ne reçoivent jamais de données de candidats", () => {
    vi.stubEnv("MISTRAL_API_KEY", "");
    expect(mistralProvider.isConfigured()).toBe(false);
    vi.stubEnv("MISTRAL_API_KEY", "cle-de-test");
    expect(mistralProvider.isConfigured()).toBe(true);
    expect(mistralProvider.personalData).toBe(false);
    expect(groqProvider.personalData).toBe(false);
    expect(mistralProvider.free).toBe(true);
  });

  it("renvoie des questions vérifiées, sans coût", async () => {
    vi.stubEnv("MISTRAL_API_KEY", "cle-de-test");
    const fetchMock = vi.fn().mockResolvedValue(reply('{"questions":[{"prompt":"Q1","points":1}]}'));
    vi.stubGlobal("fetch", fetchMock);
    const r = await mistralProvider.generate(req);
    expect(r.data.questions[0].prompt).toBe("Q1");
    expect(r.costMicroUsd).toBe(0);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.mistral.ai/v1/chat/completions");
    const body = JSON.parse(init.body);
    expect(body.response_format).toEqual({ type: "json_object" });
    expect(body.messages[0].content).toContain("schéma JSON");
    expect(init.headers.Authorization).toBe("Bearer cle-de-test");
  });

  it("redemande une fois si le format est faux", async () => {
    vi.stubEnv("GROQ_API_KEY", "cle-de-test");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(reply('{"questions":[{"prompt":"Q1","points":"un"}]}'))
      .mockResolvedValueOnce(reply('{"questions":[{"prompt":"Q1","points":1}]}'));
    vi.stubGlobal("fetch", fetchMock);
    const r = await groqProvider.generate(req);
    expect(r.data.questions[0].points).toBe(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).messages[1].content).toContain("ne respectait pas le format");
  });

  it("signale une erreur du service (quota, clé refusée…)", async () => {
    vi.stubEnv("GROQ_API_KEY", "cle-de-test");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("rate limit", { status: 429 })));
    await expect(groqProvider.generate(req)).rejects.toThrow(/429/);
  });
});
