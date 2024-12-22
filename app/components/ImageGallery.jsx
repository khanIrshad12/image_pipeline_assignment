import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

const ImageGallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await fetch('/api/save-images');
      const data = await response.json();
      
      if (data.success) {
        setImages(data.images);
      } else {
        setError('Failed to fetch images');
      }
    } catch (err) {
      setError('Error loading images');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        {error}
        <Button 
          onClick={fetchImages}
          className="ml-2"
          variant="outline"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Uploaded Images</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image) => (
          <Card key={image._id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Original Image</h3>
                  <img
                    src={image.originalImage.path}
                    alt="Original"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
                <div className='bg-black'>
                  <h3 className="font-semibold mb-2">Mask</h3>
                  <img
                    src={image.mask.path}
                    alt="Mask"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
                <div className="text-sm text-gray-500">
                  Uploaded: {new Date(image.createdAt).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {images.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No images uploaded yet.
        </div>
      )}
    </div>
  );
};

export default ImageGallery;