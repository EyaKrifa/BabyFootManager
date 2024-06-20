const http = require("http");
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const WebSocket = require("ws");
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ noServer: true });

// Configuration de la base de données
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "babyfoot",
  password: "admin",
  port: 5432,
});

app.use(express.json());

// Ajouter le middleware CORS
app.use(cors());

// Initialisation de la connexion à la base de données
pool.connect();

// Configuration des Websockets
wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    console.log("received:", message);
    broadcast(message, ws);
  });

  ws.send("Connected to WebSocket server");
});

// API pour créer une partie
app.post("/parties", async (req, res) => {
  try {
    const { name } = req.body;
    console.log("Creating partie with name:", name);
    const result = await pool.query(
      "INSERT INTO parties (name) VALUES ($1) RETURNING *",
      [name]
    );
    const partie = result.rows[0];
    console.log("partie created:", partie);
    broadcast(JSON.stringify({ type: "create", partie }));
    res.json(partie);
  } catch (error) {
    console.error("Error creating partie:", error);
    res.status(500).send("Internal Server Error");
  }
});

// API pour supprimer une partie
app.delete("/parties/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM parties WHERE id = $1", [id]);
    broadcast(JSON.stringify({ type: "delete", id }));
    res.sendStatus(204);
  } catch (error) {
    console.error("Error deleting partie:", error);
    res.status(500).send("Internal Server Error");
  }
});

// API pour terminer une partie
app.put("/parties/:id/complete", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "UPDATE parties SET status = $1 WHERE id = $2 RETURNING *",
      ["completed", id]
    );
    const partie = result.rows[0];
    broadcast(JSON.stringify({ type: "update", partie }));
    res.json(partie);
  } catch (error) {
    console.error("Error completing partie:", error);
    res.status(500).send("Internal Server Error");
  }
});

// API pour obtenir le nombre de parties actives
app.get("/activePartiesCount", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT COUNT(*) AS active_parties_count FROM parties WHERE status = 'active'"
    );
    const activePartiesCount = result.rows[0].active_parties_count;
    console.log("🚀 ~ app.get ~ activePartiesCount:", activePartiesCount);
    res.json({ activePartiesCount });
  } catch (error) {
    console.error("Error fetching active parties count:", error);
    res.status(500).send("Internal Server Error");
  }
});

// API pour obtenir toutes les parties
app.get("/partiesList", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM parties");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching parties:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Fonction de diffusion à tous les clients WebSocket
function broadcast(data, sender) {
  wss.clients.forEach((client) => {
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

server.listen(3009, () => {
  console.log("Server is running on port 3009");
});

server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});
