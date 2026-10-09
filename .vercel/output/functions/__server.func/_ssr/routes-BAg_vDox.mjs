import { o as __toESM } from "../_runtime.mjs";
import { U as isRedirect, b as require_jsx_runtime, q as require_react, y as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as getServerFnById, i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { i as signOut, r as signIn, t as authClient } from "./client-1vAx-gM_.mjs";
import { a as hasGateSessionMarker, t as GROK_PROVIDERS } from "./server-C9HOAnpN.mjs";
import { a as ArrowRight, i as Download, n as Trash2, o as ArrowLeft, r as Plus } from "../_libs/lucide-react.mjs";
import { t as authMiddleware } from "./middleware-DPGpQlWl.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BAg_vDox.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function useServerFn(serverFn) {
	const router = useRouter();
	return import_react.useCallback(async (...args) => {
		try {
			const res = await serverFn(...args);
			if (isRedirect(res)) throw res;
			return res;
		} catch (err) {
			if (isRedirect(err)) {
				err.options._fromLocation = router.stores.location.get();
				return router.navigate(router.resolveRedirect(err).options);
			}
			throw err;
		}
	}, [router, serverFn]);
}
function resolveSignInGateState(input) {
	if (input.isPending) return "pending";
	return input.hasUser ? "signed_in" : "signed_out";
}
/**
* Current user + loading state. Same behavior in live preview and when deployed:
*   - Auth enabled -> the real signed-in user; `user` is `null` while
*                            the session resolves (`isPending: true`) and when
*                            signed out (`isPending: false`). Session comes from
*                            Better Auth `useSession()` → `/api/auth/get-session`
*                            (cookie when deployed; bearer in live preview).
*   - Auth disabled (`VITE_AUTH_ENABLED=false`) -> `DEV_USER`, never pending.
*
* Protect a route by waiting out `isPending` before acting on `user` —
* redirecting on `user: null` alone bounces signed-in visitors to sign-in on
* every hard reload:
*
*   import { RedirectToSignIn } from "@/lib/auth/gates";
*   const { user, isPending } = useCurrentUserState();
*   if (isPending) return null;              // still resolving — don't redirect yet
*   if (!user) return <RedirectToSignIn />;  // definitely signed out
*
* `authEnabled` is a module-level constant fixed at load, so the guarded hook
* call keeps a stable hook order across every render of a given component.
*/
function useCurrentUserState() {
	const { data, isPending } = authClient.useSession();
	const user = data?.user;
	return {
		user: user ? {
			id: user.id,
			displayName: user.name ?? null,
			primaryEmail: user.email ?? null,
			profileImageUrl: user.image ?? null,
			isDevFallback: false
		} : null,
		isPending
	};
}
/**
* Convenience view of `useCurrentUserState().user` for display (e.g.
* `user?.displayName ?? "Guest"`). NOTE: `null` means *loading OR signed out* —
* for redirects/guards use `useCurrentUserState()` and check `isPending`.
*/
function useCurrentUser() {
	return useCurrentUserState().user;
}
var subscribeToNothing = () => () => {};
var noGateSessionOnServer = () => false;
function SignInGate({ children, fallback }) {
	const { user, isPending } = useCurrentUserState();
	const state = resolveSignInGateState({
		isPending,
		hasUser: user !== null
	});
	if (state === "pending") return null;
	if (state === "signed_in") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: fallback ?? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignInButtons, {}) });
}
function SignInButtons() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex w-full max-w-sm flex-col gap-2",
		children: GROK_PROVIDERS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: () => signIn(p.providerId, { callbackURL: "/" }),
			className: "w-full cursor-pointer rounded-md border border-neutral-300 px-4 py-2 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900",
			children: ["Continue with ", p.label]
		}, p.providerId))
	});
}
/**
* Minimal signed-in identity chip + sign-out. Restyle freely (see the
* `design-ui` skill). Sign-out is only shown when auth is enabled (the
* disabled-auth dev user has nothing to sign out of) and the session is not
* gate-materialized — behind the gate the next request signs the viewer
* straight back in, so a sign-out control there is a broken loop.
*/
function UserButton() {
	const user = useCurrentUser();
	const [signingOut, setSigningOut] = (0, import_react.useState)(false);
	const gateSession = (0, import_react.useSyncExternalStore)(subscribeToNothing, hasGateSessionMarker, noGateSessionOnServer);
	if (!user) return null;
	const label = user.displayName ?? user.primaryEmail ?? "Account";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [
			user.profileImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: user.profileImageUrl,
				alt: "",
				className: "h-8 w-8 rounded-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid h-8 w-8 place-items-center rounded-full bg-black/10 text-sm font-medium dark:bg-white/20",
				children: label.charAt(0).toUpperCase()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-medium",
				children: label
			}),
			!gateSession && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: signingOut,
				onClick: () => {
					setSigningOut(true);
					signOut().catch(() => setSigningOut(false));
				},
				className: "cursor-pointer text-sm underline-offset-4 opacity-70 hover:underline disabled:cursor-wait disabled:no-underline",
				children: signingOut ? "Signing out…" : "Sign out"
			})
		]
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var STATUSES = [
	"inbox",
	"doing",
	"done"
];
function isStatus(value) {
	return STATUSES.includes(value);
}
var listTasks = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("3414e40bf21d18c2af89dc86e867cbc49803add15b788066be660c8d93cedd98"));
var addTask = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const title = input.title.trim().slice(0, 120);
	const detail = (input.detail ?? "").trim().slice(0, 400);
	if (!title) throw new Error("A title is required.");
	return {
		title,
		detail
	};
}).handler(createSsrRpc("9f99548b195a250e5a08b26a16dfa54801d55ddb3eaea92eb4d0927ce3f61e8e"));
var moveTask = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const id = Number(input.id);
	if (!Number.isInteger(id) || id < 1) throw new Error("Unknown card.");
	if (!isStatus(input.status)) throw new Error("Unknown column.");
	return {
		id,
		status: input.status
	};
}).handler(createSsrRpc("421c43071f5cfd1f4e5d42ac3be091e497ebfa71a059037549b16a67d7af4e7d"));
var removeTask = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const id = Number(input.id);
	if (!Number.isInteger(id) || id < 1) throw new Error("Unknown card.");
	return { id };
}).handler(createSsrRpc("21f7c586bc9597e77a41845e2d1f4736ec988cd10c782a33fe0d5d3aad96bf23"));
var COLUMNS = [
	{
		id: "inbox",
		label: "Inbox",
		hint: "Not started"
	},
	{
		id: "doing",
		label: "In motion",
		hint: "Being made"
	},
	{
		id: "done",
		label: "Finished",
		hint: "Shipped"
	}
];
var NEXT = {
	inbox: "doing",
	doing: "done",
	done: null
};
var PREV = {
	inbox: null,
	doing: "inbox",
	done: "doing"
};
function InstallApp() {
	const [ready, setReady] = (0, import_react.useState)(null);
	const [installed, setInstalled] = (0, import_react.useState)(false);
	const [hint, setHint] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => void 0);
		const onPrompt = (event) => {
			event.preventDefault();
			setReady(event);
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
		setHint(ios ? "In Safari, tap Share, then Add to Home Screen." : "Use the browser menu, then Install app or Add to Home screen.");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: install,
			className: "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm font-semibold text-ink",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { size: 16 }), "Install app"]
		}), hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "max-w-xs text-sm text-muted",
			children: hint
		}) : null]
	});
}
function Home() {
	const load = useServerFn(listTasks);
	const create = useServerFn(addTask);
	const move = useServerFn(moveTask);
	const drop = useServerFn(removeTask);
	const [tasks, setTasks] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)("");
	const [title, setTitle] = (0, import_react.useState)("");
	const [detail, setDetail] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const { user, isPending } = useCurrentUserState();
	(0, import_react.useEffect)(() => {
		if (isPending || !user) return;
		load().then(setTasks).catch(() => setError("Could not reach the board."));
	}, [
		load,
		isPending,
		user
	]);
	async function onAdd(event) {
		event.preventDefault();
		if (!title.trim() || busy) return;
		setBusy(true);
		setError("");
		try {
			const task = await create({ data: {
				title,
				detail
			} });
			setTasks((current) => current ? [task, ...current] : [task]);
			setTitle("");
			setDetail("");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not add that card.");
		} finally {
			setBusy(false);
		}
	}
	async function onMove(task, status) {
		setError("");
		try {
			const updated = await move({ data: {
				id: task.id,
				status
			} });
			setTasks((current) => current?.map((item) => item.id === updated.id ? updated : item) ?? null);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not move that card.");
		}
	}
	async function onRemove(id) {
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
		items: tasks?.filter((task) => task.status === column.id) ?? []
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-semibold tracking-wide text-primary uppercase",
					children: "Your studio"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-4xl text-ink sm:text-5xl",
					children: "Lumen Board"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-xl text-muted",
					children: "Cards belong to your account and stay in the database when you come back."
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InstallApp, {}), user ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-10 w-10" })]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SignInGate, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: onAdd,
				className: "mb-8 grid gap-3 rounded-2xl border border-line bg-surface p-4 shadow-sm sm:grid-cols-[1.4fr_1.6fr_auto] sm:items-end",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "grid gap-1 text-sm font-semibold text-ink",
						children: ["Title", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: title,
							onChange: (event) => setTitle(event.target.value),
							maxLength: 120,
							placeholder: "What needs doing?",
							className: "h-11 rounded-xl border border-line bg-bg px-3 font-normal outline-none focus:border-primary"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "grid gap-1 text-sm font-semibold text-ink",
						children: ["Note", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: detail,
							onChange: (event) => setDetail(event.target.value),
							maxLength: 400,
							placeholder: "Optional detail",
							className: "h-11 rounded-xl border border-line bg-bg px-3 font-normal outline-none focus:border-primary"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "submit",
						disabled: busy || !title.trim(),
						className: "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 font-semibold text-primary-ink disabled:opacity-50",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 18 }), "Add card"]
					})
				]
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-4 rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink",
				children: error
			}) : null,
			tasks === null && !error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted",
				children: "Opening the board…"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "grid gap-4 lg:grid-cols-3",
				children: counts.map((column) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-line bg-bg/60 p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex items-baseline justify-between px-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl text-ink",
							children: column.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-sm text-muted",
							children: [
								column.hint,
								" · ",
								column.items.length
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "grid gap-3",
						children: column.items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "rounded-xl border border-dashed border-line px-3 py-6 text-center text-sm text-muted",
							children: "Nothing here yet."
						}) : column.items.map((task) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "rounded-xl border border-line bg-surface p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-semibold text-ink",
									children: task.title
								}),
								task.detail ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-muted",
									children: task.detail
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 flex gap-2",
									children: [
										PREV[task.status] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => onMove(task, PREV[task.status]),
											"aria-label": `Move ${task.title} back`,
											className: "inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line text-ink",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { size: 16 })
										}) : null,
										NEXT[task.status] ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => onMove(task, NEXT[task.status]),
											className: "inline-flex h-10 flex-1 items-center justify-center gap-1 rounded-lg bg-ink px-3 text-sm font-semibold text-primary-ink",
											children: ["Advance", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { size: 16 })]
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "inline-flex h-10 flex-1 items-center px-1 text-sm text-muted",
											children: "On the wall"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => onRemove(task.id),
											"aria-label": `Remove ${task.title}`,
											className: "inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line text-muted",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { size: 16 })
										})
									]
								})
							]
						}, task.id))
					})]
				}, column.id))
			})
		] })]
	});
}
//#endregion
export { Home as component };
