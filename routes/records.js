const router = require('express').Router();
const db = require('../db');

function validateRecord(body) {
    const { title, category, description, status } = body;
    if (typeof title !== 'string' || title.trim().length < 3 || title.trim().length > 80) return "Title must have 3 to 80 characters.";
    if (typeof category !== 'string' || category.trim().length < 2 || category.trim().length > 40) return "Category must have 2 to 40 characters.";
    if (typeof description !== 'string' || description.trim().length < 5 || description.trim().length > 300) return "Description must have 5 to 300 characters.";
    if (!["Pending", "In progress", "Completed"].includes(status)) return "Status must be Pending, In progress, or Completed.";
    return null; 
}

router.get('/', async (req, res, next) => {
    try {
        const rows = await db.query("SELECT * FROM records ORDER BY id");
        res.status(200).json(rows);
    } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        if (isNaN(id) || parseInt(id) <= 0) return res.status(400).json({ message: "ID must be a positive whole number." });
        const row = await db.get("SELECT * FROM records WHERE id = ?", [id]);
        if (!row) return res.status(404).json({ message: "Record not found." });
        res.status(200).json(row);
    } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
    try {
        const errorMsg = validateRecord(req.body);
        if (errorMsg) return res.status(400).json({ message: errorMsg });
        const { title, category, description, status } = req.body;
        const result = await db.run(
            "INSERT INTO records (title, category, description, status) VALUES (?, ?, ?, ?)",
            [title.trim(), category.trim(), description.trim(), status]
        );
        const newRecord = await db.get("SELECT * FROM records WHERE id = ?", [result.lastID]);
        res.status(201).json(newRecord);
    } catch (error) { next(error); }
});

router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        if (isNaN(id) || parseInt(id) <= 0) return res.status(400).json({ message: "ID must be a positive whole number." });
        const errorMsg = validateRecord(req.body);
        if (errorMsg) return res.status(400).json({ message: errorMsg });
        const existing = await db.get("SELECT id FROM records WHERE id = ?", [id]);
        if (!existing) return res.status(404).json({ message: "Record not found." });
        const { title, category, description, status } = req.body;
        await db.run(
            "UPDATE records SET title = ?, category = ?, description = ?, status = ? WHERE id = ?",
            [title.trim(), category.trim(), description.trim(), status, id]
        );
        const updatedRecord = await db.get("SELECT * FROM records WHERE id = ?", [id]);
        res.status(200).json(updatedRecord);
    } catch (error) { next(error); }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        if (isNaN(id) || parseInt(id) <= 0) return res.status(400).json({ message: "ID must be a positive whole number." });
        const existing = await db.get("SELECT id FROM records WHERE id = ?", [id]);
        if (!existing) return res.status(404).json({ message: "Record not found." });
        await db.run("DELETE FROM records WHERE id = ?", [id]);
        res.status(200).json({ message: "Record deleted." });
    } catch (error) { next(error); }
});

module.exports = router;
