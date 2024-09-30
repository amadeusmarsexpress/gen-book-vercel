import React from 'react';

const PageContent = ({ page, setPage, removePage }) => {
  const handleImageUpload = (e) => {
    const file = e.target.files[0];  // Store the actual file
    setPage({ ...page, image: file });
  };

  return (
    <div className="border p-4 mb-4">
      <h3 className="text-xl mb-2">Page Content</h3>
      <input
        type="file"
        onChange={handleImageUpload}
      />
      {/* Preview the image */}
      {page.image && (
        <img src={URL.createObjectURL(page.image)} alt="Page Preview" className="mt-4" />
      )}
      <textarea
        className="border p-2 w-full mt-2"
        placeholder="Enter page content"
        value={page.content}
        onChange={(e) => setPage({ ...page, content: e.target.value })}
      />
      <button className="text-red-500 mt-2" onClick={removePage}>
        Remove Page
      </button>
    </div>
  );
};

export default PageContent;
