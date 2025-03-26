/*
  Warnings:

  - You are about to drop the column `URL` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `successorId` on the `Folder` table. All the data in the column will be lost.
  - Added the required column `url` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Folder" DROP CONSTRAINT "Folder_successorId_fkey";

-- DropIndex
DROP INDEX "Folder_successorId_key";

-- AlterTable
ALTER TABLE "File" DROP COLUMN "URL",
ADD COLUMN     "url" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Folder" DROP COLUMN "successorId",
ADD COLUMN     "parentId" TEXT;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
