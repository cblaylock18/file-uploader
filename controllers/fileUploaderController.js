const prisma = require("../prisma/prisma");
const asyncHandler = require("../middleware/asyncHandler");
const { body, validationResult } = require("express-validator");
const { getFoldersAndFiles } = require("../prisma/queries");
const uploadHelper = require("../middleware/uploadHelper");

const folderNameValidation = [
    body("name").trim().notEmpty().withMessage("Folder name is required."),
];

const folderUpdateValidation = [
    folderNameValidation,
    body("moveTo")
        .trim()
        .notEmpty()
        .withMessage("Move to field is required.")
        .custom(async (value) => {
            const folder = await prisma.folder.findUnique({
                where: {
                    id: value,
                },
            });
            if (!folder && value !== "root") {
                throw new Error("Not a valid folder.");
            }
        }),
];

const uploadFilePost = [
    uploadHelper.upload.single("file"),
    asyncHandler(async (req, res) => {
        const parentId = req.params.id;

        if (!req.file) {
            return res.redirect(`/file-uploader/main/${parentId || ""}`);
        }

        const uploadResult = await uploadHelper.handleCloudinaryUpload(
            req.file.buffer,
            req.file.originalname
        );

        const data = {
            name: req.file.originalname,
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            resourceType: uploadResult.resource_type,
            size: req.file.size,
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
            userId: req.user.id,
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
                userId: req.user.id,
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

const deleteFolderPost = asyncHandler(async (req, res) => {
    const parentId = req.params.parentId;
    const folderId = req.params.folderId;

    await prisma.folder.delete({
        where: {
            id: folderId,
            userId: req.user.id,
        },
    });

    res.redirect(`/file-uploader/main/${parentId || ""}`);
});

const updateFolderGet = asyncHandler(async (req, res) => {
    const folderId = req.params.folderId;
    const folderList = await prisma.folder.findMany({
        where: {
            userId: req.user.id,
        },
        select: {
            id: true,
            name: true,
        },
    });

    const folder = await prisma.folder.findUnique({
        where: {
            id: folderId,
            userId: req.user.id,
        },
    });

    res.render("folder-update", { folder, folderList });
});

const updateFolderPost = [
    folderUpdateValidation,
    asyncHandler(async (req, res) => {
        const folderId = req.params.folderId;
        const newParentId = req.body.moveTo;
        const errors = validationResult(req).array();

        const folder = await prisma.folder.findUnique({
            where: {
                id: folderId,
                userId: req.user.id,
            },
        });

        const folderList = await prisma.folder.findMany({
            where: {
                userId: req.user.id,
            },
            select: {
                id: true,
                name: true,
            },
        });
        if (newParentId === folder.id) {
            errors.push({
                msg: "A folder can't be moved into itself.",
                param: "moveTo",
                location: "body",
            });
        }

        if (errors.length > 0) {
            return res.status(400).render("folder-update", {
                errors: errors,
                folder,
                folderList,
            });
        }

        let data = {};

        if (folder.name !== req.body.name) {
            data.name = req.body.name;
        }

        if (folder.parentId !== newParentId) {
            data.parent =
                newParentId !== "root"
                    ? { connect: { id: newParentId } }
                    : { disconnect: true };
        }

        if (Object.keys(data).length > 0) {
            await prisma.folder.update({
                where: {
                    id: folderId,
                    userId: req.user.id,
                },
                data: data,
            });
        }

        res.redirect(`/main/${newParentId || ""}`);
    }),
];

const fileDetailsGet = asyncHandler(async (req, res) => {
    const fileId = req.params.fileId;

    const file = await prisma.file.findUnique({
        where: {
            id: fileId,
            userId: req.user.id,
        },
        select: {
            id: true,
            name: true,
            size: true,
            uploadTime: true,
            url: true,
        },
    });

    res.render("file-details", { file });
});

const fileDownloadGet = asyncHandler(async (req, res) => {
    const fileId = req.params.fileId;

    const file = await prisma.file.findUnique({
        where: {
            id: fileId,
            userId: req.user.id,
        },
        select: {
            url: true,
            name: true,
        },
    });

    if (!file) {
        return res.redirect(`/file-uploader/main`);
    }

    const downloadUrl = file.url.replace("/upload/", "/upload/fl_attachment/");

    res.redirect(downloadUrl);
});

const fileDeleteGet = asyncHandler(async (req, res) => {
    const fileId = req.params.fileId;

    const file = await prisma.file.findUnique({
        where: {
            id: fileId,
            userId: req.user.id,
        },
        select: {
            publicId: true,
            folderId: true,
            resourceType: true,
        },
    });

    if (!file) {
        return res.redirect(`/file-uploader/main`);
    }

    try {
        await uploadHelper.handleCloudinaryDestroy(
            file.publicId,
            file.resourceType
        );

        await prisma.file.delete({
            where: {
                id: fileId,
                userId: req.user.id,
            },
        });

        res.redirect(`/main/${file.folderId || ""}`);
    } catch (error) {
        console.error("Error deleting file:", error);
        res.status(500).json({ error: "Failed to delete file" });
    }
});

module.exports = {
    uploadFilePost,
    mainGet,
    subfolderGet,
    newFolderPost,
    deleteFolderPost,
    updateFolderGet,
    updateFolderPost,
    fileDetailsGet,
    fileDownloadGet,
    fileDeleteGet,
};
