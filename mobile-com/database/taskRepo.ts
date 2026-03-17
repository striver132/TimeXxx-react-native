import { db } from "./db";

export type Task = {
  id: number;
  name: string;
};

export async function getTasks(): Promise<Task[]> {

  const rows = await db.getAllAsync<Task>(
    "SELECT id, name FROM tasks ORDER BY id DESC"
  );

  return rows;
}

export async function createTask(name: string): Promise<Task> {

  const result = await db.runAsync(
    "INSERT INTO tasks(name) VALUES (?)",
    [name]
  );

  return {
    id: Number(result.lastInsertRowId),
    name,
  };
}
