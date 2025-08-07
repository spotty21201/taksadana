import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import ZAI from "z-ai-web-dev-sdk"

interface FinancialModelRequest {
  propertyId: string
  loanAmount?: number
  interestRate?: number
  loanTerm?: number
  includeStressTest?: boolean
  scenarios?: string[]
}

interface FinancialModelResult {
  loanToValue: number
  debtServiceCoverage: number
  estimatedRoi: number
  cashFlow: number
  capRate: number
  stressTestResults: any
  scenarioAnalysis: any[]
  recommendedLoanAmount: number
  riskAssessment: any
}

async function generateAIFinancialModel(propertyData: any, valuationData: any, options: any): Promise<FinancialModelResult> {
  try {
    const zai = await ZAI.create()

    const estimatedValue = valuationData?.estimatedValue || 1000000000 // Default to 1B if not available
    const valuePerSqm = valuationData?.valuePerSqm || 10000000 // Default to 10M/m²

    const prompt = `
    You are an expert financial analyst specializing in real estate financing and investment analysis in Indonesia.
    
    Please analyze the following property and valuation data to create a comprehensive financial model:
    
    Property Details:
    - Address: ${propertyData.address}
    - District: ${propertyData.district}
    - City: ${propertyData.city}
    - Asset Type: ${propertyData.assetType}
    - Land Size: ${propertyData.landSize} m²
    - Building Size: ${propertyData.buildingSize || 'N/A'} m²
    - Ownership Status: ${propertyData.ownershipStatus}
    
    Valuation Data:
    - Estimated Value: Rp ${estimatedValue.toLocaleString('id-ID')}
    - Value per m²: Rp ${valuePerSqm.toLocaleString('id-ID')}
    - Confidence Score: ${valuationData?.confidenceScore || 'N/A'}
    
    Financing Options:
    - Loan Amount: Rp ${options.loanAmount?.toLocaleString('id-ID') || 'To be calculated'}
    - Interest Rate: ${options.interestRate || 11}% (typical Indonesian rate)
    - Loan Term: ${options.loanTerm || 10} years
    - Include Stress Test: ${options.includeStressTest ? 'Yes' : 'No'}
    - Scenarios: ${options.scenarios?.join(', ') || 'Base case only'}
    
    Please provide:
    1. Loan-to-Value (LTV) ratio calculation
    2. Debt Service Coverage Ratio (DSCR)
    3. Estimated ROI
    4. Annual cash flow projection
    5. Capitalization rate
    6. Stress test results (if requested)
    7. Scenario analysis for different market conditions
    8. Recommended loan amount
    9. Risk assessment and mitigation strategies
    
    Format your response as a JSON object with the following structure:
    {
      "loanToValue": number,
      "debtServiceCoverage": number,
      "estimatedRoi": number,
      "cashFlow": number,
      "capRate": number,
      "stressTestResults": {
        "interestRateShock": number,
        "rentalDecline": number,
        "valueDecline": number,
        "impact": "LOW|MEDIUM|HIGH"
      },
      "scenarioAnalysis": [
        {
          "name": "string",
          "description": "string",
          "roi": number,
          "cashFlow": number,
          "probability": number
        }
      ],
      "recommendedLoanAmount": number,
      "riskAssessment": {
        "overallRisk": "LOW|MEDIUM|HIGH",
        "factors": ["string"],
        "mitigation": ["string"]
      }
    }
    `

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert Indonesian real estate financial analyst with deep knowledge of property financing, investment analysis, and risk assessment in the Indonesian market."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    })

    const responseContent = completion.choices[0]?.message?.content
    
    if (!responseContent) {
      throw new Error("No response from AI")
    }

    try {
      const financialData = JSON.parse(responseContent)
      return financialData
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError)
      return generateFallbackFinancialModel(propertyData, valuationData, options)
    }

  } catch (error) {
    console.error("Error in AI financial modeling:", error)
    return generateFallbackFinancialModel(propertyData, valuationData, options)
  }
}

function generateFallbackFinancialModel(propertyData: any, valuationData: any, options: any): FinancialModelResult {
  const estimatedValue = valuationData?.estimatedValue || 1000000000
  const loanAmount = options.loanAmount || (estimatedValue * 0.7) // 70% LTV default
  const interestRate = options.interestRate || 11 // 11% typical Indonesian rate
  const loanTerm = options.loanTerm || 10 // 10 years
  
  // Calculate LTV
  const loanToValue = loanAmount / estimatedValue
  
  // Calculate annual loan payment (simplified)
  const monthlyRate = interestRate / 100 / 12
  const numPayments = loanTerm * 12
  const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1)
  const annualPayment = monthlyPayment * 12
  
  // Estimate rental income based on property type and value
  const rentalYield = {
    RESIDENTIAL: 0.05, // 5%
    COMMERCIAL: 0.07,  // 7%
    INDUSTRIAL: 0.06, // 6%
    MIXED_USE: 0.065, // 6.5%
    LAND_ONLY: 0.02,  // 2%
    AGRICULTURAL: 0.03 // 3%
  }
  
  const yieldRate = rentalYield[propertyData.assetType] || rentalYield.RESIDENTIAL
  const annualRentalIncome = estimatedValue * yieldRate
  
  // Calculate cash flow and DSCR
  const operatingExpenses = annualRentalIncome * 0.3 // 30% operating expenses
  const netOperatingIncome = annualRentalIncome - operatingExpenses
  const cashFlow = netOperatingIncome - annualPayment
  const debtServiceCoverage = annualPayment > 0 ? netOperatingIncome / annualPayment : 0
  
  // Calculate ROI and Cap Rate
  const estimatedRoi = cashFlow / loanAmount
  const capRate = netOperatingIncome / estimatedValue
  
  // Generate stress test results
  const stressTestResults = {
    interestRateShock: interestRate + 3, // 3% rate increase
    rentalDecline: 0.8, // 20% rental decline
    valueDecline: 0.85, // 15% value decline
    impact: "MEDIUM"
  }
  
  // Generate scenario analysis
  const scenarioAnalysis = [
    {
      name: "Base Case",
      description: "Current market conditions",
      roi: estimatedRoi,
      cashFlow: cashFlow,
      probability: 0.6
    },
    {
      name: "Optimistic",
      description: "Strong market growth",
      roi: estimatedRoi * 1.5,
      cashFlow: cashFlow * 1.3,
      probability: 0.2
    },
    {
      name: "Pessimistic",
      description: "Market downturn",
      roi: estimatedRoi * 0.5,
      cashFlow: cashFlow * 0.7,
      probability: 0.2
    }
  ]

  return {
    loanToValue,
    debtServiceCoverage,
    estimatedRoi,
    cashFlow,
    capRate,
    stressTestResults,
    scenarioAnalysis,
    recommendedLoanAmount: estimatedValue * 0.7,
    riskAssessment: {
      overallRisk: loanToValue > 0.8 ? "HIGH" : loanToValue > 0.6 ? "MEDIUM" : "LOW",
      factors: [
        "Market conditions",
        "Interest rate risk",
        "Property location",
        "Asset type"
      ],
      mitigation: [
        "Maintain adequate reserves",
        "Monitor market trends",
        "Consider fixed interest rate",
        "Regular property maintenance"
      ]
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: FinancialModelRequest = await request.json()
    const { 
      propertyId, 
      loanAmount, 
      interestRate = 11, 
      loanTerm = 10, 
      includeStressTest = true,
      scenarios = ["Base Case", "Optimistic", "Pessimistic"]
    } = body

    if (!propertyId) {
      return NextResponse.json(
        { error: "Property ID is required" },
        { status: 400 }
      )
    }

    // Fetch property data
    const property = await db.property.findUnique({
      where: { id: propertyId },
      include: {
        valuations: {
          orderBy: { valuationDate: "desc" },
          take: 1
        }
      }
    })

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      )
    }

    const latestValuation = property.valuations[0]

    // Generate AI-powered financial model
    const financialModelResult = await generateAIFinancialModel(
      property, 
      latestValuation, 
      {
        loanAmount,
        interestRate,
        loanTerm,
        includeStressTest,
        scenarios
      }
    )

    // Save financial model to database
    const financialModel = await db.financialModel.create({
      data: {
        propertyId,
        loanToValue: financialModelResult.loanToValue,
        debtServiceCoverage: financialModelResult.debtServiceCoverage,
        estimatedRoi: financialModelResult.estimatedRoi,
        cashFlow: financialModelResult.cashFlow,
        capRate: financialModelResult.capRate,
        stressTestResults: JSON.stringify(financialModelResult.stressTestResults),
        scenarioAnalysis: JSON.stringify(financialModelResult.scenarioAnalysis),
        recommendedLoanAmount: financialModelResult.recommendedLoanAmount,
        riskAssessment: JSON.stringify(financialModelResult.riskAssessment)
      }
    })

    return NextResponse.json({
      success: true,
      financialModel: {
        id: financialModel.id,
        loanToValue: financialModel.loanToValue,
        debtServiceCoverage: financialModel.debtServiceCoverage,
        estimatedRoi: financialModel.estimatedRoi,
        cashFlow: financialModel.cashFlow,
        capRate: financialModel.capRate,
        stressTestResults: financialModelResult.stressTestResults,
        scenarioAnalysis: financialModelResult.scenarioAnalysis,
        recommendedLoanAmount: financialModel.recommendedLoanAmount,
        riskAssessment: financialModelResult.riskAssessment
      }
    })

  } catch (error) {
    console.error("Error in financial modeling:", error)
    return NextResponse.json(
      { error: "Failed to create financial model" },
      { status: 500 }
    )
  }
}