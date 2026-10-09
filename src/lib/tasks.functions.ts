import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";

export type TaskStatus = "inbox" | "doing" | "done";

export type Task = {
  id: number;
  title: string;
  detail: string;
  status: TaskStatus;
  createdAt: string;
};

const STATUSES: TaskStatus[] = ["inbox", "doing", "done"];

function isStatus(value: string): value is TaskStatus {
  return STATUSES.includes(value as TaskStatus);
}

export const listTasks = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql<Task>`
      select id, title, detail, status, created_at::text as "createdAt"
      from tasks
      where user_id = ${context.userId}
      order by created_at desc, id desc
    `;
  });

export const addTask = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { title: string; detail?: string }) => {
    const title = input.title.trim().slice(0, 120);
    const detail = (input.detail ?? "").trim().slice(0, 400);
    if (!title) throw new Error("A title is required.");
    return { title, detail };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql<Task>`
      insert into tasks (user_id, title, detail)
      values (${context.userId}, ${data.title}, ${data.detail})
      returning id, title, detail, status, created_at::text as "createdAt"
    `;
    return rows[0];
  });

export const moveTask = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: number; status: string }) => {
    const id = Number(input.id);
    if (!Number.isInteger(id) || id < 1) throw new Error("Unknown card.");
    if (!isStatus(input.status)) throw new Error("Unknown column.");
    return { id, status: input.status };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql<Task>`
      update tasks
      set status = ${data.status}
      where id = ${data.id} and user_id = ${context.userId}
      returning id, title, detail, status, created_at::text as "createdAt"
    `;
    if (!rows[0]) throw new Error("That card is gone.");
    return rows[0];
  });

export const removeTask = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: number }) => {
    const id = Number(input.id);
    if (!Number.isInteger(id) || id < 1) throw new Error("Unknown card.");
    return { id };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`delete from tasks where id = ${data.id} and user_id = ${context.userId}`;
    return { id: data.id };
  });
