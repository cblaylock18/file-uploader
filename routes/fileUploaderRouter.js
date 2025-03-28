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

fileUploaderRouter.post(
    "/delete-folder/:folderId/:parentId",
    fileUploaderController.deleteFolderPost
);

fileUploaderRouter.post(
    "/delete-folder/:folderId",
    fileUploaderController.deleteFolderPost
);

fileUploaderRouter.get(
    "/update-folder/:folderId",
    fileUploaderController.updateFolderGet
);

fileUploaderRouter.post(
    "/update-folder/:folderId",
    fileUploaderController.updateFolderPost
);

fileUploaderRouter.get("/file/:fileId", fileUploaderController.fileDetailsGet);

fileUploaderRouter.get(
    "/file/download/:fileId",
    fileUploaderController.fileDownloadGet
);

module.exports = fileUploaderRouter;
