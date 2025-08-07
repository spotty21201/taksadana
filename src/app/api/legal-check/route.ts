import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import ZAI from "z-ai-web-dev-sdk"

interface LegalCheckRequest {
  propertyId: string
  includeJakartaSatu?: boolean
  includeSentuhTanahku?: boolean
}

interface LegalCheckResult {
  ownershipVerified: boolean
  certificateValid: boolean
  zoningCompliant: boolean
  landUsePermitted: boolean
  encumbrances: any[]
  disputes: any[]
  restrictions: any[]
  complianceScore: number
  riskFlags: string[]
  verificationDate: Date
  notes?: string
}

async function performAILegalCheck(propertyData: any, options: any): Promise<LegalCheckResult> {
  try {
    const zai = await ZAI.create()

    const prompt = `
    You are an expert in Indonesian property law and land registration systems, including Jakarta Satu and Sentuh Tanahku.
    
    Please analyze the following property data and provide a comprehensive legal verification:
    
    Property Details:
    - Address: ${propertyData.address}
    - District: ${propertyData.district}
    - City: ${propertyData.city}
    - Province: ${propertyData.province}
    - Ownership Status: ${propertyData.ownershipStatus}
    - Certificate Number: ${propertyData.certificateNumber || 'Not provided'}
    - Zoning: ${propertyData.zoning || 'Not specified'}
    - Land Use: ${propertyData.landUse || 'Not specified'}
    - Asset Type: ${propertyData.assetType}
    
    Analysis Options:
    - Include Jakarta Satu data: ${options.includeJakartaSatu ? 'Yes' : 'No'}
    - Include Sentuh Tanahku data: ${options.includeSentuhTanahku ? 'Yes' : 'No'}
    
    Please provide:
    1. Ownership verification status
    2. Certificate validation
    3. Zoning compliance check
    4. Land use permit verification
    5. Any encumbrances or liens
    6. Disputes or legal issues
    7. Usage restrictions
    8. Overall compliance score (0-1)
    9. Risk flags and concerns
    
    Format your response as a JSON object with the following structure:
    {
      "ownershipVerified": boolean,
      "certificateValid": boolean,
      "zoningCompliant": boolean,
      "landUsePermitted": boolean,
      "encumbrances": [
        {
          "type": "string",
          "description": "string",
          "severity": "LOW|MEDIUM|HIGH"
        }
      ],
      "disputes": [
        {
          "type": "string",
          "description": "string",
          "status": "ACTIVE|RESOLVED"
        }
      ],
      "restrictions": [
        {
          "type": "string",
          "description": "string",
          "impact": "LOW|MEDIUM|HIGH"
        }
      ],
      "complianceScore": number,
      "riskFlags": ["string"],
      "notes": "string"
    }
    `

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert Indonesian property lawyer with deep knowledge of land registration systems, zoning laws, and property regulations in Jakarta and across Indonesia."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 1500
    })

    const responseContent = completion.choices[0]?.message?.content
    
    if (!responseContent) {
      throw new Error("No response from AI")
    }

    try {
      const legalCheckData = JSON.parse(responseContent)
      return {
        ...legalCheckData,
        verificationDate: new Date()
      }
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError)
      return generateFallbackLegalCheck(propertyData)
    }

  } catch (error) {
    console.error("Error in AI legal check:", error)
    return generateFallbackLegalCheck(propertyData)
  }
}

function generateFallbackLegalCheck(propertyData: any): LegalCheckResult {
  // Basic legal check logic
  const isCertified = propertyData.ownershipStatus === "CERTIFIED"
  const hasCertificate = !!propertyData.certificateNumber
  
  const riskFlags = []
  if (!isCertified) {
    riskFlags.push("Ownership not certified")
  }
  if (!hasCertificate) {
    riskFlags.push("Certificate number missing")
  }
  if (!propertyData.zoning) {
    riskFlags.push("Zoning information not provided")
  }

  const complianceScore = isCertified && hasCertificate ? 0.8 : 0.5

  return {
    ownershipVerified: isCertified,
    certificateValid: hasCertificate,
    zoningCompliant: true, // Default assumption
    landUsePermitted: true, // Default assumption
    encumbrances: [],
    disputes: [],
    restrictions: [],
    complianceScore,
    riskFlags,
    verificationDate: new Date(),
    notes: "Legal check generated using fallback methodology due to AI service limitations"
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: LegalCheckRequest = await request.json()
    const { propertyId, includeJakartaSatu = true, includeSentuhTanahku = true } = body

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

    // Perform AI-powered legal check
    const legalCheckResult = await performAILegalCheck(property, {
      includeJakartaSatu,
      includeSentuhTanahku
    })

    // Save legal check to database
    const legalCheck = await db.legalCheck.create({
      data: {
        propertyId,
        ownershipVerified: legalCheckResult.ownershipVerified,
        certificateValid: legalCheckResult.certificateValid,
        zoningCompliant: legalCheckResult.zoningCompliant,
        landUsePermitted: legalCheckResult.landUsePermitted,
        encumbrances: JSON.stringify(legalCheckResult.encumbrances),
        disputes: JSON.stringify(legalCheckResult.disputes),
        restrictions: JSON.stringify(legalCheckResult.restrictions),
        complianceScore: legalCheckResult.complianceScore,
        riskFlags: JSON.stringify(legalCheckResult.riskFlags),
        verificationDate: legalCheckResult.verificationDate,
        notes: legalCheckResult.notes
      }
    })

    return NextResponse.json({
      success: true,
      legalCheck: {
        id: legalCheck.id,
        ownershipVerified: legalCheck.ownershipVerified,
        certificateValid: legalCheck.certificateValid,
        zoningCompliant: legalCheck.zoningCompliant,
        landUsePermitted: legalCheck.landUsePermitted,
        encumbrances: legalCheckResult.encumbrances,
        disputes: legalCheckResult.disputes,
        restrictions: legalCheckResult.restrictions,
        complianceScore: legalCheck.complianceScore,
        riskFlags: legalCheckResult.riskFlags,
        verificationDate: legalCheck.verificationDate,
        notes: legalCheck.notes
      }
    })

  } catch (error) {
    console.error("Error in legal check:", error)
    return NextResponse.json(
      { error: "Failed to perform legal check" },
      { status: 500 }
    )
  }
}