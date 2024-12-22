// app/api/save-images/route.js

import clientPromise from '../../utils/mongodb'
import fs from 'fs'
import { NextResponse } from 'next/server'
import path from 'path'

export async function POST(req) {
  try {
    const { image, mask } = await req.json()
    
    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    // Generate unique filenames
    const timestamp = Date.now()
    const imageName = `image_${timestamp}.png`
    const maskName = `mask_${timestamp}.png`
    
    // Save files to disk
    const imageBuffer = Buffer.from(image.split(',')[1], 'base64')
    const maskBuffer = Buffer.from(mask.split(',')[1], 'base64')
    
    fs.writeFileSync(path.join(uploadDir, imageName), imageBuffer)
    fs.writeFileSync(path.join(uploadDir, maskName), maskBuffer)
    
    // Save to MongoDB
    const client = await clientPromise
    const db = client.db('inpainting')
    
    const result = await db.collection('images').insertOne({
      originalImage: {
        path: `/uploads/${imageName}`,
        filename: imageName,
        uploadedAt: new Date()
      },
      mask: {
        path: `/uploads/${maskName}`,
        filename: maskName,
        uploadedAt: new Date()
      },
      status: 'Processed',
      createdAt: new Date()
    })

    return NextResponse.json({ 
      success: true, 
      imageId: result.insertedId,
      imagePath: `/uploads/${imageName}`,
      maskPath: `/uploads/${maskName}`
    })
    
  } catch (error) { 
    console.log('Error saving images:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save images' },
      { status: 500 }
    )
  }
}

// Get all images
export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('inpainting')
    
    const images = await db.collection('images')
      .find({})
      .sort({ createdAt: -1 })
      .toArray()
    
    return NextResponse.json({ success: true, images })
    
  } catch (error) {
    console.error('Error fetching images:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch images' },
      { status: 500 }
    )
  }
}
