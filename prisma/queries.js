const prisma = require("../prisma/prisma");

const getFoldersAndFiles = async (userId, parentId = null) => {
    const folders = await prisma.folder.findMany({
        where: parentId
            ? { parentId: parentId, userId: userId }
            : { userId: userId, parent: null },
        include: {
            children: true,
        },
    });
    const files = await prisma.file.findMany({
        where: parentId
            ? { folderId: parentId, userId: userId }
            : { userId: userId, folder: null },
    });
    return { folders, files };
};

module.exports = {
    getFoldersAndFiles,
};
