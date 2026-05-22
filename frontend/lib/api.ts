import type {
  Note,
  NoteCreate,
  NoteUpdate,
  Todo,
  TodoCreate,
  TodoUpdate,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type GetToken = () => Promise<string | null>;

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body.detail === "string") return body.detail;
    if (Array.isArray(body.detail)) {
      return body.detail.map((d: { msg?: string }) => d.msg ?? "").join(", ");
    }
  } catch {
    /* ignore */
  }
  return response.statusText || "Request failed";
}

export async function apiFetch<T>(
  path: string,
  getToken: GetToken,
  options: RequestInit = {},
): Promise<T> {
  const token = await getToken();
  if (!token) {
    throw new ApiError("Not authenticated", 401);
  }

  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Bypass-Tunnel-Reminder", "true");
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new ApiError(await parseErrorMessage(response), response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function createTodoApi(getToken: GetToken) {
  return {
    list: () => apiFetch<Todo[]>("/todos", getToken),
    create: (data: TodoCreate) =>
      apiFetch<Todo>("/todos", getToken, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: TodoUpdate) =>
      apiFetch<Todo>(`/todos/${id}`, getToken, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      apiFetch<void>(`/todos/${id}`, getToken, { method: "DELETE" }),
  };
}

export function createNoteApi(getToken: GetToken) {
  return {
    list: () => apiFetch<Note[]>("/notes", getToken),
    create: (data: NoteCreate) =>
      apiFetch<Note>("/notes", getToken, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: NoteUpdate) =>
      apiFetch<Note>(`/notes/${id}`, getToken, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      apiFetch<void>(`/notes/${id}`, getToken, { method: "DELETE" }),
  };
}
