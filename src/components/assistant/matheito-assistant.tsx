"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  Brain,
  MessageCircle,
  Send,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import {
  getPresentationMode,
  subscribePresentationMode,
} from "@/lib/analytics/presentation-mode-store";
import {
  answerMatheitoQuestion,
  getMatheitoCopilotContext,
  MATHEITO_SUGGESTED_QUESTIONS,
  MatheitoCopilotContext,
} from "@/lib/analytics/matheito-copilot-engine";

export type CopilotMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  createdAt: string;
};

const CHAT_KEY = "solint_matheito_copilot_chat_v40";

function createMessage(role: CopilotMessage["role"], text: string): CopilotMessage {
  return {
    id: crypto.randomUUID(),
    role,
    text,
    createdAt: new Date().toISOString(),
  };
}

function loadChat(): CopilotMessage[] {
  try {
    const raw = localStorage.getItem(CHAT_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CopilotMessage[];
  } catch {
    return [];
  }
}

function saveChat(messages: CopilotMessage[]) {
  localStorage.setItem(CHAT_KEY, JSON.stringify(messages.slice(-30)));
}

export function MatheitoAssistant() {
  const [open, setOpen] = useState(false);
  const [presentation, setPresentation] = useState(false);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [context, setContext] = useState<MatheitoCopilotContext | null>(null);
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setPresentation(getPresentationMode());
    return subscribePresentationMode((nextState) => {
      setPresentation(nextState.enabled);
    });
  }, []);

  useEffect(() => {
    setContext(getMatheitoCopilotContext());
    setMessages(loadChat());

    const handler = (event: Event) => {
      const custom = event as CustomEvent<MatheitoCopilotContext>;
      setContext(custom.detail);
    };

    window.addEventListener("solint:matheito-context-updated", handler);
    return () => window.removeEventListener("solint:matheito-context-updated", handler);
  }, []);

  useEffect(() => {
    saveChat(messages);
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const statusText = useMemo(() => {
    if (!context) return "Esperando análisis";
    return `Contexto activo · ${context.executiveScore}/100`;
  }, [context]);

  function ask(question: string) {
    const clean = question.trim();
    if (!clean || thinking) return;

    const userMessage = createMessage("user", clean);
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setThinking(true);

    window.setTimeout(() => {
      const answer = answerMatheitoQuestion(clean, getMatheitoCopilotContext() ?? context);
      setMessages((current) => [...current, createMessage("assistant", answer)]);
      setThinking(false);
    }, 420);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    ask(input);
  }

  function clearChat() {
    setMessages([]);
    localStorage.removeItem(CHAT_KEY);
  }

  if (presentation) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-4 flex h-[min(680px,calc(100vh-8rem))] w-[calc(100vw-2.5rem)] max-w-md flex-col overflow-hidden rounded-[1.7rem] border border-slate-200 bg-white shadow-2xl">
          <div className="bg-gradient-to-br from-[#04224a] to-[#005eb8] p-5 text-white">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#ffb375] solint-glow">
                  <Bot className="h-7 w-7" />
                </div>
                <div>
                  <p className="font-black">Matheito Copilot</p>
                  <p className="text-xs font-bold text-blue-100">{statusText}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={clearChat}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white/20"
                  title="Limpiar chat"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="border-b border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#005eb8]">
              Preguntas rápidas
            </p>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {MATHEITO_SUGGESTED_QUESTIONS.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => ask(question)}
                  className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-black text-[#04224a] transition hover:border-[#005eb8] hover:bg-blue-50"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-slate-700">
                Hola, soy Matheito. Carga DATA GENERAL o activa Demo Mode y podré responder preguntas sobre rotación, sedes, cargos, riesgos, recomendaciones y resumen para gerencia.
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.role === "user"
                    ? "ml-auto max-w-[88%] rounded-2xl bg-[#005eb8] p-4 text-sm leading-6 text-white"
                    : "mr-auto max-w-[92%] whitespace-pre-line rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700"
                }
              >
                {message.text}
              </div>
            ))}

            {thinking && (
              <div className="mr-auto flex max-w-[92%] items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm font-bold text-[#005eb8]">
                <Brain className="h-5 w-5 animate-pulse" />
                Analizando contexto ejecutivo...
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-white p-4">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Pregúntame sobre el análisis..."
                className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-[#005eb8] focus:bg-white"
              />
              <button
                type="submit"
                disabled={thinking || input.trim().length === 0}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#ff7415] text-white transition hover:bg-[#04224a] disabled:opacity-40"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="group flex items-center gap-3 rounded-full bg-gradient-to-r from-[#04224a] to-[#005eb8] px-5 py-4 text-white shadow-2xl transition hover:scale-[1.03]"
      >
        <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#04224a]">
          <Bot className="h-6 w-6" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff7415]">
            <Sparkles className="h-2.5 w-2.5 text-white" />
          </span>
        </span>
        <span className="text-sm font-black">Matheito</span>
        <MessageCircle className="h-5 w-5 opacity-80" />
      </button>
    </div>
  );
}
