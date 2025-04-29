import express from "express";
import { exec } from "child_process";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import fs from "fs";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post("/merge", async (req, res) => {
  try {
    const { files, output_filename } = req.body;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No input videos provided." });
    }

    const tempFiles = [];

    for (const fileUrl of files) {
      const response = await axios.get(fileUrl, { responseType: "stream" });
      const tempFilePath = `/tmp/${uuidv4()}.mp4`;
      const writer = fs.createWriteStream(tempFilePath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      tempFiles.push(tempFilePath);
    }

    const fileListPath = `/tmp/${uuidv4()}.txt`;
    const fileListContent = tempFiles.map((file) => `file '${file}'`).join("\n");
    fs.writeFileSync(fileListPath, fileListContent);

    const outputPath = `/tmp/${output_filename}`;

    exec(`ffmpeg -f concat -safe 0 -i ${fileListPath} -c copy ${outputPath}`, async (error, stdout, stderr) => {
      if (error) {
        console.error(`Error merging videos: ${error.message}`);
        return res.status(500).json({ error: "Failed to merge videos." });
      }

      res.download(outputPath, output_filename, (err) => {
        if (err) {
          console.error(`Error sending file: ${err.message}`);
          res.status(500).json({ error: "Failed to send file." });
        }

        // Clean up temp files
        tempFiles.forEach(fs.unlinkSync);
        fs.unlinkSync(fileListPath);
        fs.unlinkSync(outputPath);
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error." });
  }
});

app.get("/", (req, res) => {
  res.send("FFmpeg API is running...");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
