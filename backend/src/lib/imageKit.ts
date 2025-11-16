import ImageKit from "imagekit";
import "dotenv/config"

const requireEnv = (name: string, value?: string): string => {
    if (!value) throw new Error(`${name} environment variable is required`);
    return value;
};

const imagekit = new ImageKit({
    publicKey: requireEnv('IMAGEKIT_PUBLIC_KEY', process.env.IMAGEKIT_PUBLIC_KEY),
    privateKey: requireEnv('IMAGEKIT_PRIVATE_KEY', process.env.IMAGEKIT_PRIVATE_KEY),
    urlEndpoint: requireEnv('IMAGEKIT_ENDPOINT_URL', process.env.IMAGEKIT_ENDPOINT_URL)
});

export default imagekit