const { Router } = require("express");
const Genre = require("../models/Genre");

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const genres = await Genre.find().sort({ name: 1 }).lean();
    return res.json({ success: true, data: genres });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, description } = req.body || {};
    if (!name) {
      return res.status(400).json({ success: false, message: "name is required" });
    }
    const created = await Genre.create({ name: name.trim(), description });
    return res.status(201).json({ success: true, data: created });
  } catch (e) {
    return res.status(400).json({ success: false, message: e.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await Genre.findOneAndDelete({
      $or: [{ _id: id }, { UUID: id }],
    });
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Genre not found" });
    }
    return res.json({ success: true, data: deleted });
  } catch (e) {
    return res.status(400).json({ success: false, message: e.message });
  }
});

module.exports = router;