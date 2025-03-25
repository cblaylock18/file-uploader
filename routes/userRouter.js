const { Router } = require("express");
const userController = require("../controllers/userController");
const userRouter = Router();

userRouter.post("/log-in", userController.logInPost);

userRouter.get("/sign-up", userController.signUpGet);

userRouter.post("/sign-up", userController.signUpPost);

userRouter.get("/log-out", userController.logOutGet);

module.exports = userRouter;
