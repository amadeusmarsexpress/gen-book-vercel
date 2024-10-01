"use client";  

import '../app/globals.css'; 

import React, { useState } from 'react';
import { storage, ref, uploadBytes, getDownloadURL } from '../app/lib/firebase';
import Replicate from 'replicate';
import ExcelJS from 'exceljs';

import Cover from '../components/Cover';
import PageContent from '../components/PageContent';
import Moral from '../components/Moral';

const BookGenerator = () => {
  const [pages, setPages] = useState([]);
  const [cover, setCover] = useState({ title: '', image: null });
  const [moral, setMoral] = useState({ image: null, content: '' });
  const [isGenerating, setIsGenerating] = useState(false);

  const replicate = new Replicate();
  const addPage = () => setPages([...pages, { image: null, content: '' }]);
  const removePage = (index) => setPages(pages.filter((_, i) => i !== index));

  const uploadImageToFirebase = async (file, fileName) => {
    const imageRef = ref(storage, `images/${fileName}`);
    await uploadBytes(imageRef, file);
    return getDownloadURL(imageRef);
  };

  const upscaleImage = async (url) => {
    try {
      const response = await fetch('/api/upscale', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: url,
          scale: 2,  // Adjust the scale as needed
        }),
      });
  
      const data = await response.json();
      if (response.ok) {
        console.log(data);
        return data.output;
      } else {
        console.error("Failed to upscale image", data.error);
        return null;
      }
    } catch (error) {
      console.error("Error calling upscale API:", error);
      return null;
    }
  };

  const fetchImageAsBuffer = async (url) => {
    const response = await fetch(url);
    return response.arrayBuffer();
  };

  const generateXLSX = async () => {
    setIsGenerating(true);

    const workbook = new ExcelJS.Workbook();
    const coverSheet = workbook.addWorksheet('Cover');
    const contentSheet = workbook.addWorksheet('Content');
    const moralSheet = workbook.addWorksheet('Moral');

    console.log(cover, moral)

    const upscaledCoverImage = await uploadAndUpscale(cover.image, 'cover.jpg');
    const upscaledMoralImage = await uploadAndUpscale(moral.image, 'moral.jpg');

    console.log(upscaledCoverImage, upscaledMoralImage)

    const upscaledPages = await Promise.all(
      pages.map(async (page, index) => {
        const upscaledImage = await uploadAndUpscale(page.image, `page-${index}.jpg`);
        console.log(upscaledImage)
        return { ...page, image: upscaledImage };
      })
    );

    console.log(upscaledPages);

    // Embed images into the sheets
    if (upscaledCoverImage) {
      const coverImageBuffer = await fetchImageAsBuffer(upscaledCoverImage);
      const coverImageId = workbook.addImage({
        buffer: coverImageBuffer,
        extension: 'jpeg',
      });
      coverSheet.getCell('A1').value = "id";
      coverSheet.getCell('B1').value = "content";
      coverSheet.getCell('C1').value = "image";

      coverSheet.getCell('A2').value = 1;
      coverSheet.getCell('B2').value = cover.title;
      coverSheet.addImage(coverImageId, 'C2:C2');
    }

    if (upscaledMoralImage) {
      const moralImageBuffer = await fetchImageAsBuffer(upscaledMoralImage);
      const moralImageId = workbook.addImage({
        buffer: moralImageBuffer,
        extension: 'jpeg',
      });
      moralSheet.getCell('A1').value = "id";
      moralSheet.getCell('B1').value = "content";
      moralSheet.getCell('C1').value = "image";

      moralSheet.getCell('A2').value = 1;
      moralSheet.getCell('B2').value = cover.title;
      moralSheet.addImage(moralImageId, 'C2:C2');
    }

    contentSheet.getCell('A1').value = "id";
    contentSheet.getCell('B1').value = "content";
    contentSheet.getCell('C1').value = "image";


    await Promise.all(upscaledPages.map(async (page, index) => {
      console.log(page, index);
      const pageImageBuffer = await fetchImageAsBuffer(page.image);
      const pageImageId = workbook.addImage({
        buffer: pageImageBuffer,
        extension: 'jpeg',
      });
    
      contentSheet.getCell(`A${index + 2}`).value = index + 1;
      contentSheet.addImage(pageImageId, `C${index + 2}:C${index + 2}`);
      contentSheet.getCell(`B${index + 2}`).value = page.content;
    }));


    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AesopBook.xlsx';
    a.click();

    setIsGenerating(false);
  };

  const uploadAndUpscale = async (file, fileName) => {
    if (file) {
      const uploadedUrl = await uploadImageToFirebase(file, fileName);
      const upscaledUrl = await upscaleImage(uploadedUrl);
      return upscaledUrl;
    }
    return null;
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Generate Aesop Coloring Book</h1>

      {/* Cover Section */}
      <Cover cover={cover} setCover={setCover} />

      {/* Pages Section */}
      <div className="my-4">
        <h2 className="text-2xl mb-2">Content Pages</h2>
        {pages.map((page, index) => (
          <PageContent
            key={index}
            page={page}
            setPage={(updatedPage) => {
              const newPages = [...pages];
              newPages[index] = updatedPage;
              setPages(newPages);
            }}
            removePage={() => removePage(index)}
          />
        ))}
        <button
          className="bg-green-500 text-white py-2 px-4 rounded mt-4"
          onClick={addPage}
        >
          Add Page
        </button>
      </div>

      {/* Moral Section */}
      <Moral moral={moral} setMoral={setMoral} />

      <button
        className="bg-blue-500 text-white py-2 px-4 rounded mt-6"
        onClick={generateXLSX}
        disabled={isGenerating}
      >
        {isGenerating ? 'Generating...' : 'Generate XLSX'}
      </button>
    </div>
  );
};

export default BookGenerator;
