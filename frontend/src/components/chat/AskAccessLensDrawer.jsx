import React, { useRef, useState, useEffect } from "react";
import { MessageCircleQuestion, X, Send, Loader2, Sparkles } from "lucide-react";
import { askTutor } from "../../api/client.js";

export default function AskAccessLensDrawer({ lessonId, lessonTitle }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open]);

  async function handleSend(e) {
    e.preventDefault();
    const question = input.trim();
    if (!question || loading) return;

    setError(null);
    const nextMessages = [...messages, { role: "user", content: question }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const history = nextMessages.map((m) => ({ role: m.role, content: m.content }));
      const { answer } = await askTutor(lessonId, question, history.slice(0, -1));
      setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
    } catch (err) {
      setError(err.response?.data?.error || "Ask AccessLens couldn't respond. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-white font-semibold shadow-lg hover:bg-brand-700"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <MessageCircleQuestion className="h-5 w-5" aria-hidden="true" />
        Ask AccessLens
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Ask AccessLens tutor for ${lessonTitle}`}
          className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800"
        >
          <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-4 py-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-brand-600" aria-hidden="true" />
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-white">Ask AccessLens</h2>
                <p className="text-xs text-slate-500">Grounded strictly in “{lessonTitle}”</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close AI tutor chat"
              className="rounded-full p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </header>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
            {messages.length === 0 && (
              <p className="text-sm text-slate-500">
                Ask a question about this lesson — e.g. “Can you explain the equation again more simply?” or
                “What does the graph in this lesson show?”
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                  m.role === "user"
                    ? "ml-auto bg-brand-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                }`}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Thinking…
              </div>
            )}
            {error && (
              <p role="alert" className="text-sm font-medium text-red-600">
                {error}
              </p>
            )}
          </div>

          <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-slate-200 dark:border-slate-800 p-3">
            <label htmlFor="tutor-input" className="sr-only">
              Ask a question about this lesson
            </label>
            <input
              id="tutor-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about this lesson…"
              className="input"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send question"
              className="rounded-lg bg-brand-600 p-2.5 text-white hover:bg-brand-700 disabled:opacity-50"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
