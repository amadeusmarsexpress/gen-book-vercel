// pages/api/upscale.js
import Replicate from 'replicate';
const replicate = new Replicate();

const upscaleImage = async (url) => {
    //console.log(url);
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
    /*if (req.method === 'POST') {
      try {
        const { imageUrl, scale } = req.body;
  
        const replicateApiKey = process.env.REPLICATE_API_KEY; // Store your API key in environment variables for security
  
        // Request to Replicate API
        const response = await fetch("https://api.replicate.com/v1/predictions", {
          method: "POST",
          headers: {
            "Authorization": `Token ${replicateApiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            version: "f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa",  // Model ID for Replicate's Real-ESRGAN
            input: {
              image: imageUrl,
              scale: scale
            }
          })
        });
  
        const data = await response.json();
  
        if (response.ok) {
          res.status(200).json({ output: data });
        } else {
          res.status(response.status).json({ error: data });
        }
      } catch (error) {
        res.status(500).json({ error: "Failed to upscale the image" });
      }
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    } */

 
  }
  