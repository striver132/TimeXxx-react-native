import { db } from "./db";

export type Task = {
  id: number;
  name: string;
  completed?: number;
};

export type TimerRecord = {
  id: number;
  task_id: number;
  duration: number;
  created_at: string;
  day: string;
};

export type TaskTotalDurationRow = {
  task_id: number;
  total_duration: number;
};

export type TaskDayTotalDurationRow = {
  task_id: number;
  day: string;
  total_duration: number;
};

export async function getTasks(): Promise<Task[]> {

  const rows = await db.getAllAsync<Task>(
    "SELECT id, name, completed FROM tasks ORDER BY id DESC"
  );

  return rows;
}

export async function createTask(name: string): Promise<Task> {

  const result = await db.runAsync(
    "INSERT INTO tasks(name, completed) VALUES (?, 0)",
    [name]
  );

  return {
    id: Number(result.lastInsertRowId),
    name,
    completed: 0,
  };
}
 
export async function updateTaskCompleted(taskId: number, completed: boolean) {
  await db.runAsync(
    "UPDATE tasks SET completed = ? WHERE id = ?",
    [completed ? 1 : 0, taskId]
  );
}

export async function createTimerRecord(taskId: number, duration: number): Promise<TimerRecord> {
  const now = new Date();
  const createdAt = now.toISOString();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const day = `${y}-${m}-${d}`;
  const result = await db.runAsync("INSERT INTO timer_records(task_id, duration, created_at, day) VALUES (?, ?, ?, ?)", [taskId, duration, createdAt, day]);

  return {
    id: Number(result.lastInsertRowId),
    task_id: taskId,
    duration,
    created_at: createdAt,
    day,
  };
}

export async function getTaskTotalDurations(): Promise<TaskTotalDurationRow[]> {
  const rows = await db.getAllAsync<TaskTotalDurationRow>(
    "SELECT task_id, COALESCE(SUM(duration), 0) AS total_duration FROM timer_records GROUP BY task_id"
  );

  return rows.map((r) => ({
    task_id: Number(r.task_id),
    total_duration: Number(r.total_duration),
  }));
}

export async function getTasksLastNDaysDurations(days = 3): Promise<TaskDayTotalDurationRow[]> {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - (days - 1));
  const y = start.getFullYear();
  const m = String(start.getMonth() + 1).padStart(2, "0");
  const d = String(start.getDate()).padStart(2, "0");
  const startDay = `${y}-${m}-${d}`;

  const rows = await db.getAllAsync<TaskDayTotalDurationRow>(
    "SELECT task_id, day, COALESCE(SUM(duration), 0) AS total_duration FROM timer_records WHERE day >= ? GROUP BY task_id, day ORDER BY day ASC",
    [startDay]
  );

  return rows.map((r) => ({
    task_id: Number(r.task_id),
    day: String(r.day),
    total_duration: Number(r.total_duration),
  }));
}

export async function deleteTask(taskId: number) {
  await db.runAsync(
    "DELETE FROM timer_records WHERE task_id = ?",
    [taskId]
  );

  await db.runAsync(
    "DELETE FROM tasks WHERE id = ?",
    [taskId]
  );
}

export type Wallet = {
  coins: number;
  available_time: number;
};

export async function getWallet(): Promise<Wallet> {
  const rows = await db.getAllAsync<{
    amount: number;
    available_time: number;
  }>("SELECT amount, available_time FROM coins WHERE id = 1");

  const row = rows[0];
  return {
    coins: Number(row?.amount ?? 0),
    available_time: Number(row?.available_time ?? 0),
  };
}

export async function addAvailableTime(seconds: number) {
  const inc = Math.max(0, Math.floor(seconds));
  await db.runAsync("UPDATE coins SET available_time = COALESCE(available_time, 0) + ? WHERE id = 1", [inc]);
}

export async function redeemTimeToCoins(coinsToAdd: number, secondsPerCoin = 60): Promise<Wallet> {
  const coins = Math.max(0, Math.floor(coinsToAdd));
  const rate = Math.max(1, Math.floor(secondsPerCoin));
  const costSeconds = coins * rate;

  const wallet = await getWallet();
  if (wallet.available_time < costSeconds) {
    throw new Error("Not enough available time");
  }

  await db.execAsync("BEGIN");
  try {
    await db.runAsync("UPDATE coins SET available_time = COALESCE(available_time, 0) - ? WHERE id = 1", [costSeconds]);
    await db.runAsync("UPDATE coins SET amount = COALESCE(amount, 0) + ? WHERE id = 1", [coins]);
    await db.execAsync("COMMIT");
  } catch (e) {
    await db.execAsync("ROLLBACK");
    throw e;
  }

  return getWallet();
}
