const express = require("express");
const app = require("./app");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const userRouter = require("./routes/users");
const rewardRouter = require("./routes/rewards");
userRouter.use("/:id/rewards", rewardRouter);
app.use("/users", userRouter);
app.listen(3000);
