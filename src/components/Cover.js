import React from 'react';

const Cover = ({ cover, setCover }) => {
  const handleImageUpload = (e) => {
    const file = e.target.files[0];  // Store the actual file
    console.log(file);
    setCover({ ...cover, image: file });
  };

  return (
    <div className="mb-6">
      <h2 className="text-2xl mb-2">Cover</h2>
      <input
        type="text"
        placeholder="Enter book title"
        className="border p-2 mb-2 w-full"
        value={cover.title}
        onChange={(e) => setCover({ ...cover, title: e.target.value })}
      />
      <input type="file" onChange={handleImageUpload} />
      {cover.image && (
        <img src={URL.createObjectURL(cover.image)} alt="Cover Preview" className="mt-4" />
      )}
    </div>
  );
};

export default Cover;
