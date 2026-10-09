import { i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { r as getSql } from "./db-C4zt9tNp.mjs";
import { t as authMiddleware } from "./middleware-DPGpQlWl.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tasks.functions-CSxcgH8C.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
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
var listTasks_createServerFn_handler = createServerRpc({
	id: "3414e40bf21d18c2af89dc86e867cbc49803add15b788066be660c8d93cedd98",
	name: "listTasks",
	filename: "src/lib/tasks.functions.ts"
}, (opts) => listTasks.__executeServer(opts));
var listTasks = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listTasks_createServerFn_handler, async ({ context }) => {
	return (await getSql())`
      select id, title, detail, status, created_at::text as "createdAt"
      from tasks
      where user_id = ${context.userId}
      order by created_at desc, id desc
    `;
});
var addTask_createServerFn_handler = createServerRpc({
	id: "9f99548b195a250e5a08b26a16dfa54801d55ddb3eaea92eb4d0927ce3f61e8e",
	name: "addTask",
	filename: "src/lib/tasks.functions.ts"
}, (opts) => addTask.__executeServer(opts));
var addTask = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const title = input.title.trim().slice(0, 120);
	const detail = (input.detail ?? "").trim().slice(0, 400);
	if (!title) throw new Error("A title is required.");
	return {
		title,
		detail
	};
}).handler(addTask_createServerFn_handler, async ({ context, data }) => {
	return (await (await getSql())`
      insert into tasks (user_id, title, detail)
      values (${context.userId}, ${data.title}, ${data.detail})
      returning id, title, detail, status, created_at::text as "createdAt"
    `)[0];
});
var moveTask_createServerFn_handler = createServerRpc({
	id: "421c43071f5cfd1f4e5d42ac3be091e497ebfa71a059037549b16a67d7af4e7d",
	name: "moveTask",
	filename: "src/lib/tasks.functions.ts"
}, (opts) => moveTask.__executeServer(opts));
var moveTask = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const id = Number(input.id);
	if (!Number.isInteger(id) || id < 1) throw new Error("Unknown card.");
	if (!isStatus(input.status)) throw new Error("Unknown column.");
	return {
		id,
		status: input.status
	};
}).handler(moveTask_createServerFn_handler, async ({ context, data }) => {
	const rows = await (await getSql())`
      update tasks
      set status = ${data.status}
      where id = ${data.id} and user_id = ${context.userId}
      returning id, title, detail, status, created_at::text as "createdAt"
    `;
	if (!rows[0]) throw new Error("That card is gone.");
	return rows[0];
});
var removeTask_createServerFn_handler = createServerRpc({
	id: "21f7c586bc9597e77a41845e2d1f4736ec988cd10c782a33fe0d5d3aad96bf23",
	name: "removeTask",
	filename: "src/lib/tasks.functions.ts"
}, (opts) => removeTask.__executeServer(opts));
var removeTask = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const id = Number(input.id);
	if (!Number.isInteger(id) || id < 1) throw new Error("Unknown card.");
	return { id };
}).handler(removeTask_createServerFn_handler, async ({ context, data }) => {
	await (await getSql())`delete from tasks where id = ${data.id} and user_id = ${context.userId}`;
	return { id: data.id };
});
//#endregion
export { addTask_createServerFn_handler, listTasks_createServerFn_handler, moveTask_createServerFn_handler, removeTask_createServerFn_handler };
