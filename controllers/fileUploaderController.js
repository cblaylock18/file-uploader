const prisma = require("../prisma/prisma");
const asyncHandler = require("../middleware/asyncHandler");
const { body, validationResult } = require("express-validator");
const { getFoldersAndFiles } = require("../prisma/queries");

const multer = require("multer");
const upload = multer({ dest: "temp-uploads" });

const folderNameValidation = [
    body("name").trim().notEmpty().withMessage("Folder name is required."),
];

const uploadFilePost = [
    upload.single("file"),
    asyncHandler(async (req, res) => {
        const parentId = req.params.id;

        let renderData;
        if (parentId) {
            const parentFolder = await prisma.folder.findUnique({
                where: { id: parentId },
            });
            const { folders, files } = await getFoldersAndFiles(
                req.user.id,
                parentId
            );
            renderData = { parentFolder, folders, files };
        } else {
            const { folders, files } = await getFoldersAndFiles(req.user.id);
            renderData = { folders, files };
        }

        // to delete
        console.log(req.file);

        const data = {
            name: req.file.originalname,
            url: req.file.originalname,
            user: { connect: { id: req.user.id } },
        };
        if (parentId) {
            data.folder = { connect: { id: parentId } };
        }

        await prisma.file.create({ data });
        res.redirect(`/file-uploader/main/${parentId || ""}`);
    }),
];

const mainGet = asyncHandler(async (req, res) => {
    const { folders, files } = await getFoldersAndFiles(req.user.id);

    res.render("user-homepage", {
        folders: folders,
        files: files,
    });
});

const subfolderGet = asyncHandler(async (req, res) => {
    const parentId = req.params.id;

    const parentFolder = await prisma.folder.findUnique({
        where: {
            id: parentId,
        },
    });

    const { folders, files } = await getFoldersAndFiles(req.user.id, parentId);

    res.render("user-homepage", {
        parentFolder: parentFolder,
        folders: folders,
        files: files,
    });
});

const newFolderPost = [
    folderNameValidation,
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        const parentId = req.params.id;

        let renderData;
        if (parentId) {
            const parentFolder = await prisma.folder.findUnique({
                where: { id: parentId },
            });
            const { folders, files } = await getFoldersAndFiles(
                req.user.id,
                parentId
            );
            renderData = { parentFolder, folders, files };
        } else {
            const { folders, files } = await getFoldersAndFiles(req.user.id);
            renderData = { folders, files };
        }

        if (!errors.isEmpty()) {
            return res.status(400).render("user-homepage", {
                ...renderData,
                name: req.body.name,
                errors: errors.array(),
            });
        }

        const data = {
            name: req.body.name,
            user: { connect: { id: req.user.id } },
        };
        if (parentId) {
            data.parent = { connect: { id: parentId } };
        }

        await prisma.folder.create({ data });
        res.redirect(`/file-uploader/main/${parentId || ""}`);
    }),
];

module.exports = {
    uploadFilePost,
    mainGet,
    subfolderGet,
    newFolderPost,
};
