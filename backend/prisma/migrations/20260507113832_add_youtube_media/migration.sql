-- CreateTable
CREATE TABLE "YoutubeMedia" (
    "id" TEXT NOT NULL,
    "journalEntryId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "youtubeId" TEXT NOT NULL,

    CONSTRAINT "YoutubeMedia_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "YoutubeMedia" ADD CONSTRAINT "YoutubeMedia_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
