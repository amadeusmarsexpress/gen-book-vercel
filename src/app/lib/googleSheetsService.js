import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';

// Load service account key file
const SERVICE_ACCOUNT_FILE = path.join(process.cwd(), 'src', 'app',  'lib', 'serviceAccountKey.json');

// Function to authenticate using the service account
const authenticate = () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive',
    ],
  });

  return auth;
};

// Function to create a new Google Sheet and share it
export const createGoogleSheet = async (userEmail) => {
  const auth = authenticate();
  const sheets = google.sheets({ version: 'v4', auth });
  const drive = google.drive({ version: 'v3', auth });

  // Create the Google Sheet
  const request = {
    resource: {
      properties: {
        title: 'Aesop Coloring Book',
      },
    },
  };

  const response = await sheets.spreadsheets.create(request);
  const spreadsheetId = response.data.spreadsheetId;

  // Share the Google Sheet with the user
  await drive.permissions.create({
    fileId: spreadsheetId,
    resource: {
      role: 'writer',
      type: 'user',
      emailAddress: userEmail,
    },
    fields: 'id',
  });

  return spreadsheetId;
};

// Function to upload image to Google Drive
export const uploadImageToDrive = async (filePath, mimeType) => {
  const auth = authenticate();
  const drive = google.drive({ version: 'v3', auth });

  const fileMetadata = {
    name: path.basename(filePath),
  };

  const media = {
    mimeType: mimeType,
    body: fs.createReadStream(filePath),
  };

  const file = await drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id',
  });

  // Make the file public
  await drive.permissions.create({
    fileId: file.data.id,
    resource: {
      role: 'reader',
      type: 'anyone',
    },
  });

  const fileUrl = `https://drive.google.com/uc?export=view&id=${file.data.id}`;
  return fileUrl;
};

// Function to write data to Google Sheet
export const writeToGoogleSheet = async (spreadsheetId, data) => {
  const auth = authenticate();
  const sheets = google.sheets({ version: 'v4', auth });

  // Update each row with the data (using the =IMAGE("url") function for image cells)
  const updatedData = data.map(row => [
    row[0], // ID
    row[1], // Content
    `=IMAGE("${row[2]}")`, // Image URL converted to the IMAGE() function in Google Sheets
  ]);

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'Sheet1!A1',
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: updatedData,
    },
  });

  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
};
