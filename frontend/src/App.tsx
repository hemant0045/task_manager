import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type Task = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
};

const API_URL = "http://localhost:5000/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${response.status})`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadTasks = useCallback(async () => {
    try {
      setError("");
      const data = await request<Task[]>("/tasks");
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not connect to the API.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const counts = useMemo(() => ({
    all: tasks.length,
    active: tasks.filter((task) => !task.completed).length,
    completed: tasks.filter((task) => task.completed).length,
  }), [tasks]);

  const visibleTasks = useMemo(() => tasks.filter((task) => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  }), [tasks, filter]);

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const task = await request<Task>("/tasks", {
        method: "POST",
        body: JSON.stringify({ title, description }),
      });
      setTasks((current) => [task, ...current]);
      setTitle("");
      setDescription("");
      setNotice("Task added successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add task.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleTask(task: Task) {
    try {
      const updated = await request<Task>(`/tasks/${task.id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          completed: !task.completed,
        }),
      });
      setTasks((current) => current.map((item) => item.id === updated.id ? updated : item));
      setNotice(updated.completed ? "Task completed." : "Task moved back to active.");
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update task.");
    }
  }

  function beginEdit(task: Task) {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description);
    setError("");
    setNotice("");
  }

  async function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (editingId === null || !editTitle.trim()) return;
    const original = tasks.find((task) => task.id === editingId);
    if (!original) return;

    try {
      const updated = await request<Task>(`/tasks/${editingId}`, {
        method: "PUT",
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          completed: original.completed,
        }),
      });
      setTasks((current) => current.map((task) => task.id === updated.id ? updated : task));
      setEditingId(null);
      setNotice("Task updated successfully.");
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update task.");
    }
  }

  async function deleteTask(id: number) {
    if (!window.confirm("Delete this task permanently?")) return;
    try {
      await request<void>(`/tasks/${id}`, { method: "DELETE" });
      setTasks((current) => current.filter((task) => task.id !== id));
      setNotice("Task deleted.");
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete task.");
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="TaskFlow home">
          <span className="brand-mark">✓</span>
          <span>TaskFlow</span>
        </a>
        <span className="local-badge"><span className="status-dot" /> Local workspace</span>
      </header>

      <section className="hero">
        <p className="eyebrow">YOUR PERSONAL WORKSPACE</p>
        <h1>Make room for <span>what matters.</span></h1>
        <p className="hero-copy">A calmer way to organize your day, one task at a time.</p>
      </section>

      <section className="stats-grid" aria-label="Task summary">
        <article className="stat-card">
          <span className="stat-icon lavender">▤</span>
          <div><p>Total tasks</p><strong>{counts.all}</strong></div>
        </article>
        <article className="stat-card">
          <span className="stat-icon blue">◷</span>
          <div><p>In progress</p><strong>{counts.active}</strong></div>
        </article>
        <article className="stat-card">
          <span className="stat-icon green">✓</span>
          <div><p>Completed</p><strong>{counts.completed}</strong></div>
        </article>
      </section>

      {error && <div className="alert error-alert" role="alert">{error}</div>}
      {notice && !error && <div className="alert success-alert" role="status">{notice}</div>}

      <section className="content-grid">
        <aside className="panel create-panel">
          <div className="panel-heading">
            <div><p className="eyebrow">GET IT OUT OF YOUR HEAD</p><h2>Add a task</h2></div>
            <span className="heading-plus">＋</span>
          </div>
          <form onSubmit={handleAdd} className="task-form">
            <label htmlFor="task-title">Task name</label>
            <input
              id="task-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Finish project report"
              maxLength={150}
              required
            />
            <label htmlFor="task-description">Description <span className="optional">(optional)</span></label>
            <textarea
              id="task-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Add a few details..."
              rows={4}
              maxLength={5000}
            />
            <button className="primary-button" disabled={saving}>
              {saving ? "Saving..." : "＋  Create task"}
            </button>
          </form>
          <div className="privacy-note"><span>▣</span> Your tasks are stored on this computer's database.</div>
        </aside>

        <section className="panel tasks-panel">
          <div className="tasks-heading">
            <div><p className="eyebrow">YOUR PLAN</p><h2>My tasks <span className="count-pill">{counts.all}</span></h2></div>
            <button className="icon-button" onClick={() => void loadTasks()} aria-label="Refresh tasks" title="Refresh tasks">↻</button>
          </div>

          <nav className="filter-tabs" aria-label="Filter tasks">
            {(["all", "active", "completed"] as const).map((item) => (
              <button key={item} className={`filter-tab ${filter === item ? "selected" : ""}`} onClick={() => setFilter(item)}>
                {item === "all" ? "All tasks" : item === "active" ? "In progress" : "Completed"}
                <span>{counts[item]}</span>
              </button>
            ))}
          </nav>

          {loading ? (
            <div className="empty-state"><div className="empty-symbol">◌</div><h3>Loading your tasks...</h3></div>
          ) : visibleTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-symbol">{filter === "completed" ? "✓" : "✦"}</div>
              <h3>{filter === "completed" ? "Nothing completed yet" : filter === "active" ? "You're all caught up" : "Start with one small thing"}</h3>
              <p>{filter === "all" ? "Add your first task using the form." : "Tasks matching this filter will appear here."}</p>
            </div>
          ) : (
            <div className="task-list">
              {visibleTasks.map((task) => (
                <article className={`task-item ${task.completed ? "is-complete" : ""}`} key={task.id}>
                  {editingId === task.id ? (
                    <form className="edit-form" onSubmit={saveEdit}>
                      <input aria-label="Edit task title" value={editTitle} onChange={(event) => setEditTitle(event.target.value)} maxLength={150} required autoFocus />
                      <textarea aria-label="Edit task description" value={editDescription} onChange={(event) => setEditDescription(event.target.value)} rows={3} maxLength={5000} />
                      <div className="item-actions">
                        <button className="small-primary" type="submit">Save changes</button>
                        <button className="small-quiet" type="button" onClick={() => setEditingId(null)}>Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <button className={`check-button ${task.completed ? "checked" : ""}`} onClick={() => void toggleTask(task)} aria-label={task.completed ? "Mark task as active" : "Mark task as completed"}>
                        {task.completed ? "✓" : ""}
                      </button>
                      <div className="task-details">
                        <h3>{task.title}</h3>
                        {task.description && <p>{task.description}</p>}
                        <span className="task-date">Added {new Date(task.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="item-actions">
                        <button className="action-button" onClick={() => beginEdit(task)} aria-label={`Edit ${task.title}`} title="Edit task">✎</button>
                        <button className="action-button delete-action" onClick={() => void deleteTask(task.id)} aria-label={`Delete ${task.title}`} title="Delete task">×</button>
                      </div>
                    </>
                  )}
                </article>
              ))}
            </div>
          )}
          <div className="panel-footer"><span className="status-dot" /> Changes save to PostgreSQL automatically</div>
        </section>
      </section>
      <footer className="footer">Built for focus. Powered by React + PostgreSQL.</footer>
    </main>
  );
}

export default App;
