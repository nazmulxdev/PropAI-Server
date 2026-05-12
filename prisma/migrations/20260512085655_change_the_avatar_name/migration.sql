/*
  Warnings:

  - You are about to drop the column `avater` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "avater",
ADD COLUMN     "avatar" TEXT;
