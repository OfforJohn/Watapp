import "dotenv/config";
import fs from "fs";
import path from "path";
import { put } from "@vercel/blob";

async function uploadDir(localDir, remoteDir) {
  const entries = fs.readdirSync(localDir, { withFileTypes: true });

  for (const entry of entries) {
    const localPath = path.join(localDir, entry.name);
    const remotePath = path.posix.join(remoteDir, entry.name);

    if (entry.isDirectory()) {
      // Recurse into subfolders
      await uploadDir(localPath, remotePath);
    } else {
      // Upload file
      const content = fs.readFileSync(localPath);
      const { url } = await put(remotePath, content, {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN,
        
  allowOverwrite: true, // ✅ overwrite if it already exists
      });
      console.log(`✅ Uploaded: ${remotePath} → ${url}`);
    }
  }
}

(async () => {
  try {
    await uploadDir("./public/avatars", "avatars");
    console.log("🎉 All files uploaded successfully!");
  } catch (err) {
    console.error("❌ Upload failed:", err);
  }
})();
