const express = require("express");
const fetchuser = require("../middleware/fetchUser");
const router = express.Router();
const Notes = require("../models/Notes");
const User = require("../models/User");

const { mongo } = require("mongoose");
const { body, validationResult } = require("express-validator");
var cors = require("cors");
const app = express();
app.use(cors());
router.get("/fetch", fetchuser, async (req, res) => {
  const notes = await Notes.find({
    user: req.user.id,
  });
  res.json(notes);
});

router.post(
  "/add",
  fetchuser,
  [
    body("title", "Cant be too small").isLength({ min: 3 }),
    body("info", "Cant be too small").isLength({ min: 3 }),
  ],
  async (req, res) => {
    try {
      const { title, info, tag } = req.body;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const note = new Notes({
        title,
        info,
        tag,
        user: req.user.id,
      });
      const savednote = await note.save();
      res.json(savednote);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Some Error Occured");
    }
  }
);

router.put("/update/:id", fetchuser, async (req, res) => {
  const { title, info, tag } = req.body;
  const newNote = {};

  if (title) {
    newNote.title = title;
  }
  if (info) {
    newNote.info = info;
  }
  if (tag) {
    newNote.tag = tag;
  }
  let note = await Notes.findById(req.params.id);
  console.log(req.user.id);
  if (!note) {
    return res.status(404).send("Not Found");
  }
  if (note.user.toString() !== req.user.id) {
    return res.status(401).send("Not Found");
  }

  note = await Notes.findByIdAndUpdate(
    req.params.id,
    { $set: newNote },
    { new: true }
  );
  res.json({ note });
});

router.delete("/delete/:id", fetchuser, async (req, res) => {
  const { title, info, tag } = req.body;

  let note = await Notes.findById(req.params.id);
  console.log(req.user.id);
  if (!note) {
    return res.status(404).send("Not Found");
  }
  if (note.user.toString() !== req.user.id) {
    return res.status(401).send("Not Found");
  }

  note = await Notes.findByIdAndDelete(req.params.id);
  res.json(note);
});
router.get("/tweets", fetchuser, async (req, res) => {
  console.log("ijij");
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const tweets = await Notes.find({ user: { $in: user.follow } });

    res.json(tweets);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
