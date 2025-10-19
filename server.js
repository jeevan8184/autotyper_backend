// backend/server.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { keyboard } = require("@nut-tree-fork/nut-js");

const app = express();

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

app.use(bodyParser.json());

let currentJob = null;

app.post("/start", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).send({ error: "Text required" });
  if (currentJob) return res.status(400).send({ error: "Job already running" });

  const job = { text, index: 0, running: true };
  currentJob = job;

  // 5-second buffer to switch to target app
  setTimeout(() => {
    // Type characters as fast as possible without awaiting per character
    (async () => {
      for (let i = 0; i < job.text.length; i++) {
        if (!job.running) break;

        // ultra ultra fast typing (do not await per character)
        keyboard.type(job.text[i]);

        job.index = i + 1;
      }
      if (currentJob === job) currentJob = null;
    })();
  }, 5000);

  res.send({ ok: true, message: "Ultra fast typing will start in 5 seconds" });
});

app.get("/status", (req, res) => {
  if (!currentJob) return res.send({ running: false, progress: 100 });
  res.send({
    running: currentJob.running,
    progress: ((currentJob.index / currentJob.text.length) * 100).toFixed(2),
    charsTyped: currentJob.index,
    totalChars: currentJob.text.length,
  });
});

app.post("/stop", (req, res) => {
  if (currentJob) currentJob.running = false;
  currentJob = null;
  res.send({ ok: true });
});

const PORT = 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
