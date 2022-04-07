const express = require("express");
const UserModel = require("../models/user.model");
const router = express.Router({ mergeParams: true });

router.get("/", async (req, res) => {
  try {
    const { at } = req.query;
    const { id } = req.params;
    if (dateIsInvalid(at)) {
      return res.status(400).json({ error: { message: "Invalid Date" } });
    }
    if (userIdIsInvalid(id)) {
      return res.status(400).json({ error: { message: "Invalid User Id" } });
    }

    const userModel = new UserModel();
    const user = (await userModel.getUser(id)) ?? (await userModel.create(id));

    if (!user) {
      return res.status(404).json({ error: { message: `No user found for id ${id}` } });
    }
    const rewards =
      (await userModel.getWeeklyRewards(user, at)) ??
      (await userModel.createWeeklyRewards(user, at));

    if (!rewards || rewards.length === 0) {
      return res.status(404).json({ error: { message: "rewards not found" } });
    }
    res.json({ data: rewards });
  } catch (error) {
    res.status(500).json(error);
  }
});

router.patch("/:availableAt/redeem", async (req, res) => {
  try {
    const { id, availableAt } = req.params;
    if (dateIsInvalid(availableAt)) {
      return res.status(400).json({ error: { message: "Invalid Date" } });
    }
    if (userIdIsInvalid(id)) {
      return res.status(400).json({ error: { message: "Invalid User Id" } });
    }

    const userModel = new UserModel();
    const user = await userModel.getUser(id);
    if (!user) {
      return res.status(404).json({ error: { message: `No user found for id ${id}` } });
    }
    const redeemed = await userModel.redeemRewardAt(user, availableAt);

    if (redeemed.message) {
      return res.status(redeemed.code).json({ error: { message: redeemed.message } });
    }
    res.json({ data: redeemed });
  } catch (error) {
    res.status(500).json(error);
  }
});
function dateIsInvalid(date) {
  return new Date(date).toString() === "Invalid Date";
}
function userIdIsInvalid(id) {
  return isNaN(id);
}

module.exports = router;
