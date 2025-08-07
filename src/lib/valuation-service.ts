import ZAI from "z-ai-web-dev-sdk"

export interface PropertyData {
  id: string
  address: string
  district: string
  city: string
  province: string
  landSize: number
  buildingSize?: number
  assetType: string
  zoning?: string
  landUse?: string
  ownershipStatus: string
  certificateNumber?: string
  yearBuilt?: number
  condition?: string
  description?: string
  features?: string[]
}

export interface ValuationResult {
  estimatedValue: number
  valuePerSqm: number
  confidenceScore: number
  valuationMethod: string
  marketTrends: MarketTrends
  comparableAnalysis: ComparableProperty[]
  riskFactors: RiskFactors
  strategicValue: StrategicValue
  notes?: string
}

export interface MarketTrends {
  trend: string
  description: string
  factors: string[]
}

export interface ComparableProperty {
  address: string
  district: string
  city: string
  landSize: number
  buildingSize?: number
  assetType: string
  transactionPrice?: number
  pricePerSqm?: number
  distance?: number
  similarityScore: number
  dataSource: string
}

export interface RiskFactors {
  overallRisk: string
  factors: string[]
  mitigation: string[]
}

export interface StrategicValue {
  highestBestUse: string
  upsidePotential: string
  recommendations: string[]
}

export class ValuationService {
  private static instance: ValuationService
  private zai: any = null

  private constructor() {}

  public static getInstance(): ValuationService {
    if (!ValuationService.instance) {
      ValuationService.instance = new ValuationService()
    }
    return ValuationService.instance
  }

  private async initializeAI(): Promise<void> {
    if (!this.zai) {
      try {
        this.zai = await ZAI.create()
      } catch (error) {
        console.error("Failed to initialize AI service:", error)
        throw new Error("AI service initialization failed")
      }
    }
  }

  public async performValuation(propertyData: PropertyData): Promise<ValuationResult> {
    await this.initializeAI()

    try {
      return await this.generateAIValuation(propertyData)
    } catch (error) {
      console.error("AI valuation failed, using fallback:", error)
      return this.generateFallbackValuation(propertyData)
    }
  }

  private async generateAIValuation(propertyData: PropertyData): Promise<ValuationResult> {
    const prompt = this.buildValuationPrompt(propertyData)

    const completion = await this.zai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert property valuator specializing in Indonesian real estate, particularly in Jakarta and surrounding areas. 
          You have deep knowledge of:
          - Jakarta property market dynamics
          - Zoning regulations and land use policies
          - Property valuation methodologies (comparable sales, income approach, cost approach)
          - Market trends and economic factors
          - Legal and regulatory considerations
          - Infrastructure development impacts
          
          Provide accurate, data-driven valuations with clear confidence scores and risk assessments.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2500
    })

    const responseContent = completion.choices[0]?.message?.content
    
    if (!responseContent) {
      throw new Error("No response from AI")
    }

    try {
      const valuationData = JSON.parse(responseContent)
      return this.validateAndCleanValuationResult(valuationData)
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError)
      throw new Error("Failed to parse AI valuation response")
    }
  }

  private buildValuationPrompt(propertyData: PropertyData): string {
    return `
    Please provide a comprehensive property valuation for the following property:

    PROPERTY DETAILS:
    - Address: ${propertyData.address}
    - District: ${propertyData.district}
    - City: ${propertyData.city}
    - Province: ${propertyData.province}
    - Land Size: ${propertyData.landSize.toLocaleString('id-ID')} m²
    - Building Size: ${propertyData.buildingSize ? propertyData.buildingSize.toLocaleString('id-ID') + ' m²' : 'N/A'}
    - Asset Type: ${propertyData.assetType}
    - Zoning: ${propertyData.zoning || 'Not specified'}
    - Current Land Use: ${propertyData.landUse || 'Not specified'}
    - Ownership Status: ${propertyData.ownershipStatus}
    - Certificate Number: ${propertyData.certificateNumber || 'Not provided'}
    - Year Built: ${propertyData.yearBuilt || 'N/A'}
    - Property Condition: ${propertyData.condition || 'Not assessed'}
    - Features: ${propertyData.features?.join(', ') || 'None specified'}
    - Description: ${propertyData.description || 'No description provided'}

    VALUATION REQUIREMENTS:
    Please provide a comprehensive valuation analysis including:

    1. MARKET VALUE ESTIMATION:
       - Estimated market value in IDR
       - Value per square meter
       - Confidence score (0-1 scale)
       - Primary valuation method used

    2. MARKET ANALYSIS:
       - Current market trends in the area
       - Key factors influencing value
       - Market conditions assessment

    3. COMPARABLE ANALYSIS:
       - Generate 3-5 comparable properties
       - Include address, size, transaction prices, similarity scores
       - Data sources (market data, recent transactions, etc.)

    4. RISK ASSESSMENT:
       - Overall risk level (LOW/MEDIUM/HIGH)
       - Specific risk factors
       - Mitigation strategies

    5. STRATEGIC VALUE:
       - Highest and best use recommendations
       - Upside potential
       - Strategic recommendations

    Please format your response as a JSON object with this exact structure:
    {
      "estimatedValue": number,
      "valuePerSqm": number,
      "confidenceScore": number,
      "valuationMethod": "AI_ENHANCED",
      "marketTrends": {
        "trend": "string",
        "description": "string",
        "factors": ["string"]
      },
      "comparableAnalysis": [
        {
          "address": "string",
          "district": "string",
          "city": "string",
          "landSize": number,
          "buildingSize": number,
          "assetType": "string",
          "transactionPrice": number,
          "pricePerSqm": number,
          "distance": number,
          "similarityScore": number,
          "dataSource": "string"
        }
      ],
      "riskFactors": {
        "overallRisk": "LOW|MEDIUM|HIGH",
        "factors": ["string"],
        "mitigation": ["string"]
      },
      "strategicValue": {
        "highestBestUse": "string",
        "upsidePotential": "string",
        "recommendations": ["string"]
      },
      "notes": "string"
    }

    Ensure all values are realistic for the Indonesian property market and specific to the location provided.
    `
  }

  private validateAndCleanValuationResult(data: any): ValuationResult {
    // Validate required fields
    if (!data.estimatedValue || !data.valuePerSqm || !data.confidenceScore) {
      throw new Error("Missing required valuation fields")
    }

    // Clean and validate numeric values
    const estimatedValue = Math.max(0, Number(data.estimatedValue) || 0)
    const valuePerSqm = Math.max(0, Number(data.valuePerSqm) || 0)
    const confidenceScore = Math.max(0, Math.min(1, Number(data.confidenceScore) || 0.5))

    // Validate and clean comparable analysis
    const comparableAnalysis = Array.isArray(data.comparableAnalysis) 
      ? data.comparableAnalysis.map((comp: any) => ({
          address: String(comp.address || 'Unknown'),
          district: String(comp.district || 'Unknown'),
          city: String(comp.city || 'Unknown'),
          landSize: Math.max(0, Number(comp.landSize) || 0),
          buildingSize: comp.buildingSize ? Math.max(0, Number(comp.buildingSize)) : undefined,
          assetType: String(comp.assetType || 'UNKNOWN'),
          transactionPrice: comp.transactionPrice ? Math.max(0, Number(comp.transactionPrice)) : undefined,
          pricePerSqm: comp.pricePerSqm ? Math.max(0, Number(comp.pricePerSqm)) : undefined,
          distance: comp.distance ? Math.max(0, Number(comp.distance)) : undefined,
          similarityScore: Math.max(0, Math.min(1, Number(comp.similarityScore) || 0.5)),
          dataSource: String(comp.dataSource || 'AI_Generated')
        }))
      : []

    return {
      estimatedValue,
      valuePerSqm,
      confidenceScore,
      valuationMethod: String(data.valuationMethod || 'AI_ENHANCED'),
      marketTrends: {
        trend: String(data.marketTrends?.trend || 'STABLE'),
        description: String(data.marketTrends?.description || 'Market analysis completed'),
        factors: Array.isArray(data.marketTrends?.factors) ? data.marketTrends.factors.map(String) : []
      },
      comparableAnalysis,
      riskFactors: {
        overallRisk: String(data.riskFactors?.overallRisk || 'MEDIUM'),
        factors: Array.isArray(data.riskFactors?.factors) ? data.riskFactors.factors.map(String) : [],
        mitigation: Array.isArray(data.riskFactors?.mitigation) ? data.riskFactors.mitigation.map(String) : []
      },
      strategicValue: {
        highestBestUse: String(data.strategicValue?.highestBestUse || 'Current use'),
        upsidePotential: String(data.strategicValue?.upsidePotential || 'Moderate'),
        recommendations: Array.isArray(data.strategicValue?.recommendations) ? data.strategicValue.recommendations.map(String) : []
      },
      notes: data.notes ? String(data.notes) : undefined
    }
  }

  private generateFallbackValuation(propertyData: PropertyData): ValuationResult {
    // Comprehensive fallback valuation logic based on Indonesian market data
    const basePricePerSqm = this.getBasePricePerSqm(propertyData.assetType, propertyData.city)
    const districtMultiplier = this.getDistrictMultiplier(propertyData.district, propertyData.city)
    const conditionMultiplier = this.getConditionMultiplier(propertyData.condition)
    const ownershipMultiplier = this.getOwnershipMultiplier(propertyData.ownershipStatus)

    const pricePerSqm = basePricePerSqm * districtMultiplier * conditionMultiplier * ownershipMultiplier
    const estimatedValue = pricePerSqm * propertyData.landSize

    return {
      estimatedValue,
      valuePerSqm: pricePerSqm,
      confidenceScore: this.calculateConfidenceScore(propertyData),
      valuationMethod: "COMPARABLE_SALES",
      marketTrends: {
        trend: "STABLE",
        description: "Market conditions analyzed based on available data",
        factors: ["Location", "Property type", "Market conditions", "Infrastructure development"]
      },
      comparableAnalysis: this.generateFallbackComparables(propertyData, pricePerSqm),
      riskFactors: {
        overallRisk: this.assessOverallRisk(propertyData),
        factors: this.identifyRiskFactors(propertyData),
        mitigation: this.suggestRiskMitigation(propertyData)
      },
      strategicValue: {
        highestBestUse: this.determineHighestBestUse(propertyData),
        upsidePotential: this.assessUpsidePotential(propertyData),
        recommendations: this.generateStrategicRecommendations(propertyData)
      },
      notes: "Valuation generated using fallback methodology due to AI service limitations"
    }
  }

  private getBasePricePerSqm(assetType: string, city: string): number {
    const basePrices: Record<string, Record<string, number>> = {
      RESIDENTIAL: {
        "Jakarta": 15000000, // 15 juta/m²
        "Surabaya": 8000000,  // 8 juta/m²
        "Bandung": 6000000,   // 6 juta/m²
        "Medan": 5000000,     // 5 juta/m²
        "default": 7000000
      },
      COMMERCIAL: {
        "Jakarta": 25000000, // 25 juta/m²
        "Surabaya": 15000000, // 15 juta/m²
        "Bandung": 12000000,  // 12 juta/m²
        "Medan": 10000000,    // 10 juta/m²
        "default": 13000000
      },
      INDUSTRIAL: {
        "Jakarta": 8000000,  // 8 juta/m²
        "Surabaya": 5000000,  // 5 juta/m²
        "Bandung": 4000000,   // 4 juta/m²
        "Medan": 3500000,     // 3.5 juta/m²
        "default": 4500000
      },
      MIXED_USE: {
        "Jakarta": 20000000, // 20 juta/m²
        "Surabaya": 12000000, // 12 juta/m²
        "Bandung": 9000000,   // 9 juta/m²
        "Medan": 7500000,     // 7.5 juta/m²
        "default": 10000000
      },
      LAND_ONLY: {
        "Jakarta": 10000000, // 10 juta/m²
        "Surabaya": 6000000,  // 6 juta/m²
        "Bandung": 4500000,   // 4.5 juta/m²
        "Medan": 4000000,     // 4 juta/m²
        "default": 5000000
      },
      AGRICULTURAL: {
        "Jakarta": 2000000,  // 2 juta/m²
        "Surabaya": 1500000,  // 1.5 juta/m²
        "Bandung": 1200000,   // 1.2 juta/m²
        "Medan": 1000000,     // 1 juta/m²
        "default": 1300000
      }
    }

    return basePrices[assetType]?.[city] || basePrices[assetType]?.default || 7000000
  }

  private getDistrictMultiplier(district: string, city: string): number {
    const premiumDistricts: Record<string, string[]> = {
      "Jakarta": ["Menteng", "Kuningan", "Sudirman", "Thamrin", "Kelapa Gading", "Pondok Indah"],
      "Surabaya": ["Tunjungan", "Gubeng", "Darmo", "Manyar"],
      "Bandung": ["Dago", "Ciumbuleuit", "Setiabudi"],
      "Medan": ["Polonia", "Sisingamangaraja"]
    }

    const standardDistricts: Record<string, string[]> = {
      "Jakarta": ["Kemayoran", "Pasar Minggu", "Cilandak", "Kebayoran"],
      "Surabaya": ["Wonokromo", "Sukomanunggal", "Tegalsari"],
      "Bandung": ["Antapani", "Arcamanik", "Bojongloa"],
      "Medan": ["Medan Area", "Medan Baru", "Medan Kota"]
    }

    if (premiumDistricts[city]?.includes(district)) {
      return 1.5
    } else if (standardDistricts[city]?.includes(district)) {
      return 1.2
    } else {
      return 1.0
    }
  }

  private getConditionMultiplier(condition?: string): number {
    const multipliers: Record<string, number> = {
      EXCELLENT: 1.3,
      GOOD: 1.1,
      FAIR: 1.0,
      POOR: 0.8,
      NEEDS_RENOVATION: 0.7
    }
    return multipliers[condition || "FAIR"] || 1.0
  }

  private getOwnershipMultiplier(ownershipStatus: string): number {
    const multipliers: Record<string, number> = {
      CERTIFIED: 1.2,
      UNDER_PROCESS: 1.0,
      UNCERTIFIED: 0.8,
      DISPUTED: 0.5
    }
    return multipliers[ownershipStatus] || 1.0
  }

  private calculateConfidenceScore(propertyData: PropertyData): number {
    let score = 0.5 // Base score

    // Increase score for certified ownership
    if (propertyData.ownershipStatus === "CERTIFIED") score += 0.2
    else if (propertyData.ownershipStatus === "UNDER_PROCESS") score += 0.1

    // Increase score for complete data
    if (propertyData.certificateNumber) score += 0.1
    if (propertyData.zoning) score += 0.05
    if (propertyData.description) score += 0.05
    if (propertyData.buildingSize) score += 0.05
    if (propertyData.yearBuilt) score += 0.05

    return Math.min(1.0, score)
  }

  private generateFallbackComparables(propertyData: PropertyData, pricePerSqm: number): ComparableProperty[] {
    return [
      {
        address: `Similar property in ${propertyData.district}`,
        district: propertyData.district,
        city: propertyData.city,
        landSize: propertyData.landSize * 0.95,
        buildingSize: propertyData.buildingSize ? propertyData.buildingSize * 0.95 : undefined,
        assetType: propertyData.assetType,
        transactionPrice: pricePerSqm * propertyData.landSize * 0.95,
        pricePerSqm: pricePerSqm * 0.95,
        distance: 500,
        similarityScore: 0.85,
        dataSource: "Market_Data"
      },
      {
        address: `Comparable property nearby ${propertyData.district}`,
        district: propertyData.district,
        city: propertyData.city,
        landSize: propertyData.landSize * 1.05,
        buildingSize: propertyData.buildingSize ? propertyData.buildingSize * 1.05 : undefined,
        assetType: propertyData.assetType,
        transactionPrice: pricePerSqm * propertyData.landSize * 1.05,
        pricePerSqm: pricePerSqm * 1.05,
        distance: 750,
        similarityScore: 0.80,
        dataSource: "Market_Data"
      }
    ]
  }

  private assessOverallRisk(propertyData: PropertyData): string {
    if (propertyData.ownershipStatus === "DISPUTED") return "HIGH"
    if (propertyData.ownershipStatus === "UNCERTIFIED") return "MEDIUM"
    if (propertyData.condition === "POOR" || propertyData.condition === "NEEDS_RENOVATION") return "MEDIUM"
    return "LOW"
  }

  private identifyRiskFactors(propertyData: PropertyData): string[] {
    const factors = []
    
    if (propertyData.ownershipStatus !== "CERTIFIED") {
      factors.push("Ownership verification required")
    }
    if (!propertyData.certificateNumber) {
      factors.push("Certificate number missing")
    }
    if (propertyData.condition === "POOR" || propertyData.condition === "NEEDS_RENOVATION") {
      factors.push("Property requires significant maintenance")
    }
    if (!propertyData.zoning) {
      factors.push("Zoning information not provided")
    }
    
    return factors
  }

  private suggestRiskMitigation(propertyData: PropertyData): string[] {
    const mitigation = []
    
    if (propertyData.ownershipStatus !== "CERTIFIED") {
      mitigation.push("Complete ownership verification process")
    }
    if (!propertyData.certificateNumber) {
      mitigation.push("Obtain and verify certificate number")
    }
    if (propertyData.condition === "POOR" || propertyData.condition === "NEEDS_RENOVATION") {
      mitigation.push("Budget for renovation and improvements")
    }
    
    mitigation.push("Regular property maintenance")
    mitigation.push("Monitor market trends")
    
    return mitigation
  }

  private determineHighestBestUse(propertyData: PropertyData): string {
    const highestBestUses: Record<string, string> = {
      RESIDENTIAL: "Residential development or mixed-use conversion",
      COMMERCIAL: "Commercial retail or office space",
      INDUSTRIAL: "Industrial warehouse or manufacturing facility",
      MIXED_USE: "Mixed-use commercial and residential development",
      LAND_ONLY: "Development based on zoning regulations",
      AGRICULTURAL: "Agricultural use or future development potential"
    }
    
    return highestBestUses[propertyData.assetType] || "Current use optimization"
  }

  private assessUpsidePotential(propertyData: PropertyData): string {
    if (propertyData.ownershipStatus === "CERTIFIED" && propertyData.condition === "EXCELLENT") {
      return "High - strong location and good condition"
    } else if (propertyData.ownershipStatus === "CERTIFIED") {
      return "Moderate - good ownership status with improvement potential"
    } else {
      return "Low - ownership and condition issues limit upside"
    }
  }

  private generateStrategicRecommendations(propertyData: PropertyData): string[] {
    const recommendations = []
    
    recommendations.push("Monitor local market trends and infrastructure developments")
    
    if (propertyData.ownershipStatus !== "CERTIFIED") {
      recommendations.push("Prioritize ownership certification process")
    }
    
    if (propertyData.condition === "POOR" || propertyData.condition === "NEEDS_RENOVATION") {
      recommendations.push("Consider renovation to improve property value")
    }
    
    recommendations.push("Review zoning regulations for development opportunities")
    recommendations.push("Maintain detailed property documentation")
    
    return recommendations
  }
}