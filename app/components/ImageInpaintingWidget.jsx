'use client'
import React, { useState, useRef } from 'react'
import CanvasDraw from 'react-canvas-draw'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import ImageGallery from '../components/ImageGallery'
import { Undo } from 'lucide-react'

export default function ImageInpaintingWidget() {
  const [image, setImage] = useState(null)
  const [brushSize, setBrushSize] = useState(10)
  const [showGallery, setShowGallery] = useState(true)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const canvasRef = useRef(null)

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const maxWidth = 800
          const maxHeight = 600
          let width = img.width
          let height = img.height

          if (width > maxWidth) {
            height = (maxWidth * height) / width
            width = maxWidth
          }
          if (height > maxHeight) {
            width = (maxHeight * width) / height
            height = maxHeight
          }

          setCanvasSize({ width, height })
          setImage(e.target.result)
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    }
  }

  const handleExport = async () => {
    if (canvasRef.current) {
      const maskDataUrl = canvasRef.current.getDataURL()

      try {
        const response = await fetch('/api/save-images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image, mask: maskDataUrl }),
        })

        const data = await response.json()

        if (data.success) {
          /* Toast.success('Images saved successfully') */
          setShowGallery(false)
          setTimeout(() => setShowGallery(true), 100)
        } else {
        /*   Toast.error('Failed to save images') */
        }
      } catch (error) {
        console.error('Failed to save images:', error)
        /* Toast.error('Failed to save images') */
      }
    }
  }

  const handleClear = () => {
    if (canvasRef.current) {
      canvasRef.current.clear()
    }
  }

  const handleUndo = () => {
    if (canvasRef.current) {
      canvasRef.current.undo()
    }
  }


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Image Inpainting Widget</h1>

      <div className="mb-8">
        {!image ? (
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="mb-4 w-56"
          />
        ) : (
          <>
            <div className="mb-4 w-56">
              <label htmlFor="brush-size" className="block text-sm font-medium text-gray-700">
                Brush Size
              </label>
              <Slider
                id="brush-size"
                min={1}
                max={50}
                step={1}
                value={[brushSize]}
                onValueChange={(value) => setBrushSize(value[0])}
                className="w-full"
              />
            </div>

            <div className="relative inline-block">
              <div style={{ 
                position: 'relative',
                backgroundColor: '#000000',
                border: '1px solid #ccc'
              }}>
                <CanvasDraw
                className='object-contain md:w-[30rem] md:h-[30rem] w-full h-full'
                  ref={canvasRef}
                  imgSrc={image}
                  brushRadius={brushSize / 2}
                  brushColor={"#FFFFFF"}
                  backgroundColor="#000000"
                  hideGrid={true}
                  canvasWidth={canvasSize.width}
                  canvasHeight={canvasSize.height}
                  lazyRadius={0}
                  disabled={false}
                  immediateLoading={true}
                />
              </div>
            </div>

            <div className="mt-4 space-x-2">
            
              <Button onClick={handleUndo} variant="outline">
                <Undo className="w-4 h-4 mr-2" />
                Undo
              </Button>
              <Button onClick={handleExport}>Export Mask</Button>
              <Button onClick={handleClear} variant="outline">
                Clear Canvas
              </Button>
            </div>

            <Button 
              onClick={() => {
                setImage(null)
                setCanvasSize({ width: 0, height: 0 })
              }} 
              variant="outline" 
              className="mt-4"
            >
              Upload New Image
            </Button>
          </>
        )}
      </div>

      {showGallery && <ImageGallery />}
    </div>
  )
}