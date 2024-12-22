'use client'

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'

const ImageCanvas = forwardRef(({ image, brushSize }, ref) => {
  const canvasRef = useRef(null)
  const imageRef = useRef(null)
  const isDrawing = useRef(false)

  useImperativeHandle(ref, () => canvasRef.current)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const img = new Image()
    img.src = image
    imageRef.current = img

    img.onload = () => {
      // Set canvas dimensions to match the image
      canvas.width = img.width
      canvas.height = img.height

      // Fill canvas with black background
      ctx.fillStyle = 'black'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Store the original image as a hidden reference
      imageRef.current = img
    }
  }, [image])

  const startDrawing = (e) => {
    isDrawing.current = true
    draw(e)
  }

  const stopDrawing = () => {
    isDrawing.current = false
  }

  const draw = (e) => {
    if (!isDrawing.current) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    // Draw white brush stroke
    ctx.fillStyle = 'white'
    ctx.beginPath()
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2)
    ctx.fill()
  }

  const getCursorStyle = () => {
    return {
      cursor: 'crosshair',
      width: '100%',
      height: 'auto',
      maxHeight: '70vh',
      objectFit: 'contain'
    }
  }

  return (
    <div className="relative inline-block">
      <img 
        src={image} 
        alt="Original" 
        className="absolute top-0 left-0 w-full h-full opacity-50 pointer-events-none" 
        style={{ objectFit: 'contain' }}
      />
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        onMouseMove={draw}
        className="border border-gray-300"
        style={getCursorStyle()}
      />
    </div>
  )
})

ImageCanvas.displayName = 'ImageCanvas'

export default ImageCanvas