import { google } from 'googleapis';
import { promises as fs } from 'fs';
import path from 'path';
import { Readable } from 'stream';

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive',
];

// Load the service account key JSON file
//const keyFilePath = path.join(process.cwd(),'src','app','lib', 'serviceAccountKey.json');
  

// Function to authorize and create a Google Sheets instance
const authorize = async () => {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
  //const credentials = JSON.parse(await fs.readFile(keyFilePath, 'utf8'));
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
  });
  console.log(auth);
  const client = await auth.getClient();
  console.log(client)
  const sheets = google.sheets({ version: 'v4', auth: client });
  const drive = google.drive({ version: 'v3', auth: client });
  return { sheets, drive };
};

// Create a Google Sheet and upload XLSX file
const createGoogleSheet = async (drive, fileName, fileData) => {
    // Create an empty Google Sheet
    const fileMetadata = {
      name: fileName,
      mimeType: 'application/vnd.google-apps.spreadsheet',
    };
  
    // Convert base64 string to binary buffer and create a readable stream
    const media = {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      body: Readable.from(Buffer.from(fileData, 'base64')),  // Convert base64 to buffer and stream
    };
  
    // Upload XLSX file to Google Sheets
    const file = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: 'id',
    });
  
    const fileId = file.data.id;
  
    // Set the file to be publicly accessible
    await drive.permissions.create({
      fileId: fileId,
      resource: {
        role: 'reader', // Set the role to "reader"
        type: 'anyone',  // Set the type to "anyone"
      },
    });
  
    const googleSheetUrl = `https://docs.google.com/spreadsheets/d/${fileId}`;
    return { googleSheetUrl, fileId };
  };

// Export Google Sheet as XLSX
const exportGoogleSheetAsXLSX = async (drive, fileId) => {
  // Use the Drive API to export the file as XLSX
  const response = await drive.files.export(
    {
      fileId: fileId,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // Export as XLSX
    },
    { responseType: 'stream' }
  );

  return response.data;  // This will return the file stream
};

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '300mb',  // Set the body size limit to 10MB (or higher if needed)
    },
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { fileName, fileData, email } = req.body;

      const { sheets, drive } = await authorize();

      // Upload the XLSX file to Google Sheets and get fileId
      const { googleSheetUrl, fileId } = await createGoogleSheet(drive, fileName, fileData, email);

      // Export the Google Sheet as XLSX
      const xlsxStream = await exportGoogleSheetAsXLSX(drive, fileId);

      // Set headers for XLSX download
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      // Pipe the file stream to the response to trigger the download
      xlsxStream.pipe(res);

    } catch (error) {
      console.error('Error uploading file to Google Sheets:', error);
      res.status(500).json({ error: 'Failed to upload to Google Sheets' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
