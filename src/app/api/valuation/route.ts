import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { ValuationService } from "@/lib/valuation-service"

interface ValuationRequest {
  propertyId: string
  includeComparables?: boolean
  includeLegalCheck?: boolean
  includeFinancialModel?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body: ValuationRequest = await request.json()
    const { propertyId, includeComparables = true, includeLegalCheck = false, includeFinancialModel = false } = body

    if (!propertyId) {
      return NextResponse.json(
        { error: "Property ID is required" },
        { status: 400 }
      )
    }

    // Fetch property data
    const property = await db.property.findUnique({
      where: { id: propertyId }
    })

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      )
    }

    // Prepare property data for valuation service
    const propertyData = {
      id: property.id,
      address: property.address,
      district: property.district,
      city: property.city,
      province: property.province,
      landSize: property.landSize,
      buildingSize: property.buildingSize || undefined,
      assetType: property.assetType,
      zoning: property.zoning || undefined,
      landUse: property.landUse || undefined,
      ownershipStatus: property.ownershipStatus,
      certificateNumber: property.certificateNumber || undefined,
      yearBuilt: property.yearBuilt || undefined,
      condition: property.condition || undefined,
      description: property.description || undefined,
      features: property.features ? JSON.parse(property.features) : undefined
    }

    // Generate AI-powered valuation using the service
    const valuationService = ValuationService.getInstance()
    const valuationResult = await valuationService.performValuation(propertyData)

    // Save valuation to database
    const valuation = await db.valuation.create({
      data: {
        propertyId,
        userId: property.userId,
        estimatedValue: valuationResult.estimatedValue,
        valuePerSqm: valuationResult.valuePerSqm,
        confidenceScore: valuationResult.confidenceScore,
        valuationMethod: valuationResult.valuationMethod,
        marketTrends: JSON.stringify(valuationResult.marketTrends),
        comparableAnalysis: JSON.stringify(valuationResult.comparableAnalysis),
        riskFactors: JSON.stringify(valuationResult.riskFactors),
        strategicValue: JSON.stringify(valuationResult.strategicValue),
        notes: valuationResult.notes
      }
    })

    // Save comparable properties if requested
    if (includeComparables && valuationResult.comparableAnalysis) {
      for (const comp of valuationResult.comparableAnalysis) {
        await db.comparableProperty.create({
          data: {
            propertyId,
            address: comp.address,
            district: comp.district,
            city: comp.city,
            landSize: comp.landSize,
            buildingSize: comp.buildingSize,
            assetType: comp.assetType as any,
            transactionPrice: comp.transactionPrice ? new Date() : undefined,
            pricePerSqm: comp.pricePerSqm,
            distance: comp.distance,
            similarityScore: comp.similarityScore,
            dataSource: comp.dataSource,
            rawData: JSON.stringify(comp)
          }
        })
      }
    }

    // Perform legal check if requested
    let legalCheck = null
    if (includeLegalCheck) {
      legalCheck = await db.legalCheck.create({
        data: {
          propertyId,
          ownershipVerified: property.ownershipStatus === "CERTIFIED",
          certificateValid: !!property.certificateNumber,
          zoningCompliant: true, // Default to true, would integrate with Jakarta Satu in production
          landUsePermitted: true, // Default to true, would integrate with Sentuh Tanahku in production
          complianceScore: property.ownershipStatus === "CERTIFIED" ? 0.9 : 0.6,
          riskFlags: JSON.stringify({
            ownership: property.ownershipStatus === "CERTIFIED" ? null : "Ownership verification required",
            certificate: property.certificateNumber ? null : "Certificate number missing"
          })
        }
      })
    }

    // Create financial model if requested
    let financialModel = null
    if (includeFinancialModel) {
      const ltv = 0.7 // 70% loan-to-value ratio
      const estimatedRoi = 0.08 // 8% estimated ROI
      
      financialModel = await db.financialModel.create({
        data: {
          propertyId,
          loanToValue: ltv,
          estimatedRoi,
          recommendedLoanAmount: valuationResult.estimatedValue * ltv,
          riskAssessment: JSON.stringify({
            riskLevel: valuationResult.confidenceScore > 0.8 ? "LOW" : "MEDIUM",
            factors: ["Market conditions", "Property location", "Asset type"]
          })
        }
      })
    }

    return NextResponse.json({
      success: true,
      valuation: {
        id: valuation.id,
        estimatedValue: valuation.estimatedValue,
        valuePerSqm: valuation.valuePerSqm,
        confidenceScore: valuation.confidenceScore,
        valuationMethod: valuation.valuationMethod,
        valuationDate: valuation.valuationDate,
        marketTrends: valuationResult.marketTrends,
        comparableAnalysis: valuationResult.comparableAnalysis,
        riskFactors: valuationResult.riskFactors,
        strategicValue: valuationResult.strategicValue,
        notes: valuation.notes
      },
      legalCheck,
      financialModel
    })

  } catch (error) {
    console.error("Error in valuation:", error)
    return NextResponse.json(
      { error: "Failed to perform valuation" },
      { status: 500 }
    )
  }
}