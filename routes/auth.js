const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jsonwebtoken = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const JWT_Secret = "Ishaan";
const fetchuser = require("../middleware/fetchUser");

router.post(
  "/register",
  [
    body("email").isEmail(),
    body("name").isLength({ min: 3 }),
    body("password").isLength({ min: 3 }),
  ],
  async (req, res) => {
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      const user = await User.create({
        name: req.body.name,
        password: secPass,
        email: req.body.email,
      });
      // user.save();
      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jsonwebtoken.sign(data, JWT_Secret);
      success = true;
      res.json({ success, authtoken });
    }
  }
);

router.post(
  "/login",
  [body("email").isEmail(), body("password", "cannot be blank").exists()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      const { email, password } = req.body;
      try {
        let user = await User.findOne({ email });
        if (!user) {
          return res.status(400).json({ error: "please try again" });
        } else {
          const passwordComapre = await bcrypt.compare(password, user.password);
          if (!passwordComapre) {
            success = false;
            return res.status(400).json({ success, error: "please try again" });
          } else {
            const data = {
              user: {
                id: user.id,
              },
            };
            const authtoken = jsonwebtoken.sign(data, JWT_Secret);
            success = true;
            res.json({ success, authtoken });
          }
        }
      } catch (error) {
        console.error(error.message);
        res.status(500).send("Some Error Occured");
      }
    }
  }
);

router.post("/getuser", fetchuser, async (req, res) => {
  try {
    userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Some Error Occured");
  }
});

router.get("/getallusers", fetchuser, async (req, res) => {
  const currentUserID = req.user.id;
  const users = await User.find({ _id: { $ne: currentUserID } }, "name");
  console.log(users);
  res.json(users);
});
module.exports = router;

router.post("/follow", fetchuser, async (req, res) => {
  console.log("siojioqw");
  const currentUserId = req.user.id;
  const targetUserId = req.body.targetUserId; // ID of the user to be unfollowed

  try {
    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { follow: targetUserId },
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/unfollow", fetchuser, async (req, res) => {
  const currentUserId = req.user.id; // Extract from authentication middleware or token
  const targetUserId = req.body.targetUserId; // ID of the user to be unfollowed

  try {
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { follow: targetUserId },
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
