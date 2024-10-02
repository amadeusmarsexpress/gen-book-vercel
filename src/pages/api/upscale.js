// pages/api/upscale.js
import Replicate from 'replicate';
const replicate = new Replicate();

const upscaleImage = async (url) => {
    const input = { image: url, scale: 2 };
    const output = await replicate.run(
      "nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa",
      { input }
    );
    return output;
  };

export default async function handler(req, res) {
    const { imageUrl, scale } = req.body;
    const urlOutput = await upscaleImage(imageUrl);
    res.status(200).json({ output: urlOutput });
  }
  