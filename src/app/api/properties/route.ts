import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      address,
      district,
      city,
      province,
      postalCode,
      coordinates,
      landSize,
      buildingSize,
      assetType,
      zoning,
      landUse,
      ownershipStatus,
      certificateNumber,
      yearBuilt,
      condition,
      description,
      features,
      userId = "default-user" // In real app, get from auth
    } = body

    // Validate required fields
    if (!address || !district || !city || !landSize || !assetType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Create property in database
    const property = await db.property.create({
      data: {
        address,
        district,
        city,
        province,
        postalCode,
        coordinates: coordinates ? JSON.stringify(coordinates) : null,
        landSize: parseFloat(landSize),
        buildingSize: buildingSize ? parseFloat(buildingSize) : null,
        assetType,
        zoning,
        landUse,
        ownershipStatus,
        certificateNumber,
        yearBuilt: yearBuilt ? parseInt(yearBuilt) : null,
        condition,
        description,
        features: features && features.length > 0 ? JSON.stringify(features) : null,
        userId
      }
    })

    return NextResponse.json({
      success: true,
      property: {
        id: property.id,
        address: property.address,
        district: property.district,
        city: property.city,
        assetType: property.assetType,
        landSize: property.landSize,
        createdAt: property.createdAt
      }
    })

  } catch (error) {
    console.error("Error creating property:", error)
    return NextResponse.json(
      { error: "Failed to create property" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") || "default-user"
    const limit = parseInt(searchParams.get("limit") || "10")
    const offset = parseInt(searchParams.get("offset") || "0")

    const properties = await db.property.findMany({
      where: { userId },
      include: {
        valuations: {
          orderBy: { valuationDate: "desc" },
          take: 1
        },
        legalChecks: {
          orderBy: { verificationDate: "desc" },
          take: 1
        }
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset
    })

    return NextResponse.json({
      success: true,
      properties,
      total: await db.property.count({ where: { userId } })
    })

  } catch (error) {
    console.error("Error fetching properties:", error)
    return NextResponse.json(
      { error: "Failed to fetch properties" },
      { status: 500 }
    )
  }
}