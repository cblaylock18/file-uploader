const { Router } = require("express");
const fileUploaderController = require("../controllers/fileUploaderController");
const fileUploaderRouter = Router();

fileUploaderRouter.post(
    "/upload-file/:id",
    fileUploaderController.uploadFilePost
);

fileUploaderRouter.post("/upload-file", fileUploaderController.uploadFilePost);

fileUploaderRouter.get("/main/:id", fileUploaderController.subfolderGet);

fileUploaderRouter.get("/main", fileUploaderController.mainGet);

fileUploaderRouter.post(
    "/new-folder/:id",
    fileUploaderController.newFolderPost
);

fileUploaderRouter.post("/new-folder", fileUploaderController.newFolderPost);

module.exports = fileUploaderRouter;
