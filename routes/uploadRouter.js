const { Router } = require("express");
const uploadController = require("../controllers/uploadController");
const uploadRouter = Router();

uploadRouter.get("/", uploadController.uploadFileGet);

uploadRouter.post("/", uploadController.uploadFilePost);

module.exports = uploadRouter;
