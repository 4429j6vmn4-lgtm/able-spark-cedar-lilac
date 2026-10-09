import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { SignInGate, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { ArrowLeft, ArrowRight, Download, Plus, Trash2 } from "lucide-react";
import {
  addTask,
  listTasks,
  moveTask,
  removeTask,
  type Task,
  type TaskStatus,
} from "@/lib/tasks.functions";

export const Route = createFileRoute("/")({ component: Home });

const COLUMNS: { id: TaskStatus; label: string; hint: string }[] = [
  { id: "inbox", label: "Inbox", hint: "Not started" },
  { id: "doing", label: "In motion", hint: "Being made" },
  { id: "done", label: "Finished", hint: "Shipped" },
];

const NEXT: Record<TaskStatus, TaskStatus | null> = {
  inbox: "doing",
  doing: "done",
  done: null,
};

const PREV: Record<TaskStatus, TaskStatus | null> = {
  inbox: null,
  doing: "inbox",
  done: "doing",
};

function InstallApp() {
  const [ready, setReady] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [hint, setHint] = useState("");

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setReady(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;

  async function install() {
    if (ready) {
      await ready.prompt();
      setReady(null);
      return;
    }
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setHint(
      ios
        ? "In Safari, tap Share, then Add to Home Screen."
        : "Use the browser menu, then Install app or Add to Home screen.",
    );
  }

  return (
    <div className="grid gap-1">
      <button
        type="button"
        onClick={install}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm font-semibold text-ink"
      >
        <Download size={16} />
        Install app
      </button>
      {hint ? <p className="max-w-xs text-sm text-muted">{hint}</p> : null}
    </div>
  );
}

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
};

function Home() {
  const load = useServerFn(listTasks);
  const create = useServerFn(addTask);
  const move = useServerFn(moveTask);
  const drop = useServerFn(removeTask);

  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [busy, setBusy] = useState(false);

  const { user, isPending } = useCurrentUserState();

  useEffect(() => {
    if (isPending || !user) return;
    load()
      .then(setTasks)
      .catch(() => setError("Could not reach the board."));
  }, [load, isPending, user]);

  async function onAdd(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim() || busy) return;
    setBusy(true);
    setError("");
    try {
      const task = await create({ data: { title, detail } });
      setTasks((current) => (current ? [task, ...current] : [task]));
      setTitle("");
      setDetail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add that card.");
    } finally {
      setBusy(false);
    }
  }

  async function onMove(task: Task, status: TaskStatus) {
    setError("");
    try {
      const updated = await move({ data: { id: task.id, status } });
      setTasks((current) => current?.map((item) => (item.id === updated.id ? updated : item)) ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not move that card.");
    }
  }

  async function onRemove(id: number) {
    setError("");
    try {
      await drop({ data: { id } });
      setTasks((current) => current?.filter((item) => item.id !== id) ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove that card.");
    }
  }

  const counts = COLUMNS.map((column) => ({
    ...column,
    items: tasks?.filter((task) => task.status === column.id) ?? [],
  }));

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-wide text-primary uppercase">Your studio</p>
          <h1 className="font-display text-4xl text-ink sm:text-5xl">Lumen Board</h1>
          <p className="mt-2 max-w-xl text-muted">
            Cards belong to your account and stay in the database when you come back.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <InstallApp />
          {user ? <UserButton /> : <span className="h-10 w-10" />}
        </div>
      </header>
      <SignInGate>

      <form
        onSubmit={onAdd}
        className="mb-8 grid gap-3 rounded-2xl border border-line bg-surface p-4 shadow-sm sm:grid-cols-[1.4fr_1.6fr_auto] sm:items-end"
      >
        <label className="grid gap-1 text-sm font-semibold text-ink">
          Title
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={120}
            placeholder="What needs doing?"
            className="h-11 rounded-xl border border-line bg-bg px-3 font-normal outline-none focus:border-primary"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-ink">
          Note
          <input
            value={detail}
            onChange={(event) => setDetail(event.target.value)}
            maxLength={400}
            placeholder="Optional detail"
            className="h-11 rounded-xl border border-line bg-bg px-3 font-normal outline-none focus:border-primary"
          />
        </label>
        <button
          type="submit"
          disabled={busy || !title.trim()}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 font-semibold text-primary-ink disabled:opacity-50"
        >
          <Plus size={18} />
          Add card
        </button>
      </form>

      {error ? (
        <p className="mb-4 rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink">{error}</p>
      ) : null}

      {tasks === null && !error ? (
        <p className="text-muted">Opening the board…</p>
      ) : (
        <section className="grid gap-4 lg:grid-cols-3">
          {counts.map((column) => (
            <div key={column.id} className="rounded-2xl border border-line bg-bg/60 p-3">
              <div className="mb-3 flex items-baseline justify-between px-1">
                <h2 className="font-display text-2xl text-ink">{column.label}</h2>
                <span className="text-sm text-muted">
                  {column.hint} · {column.items.length}
                </span>
              </div>
              <ul className="grid gap-3">
                {column.items.length === 0 ? (
                  <li className="rounded-xl border border-dashed border-line px-3 py-6 text-center text-sm text-muted">
                    Nothing here yet.
                  </li>
                ) : (
                  column.items.map((task) => (
                    <li key={task.id} className="rounded-xl border border-line bg-surface p-3">
                      <p className="font-semibold text-ink">{task.title}</p>
                      {task.detail ? <p className="mt-1 text-sm text-muted">{task.detail}</p> : null}
                      <div className="mt-3 flex gap-2">
                        {PREV[task.status] ? (
                          <button
                            type="button"
                            onClick={() => onMove(task, PREV[task.status]!)}
                            aria-label={`Move ${task.title} back`}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line text-ink"
                          >
                            <ArrowLeft size={16} />
                          </button>
                        ) : null}
                        {NEXT[task.status] ? (
                          <button
                            type="button"
                            onClick={() => onMove(task, NEXT[task.status]!)}
                            className="inline-flex h-10 flex-1 items-center justify-center gap-1 rounded-lg bg-ink px-3 text-sm font-semibold text-primary-ink"
                          >
                            Advance
                            <ArrowRight size={16} />
                          </button>
                        ) : (
                          <span className="inline-flex h-10 flex-1 items-center px-1 text-sm text-muted">
                            On the wall
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => onRemove(task.id)}
                          aria-label={`Remove ${task.title}`}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line text-muted"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          ))}
        </section>
      )}
      </SignInGate>
    </main>
  );
}
