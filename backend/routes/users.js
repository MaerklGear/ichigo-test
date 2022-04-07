const express = require("express");
const UserModel = require("../models/user.model");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const userModel = new UserModel();
    const users = await userModel.getAllUsers();
    if (!users || users.length === 0) {
      res.status(404).json({
        error: {
          message: `No users found.`,
        },
      });
    } else {
      res.json({ data: users });
    }
  } catch (error) {
    res.status(500).json({
      error: {
        message: `No 'users.json' found. Did you provide an empty [] in the users.json for the database substitute?`,
      },
    });
  }
});

router.route("/:id").get(async (req, res) => {
  try {
    const { id } = req.params;
    const userModel = new UserModel();
    const user = await userModel.getUser(id);
    if (!user) {
      res.status(404).json({ error: { message: `No user found for id ${id}` } });
    } else {
      res.json({ data: user });
    }
  } catch (message) {
    res.status(400).send({ error: { message } });
  }
});

module.exports = router;
