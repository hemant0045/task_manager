import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json({ limit: "20kb" }));

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", database: "disconnected" });
  }
});

app.get("/api/tasks", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, title, description, completed, created_at, updated_at FROM tasks ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("GET /api/tasks:", error.message);
    res.status(500).json({ error: "Could not load tasks. Check the database connection." });
  }
});

app.post("/api/tasks", async (req, res) => {
  const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
  const description = typeof req.body.description === "string" ? req.body.description.trim() : "";

  if (!title) return res.status(400).json({ error: "Task title is required." });
  if (title.length > 150) return res.status(400).json({ error: "Title must be 150 characters or fewer." });
  if (description.length > 5000) return res.status(400).json({ error: "Description must be 5000 characters or fewer." });

  try {
    const result = await pool.query(
      "INSERT INTO tasks (title, description) VALUES ($1, $2) RETURNING id, title, description, completed, created_at, updated_at",
      [title, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("POST /api/tasks:", error.message);
    res.status(500).json({ error: "Could not create task." });
  }
});

app.put("/api/tasks/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: "Invalid task ID." });

  const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
  const description = typeof req.body.description === "string" ? req.body.description.trim() : "";
  const completed = req.body.completed;

  if (!title) return res.status(400).json({ error: "Task title is required." });
  if (title.length > 150) return res.status(400).json({ error: "Title must be 150 characters or fewer." });
  if (description.length > 5000) return res.status(400).json({ error: "Description must be 5000 characters or fewer." });
  if (typeof completed !== "boolean") return res.status(400).json({ error: "Completed must be true or false." });

  try {
    const result = await pool.query(
      `UPDATE tasks
       SET title = $1, description = $2, completed = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING id, title, description, completed, created_at, updated_at`,
      [title, description, completed, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: "Task not found." });
    res.json(result.rows[0]);
  } catch (error) {
    console.error("PUT /api/tasks/:id:", error.message);
    res.status(500).json({ error: "Could not update task." });
  }
});

app.delete("/api/tasks/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: "Invalid task ID." });

  try {
    const result = await pool.query("DELETE FROM tasks WHERE id = $1 RETURNING id", [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: "Task not found." });
    res.status(204).end();
  } catch (error) {
    console.error("DELETE /api/tasks/:id:", error.message);
    res.status(500).json({ error: "Could not delete task." });
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: "Unexpected server error." });
});

app.listen(port, () => {
  console.log(`Task Manager API running at http://localhost:${port}`);
});
