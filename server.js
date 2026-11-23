require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors({ origin: "*" })); 
app.use(express.json());

app.get("/", (req, res) => {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    res.send(`
        <html><head><title>Campus Maintenance API</title>
        <style>body{font-family:Arial;padding:20px;background:#f4f7f6;} .box{background:white;padding:20px;border-radius:8px;max-width:800px;margin:auto;} table{width:100%;border-collapse:collapse;margin-top:10px;} th,td{border:1px solid #ddd;padding:8px;text-align:left;} th{background:#eef3f9;}</style>
        </head><body><div class="box">
        <h1>Campus Maintenance Requests API</h1>
        <p><strong>Student:</strong> Kalunga Mervis (202410672)</p>
        <p><strong>Live API Base URL:</strong> <code>${baseUrl}</code></p>
        <h2>Routes</h2>
        <table><tr><th>Method</th><th>Route</th></tr>
        <tr><td>GET</td><td><a href="/health">/health</a></td></tr>
        <tr><td>GET</td><td><a href="/api/records">/api/records</a></td></tr>
        <tr><td>GET</td><td>/api/records/:id</td></tr>
        <tr><td>POST</td><td>/api/records</td></tr>
        <tr><td>PUT</td><td>/api/records/:id</td></tr>
        <tr><td>DELETE</td><td>/api/records/:id</td></tr></table>
        <h2>Example POST Body</h2>
        <pre>{"title":"Broken light","category":"Electrical","description":"No power.","status":"Pending"}</pre>
        </div></body></html>
    `);
});

app.get("/health", async (req, res) => {
    try {
        const db = require("./db");
        await db.get("SELECT 1");
        res.status(200).json({ status: "OK", message: "Healthy" });
    } catch (error) {
        res.status(503).json({ status: "Error", message: "Database failed." });
    }
});

app.use("/api/records", require("./routes/records"));

app.use((req, res, next) => res.status(404).json({ message: "Route not found." }));
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ message: "Malformed JSON in request body." });
    }
    res.status(500).json({ message: "Internal server error." });
});

const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => {
    console.log(`Server listening on port ${port}`);
});
