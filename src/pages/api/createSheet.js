import { createGoogleSheet, writeToGoogleSheet, uploadImageToDrive } from '../../app/lib/googleSheetsService';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { sheetData, imageFiles, userEmail } = req.body;

    try {
      // Step 1: Create a new Google Sheet
      const spreadsheetId = await createGoogleSheet(userEmail);

      // Step 2: Upload images to Google Drive and get their URLs
      const imageUrls = await Promise.all(imageFiles.map(async (file) => {
        const { filePath, mimeType } = file;
        const imageUrl = await uploadImageToDrive(filePath, mimeType);
        return imageUrl;
      }));

      // Step 3: Insert the content and image URLs into the Google Sheet
      const updatedSheetData = sheetData.map((row, index) => {
        return [row[0], row[1], imageUrls[index]]; // Insert image URL for each row
      });

      await writeToGoogleSheet(spreadsheetId, updatedSheetData);

      // Respond with the Google Sheet URL
      res.status(200).json({ sheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit` });
    } catch (error) {
      console.error('Error creating Google Sheet:', error);
      res.status(500).json({ error: 'Error creating Google Sheet' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
