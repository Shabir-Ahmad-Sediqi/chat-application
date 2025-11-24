import ImageKit from "imagekit";
import "dotenv/config"
import fs from "fs";

const requireEnv = (name: string, value?: string): string => {
    if (!value) throw new Error(`${name} environment variable is required`);
    return value;
};

const imagekit = new ImageKit({
    publicKey: requireEnv('IMAGEKIT_PUBLIC_KEY', process.env.IMAGEKIT_PUBLIC_KEY),
    privateKey: requireEnv('IMAGEKIT_PRIVATE_KEY', process.env.IMAGEKIT_PRIVATE_KEY),
    urlEndpoint: requireEnv('IMAGEKIT_ENDPOINT_URL', process.env.IMAGEKIT_ENDPOINT_URL)
});

const buffer = fs.readFileSync("./download.jpeg");

imagekit.upload({
  file: buffer.toString("base64"),
  fileName: "test.jpg"
}, (err, result) => {
  if (err) {
    console.error("ImageKit error:", err);
  } else {
    console.log("Upload success:", result);
  }
});

export default imagekit