import React from 'react';

const Moral = ({ moral, setMoral }) => {
  const handleImageUpload = (e) => {
    const file = e.target.files[0];  // Store the actual file
    setMoral({ ...moral, image: file });
  };

  return (
    <div className="my-6">
      <h2 className="text-2xl mb-2">End Page (Moral)</h2>
      <input type="file" onChange={handleImageUpload} />
      {/* Preview the image */}
      {moral.image && (
        <img src={URL.createObjectURL(moral.image)} alt="Moral Preview" className="mt-4 w-32 h-32 object-contain" />
      )}
      <textarea
        className="border p-2 w-full mt-2 "
        placeholder="Enter moral content"
        value={moral.content}
        onChange={(e) => setMoral({ ...moral, content: e.target.value })}
      />
    </div>
  );
};

export default Moral;
