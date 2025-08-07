"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  MapPin, 
  Building2,
  DollarSign,
  Star,
  Award,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from "lucide-react"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter
} from "recharts"

interface Property {
  id: string
  address: string
  district: string
  city: string
  landSize: number
  buildingSize?: number
  assetType: string
  ownershipStatus: string
  estimatedValue?: number
  valuePerSqm?: number
  confidenceScore?: number
  coordinates?: string
  yearBuilt?: number
  condition?: string
  zoning?: string
  features?: string[]
}

interface ComparableAnalysis {
  subjectProperty: Property
  comparableProperties: Property[]
  marketAnalysis: {
    averagePricePerSqm: number
    priceTrend: "UP" | "DOWN" | "STABLE"
    marketVelocity: "HIGH" | "MEDIUM" | "LOW"
    demandLevel: "HIGH" | "MEDIUM" | "LOW"
  }
  competitivePosition: {
    valuePosition: "PREMIUM" | "ABOVE_AVERAGE" | "AVERAGE" | "BELOW_AVERAGE"
    locationScore: number
    conditionScore: number
    potentialScore: number
    overallScore: number
  }
  investmentMetrics: {
    estimatedRoi: number
    cashFlow: number
    appreciation: number
    riskLevel: "LOW" | "MEDIUM" | "HIGH"
  }
}

interface StrategicRecommendation {
  id: string
  category: "DEVELOPMENT" | "INVESTMENT" | "MANAGEMENT" | "DISPOSITION"
  priority: "HIGH" | "MEDIUM" | "LOW"
  title: string
  description: string
  expectedImpact: string
  timeline: string
  estimatedCost?: number
  riskFactors: string[]
  successFactors: string[]
}

interface ComparativeAnalysisProps {
  properties: Property[]
  subjectPropertyId: string
  onRecommendationSelect?: (recommendation: StrategicRecommendation) => void
}

export function ComparativeAnalysis({ 
  properties, 
  subjectPropertyId, 
  onRecommendationSelect 
}: ComparativeAnalysisProps) {
  const [activeTab, setActiveTab] = useState("comparison")
  const [selectedTimeframe, setSelectedTimeframe] = useState("1year")
  const [analysisFilters, setAnalysisFilters] = useState({
    includeSimilarSize: true,
    includeSimilarType: true,
    includeSimilarLocation: true,
    maxDistance: 5000 // meters
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('id-ID').format(value)
  }

  const getSubjectProperty = () => {
    return properties.find(p => p.id === subjectPropertyId)
  }

  const getComparableProperties = () => {
    const subject = getSubjectProperty()
    if (!subject) return []

    return properties.filter(p => {
      if (p.id === subjectPropertyId) return false
      
      // Apply filters
      if (analysisFilters.includeSimilarSize && Math.abs(p.landSize - subject.landSize) / subject.landSize > 0.3) return false
      if (analysisFilters.includeSimilarType && p.assetType !== subject.assetType) return false
      if (analysisFilters.includeSimilarLocation && p.district !== subject.district) return false
      
      return true
    }).slice(0, 10) // Limit to top 10 comparables
  }

  const generateComparativeAnalysis = (): ComparableAnalysis => {
    const subject = getSubjectProperty()
    const comparables = getComparableProperties()
    
    if (!subject) {
      throw new Error("Subject property not found")
    }

    // Calculate market analysis
    const allValues = [subject, ...comparables]
      .filter(p => p.estimatedValue)
      .map(p => p.estimatedValue!)
    
    const allPricesPerSqm = [subject, ...comparables]
      .filter(p => p.valuePerSqm)
      .map(p => p.valuePerSqm!)

    const averagePricePerSqm = allPricesPerSqm.length > 0 
      ? allPricesPerSqm.reduce((sum, val) => sum + val, 0) / allPricesPerSqm.length 
      : 0

    // Determine market trends (simplified logic)
    const priceTrend: "UP" | "DOWN" | "STABLE" = "STABLE" // Would be calculated from historical data
    const marketVelocity: "HIGH" | "MEDIUM" | "LOW" = "MEDIUM"
    const demandLevel: "HIGH" | "MEDIUM" | "LOW" = "MEDIUM"

    // Calculate competitive position
    const subjectValuePerSqm = subject.valuePerSqm || 0
    const valuePosition = subjectValuePerSqm > averagePricePerSqm * 1.2 ? "PREMIUM" :
                         subjectValuePerSqm > averagePricePerSqm * 1.1 ? "ABOVE_AVERAGE" :
                         subjectValuePerSqm > averagePricePerSqm * 0.9 ? "AVERAGE" : "BELOW_AVERAGE"

    const locationScore = subject.district === "Kelapa Gading" || subject.district === "Menteng" ? 0.9 : 0.7
    const conditionScore = subject.condition === "EXCELLENT" ? 0.9 : 
                         subject.condition === "GOOD" ? 0.8 :
                         subject.condition === "FAIR" ? 0.6 : 0.4
    const potentialScore = subject.zoning === "COMMERCIAL" || subject.zoning === "MIXED_USE" ? 0.9 : 0.7
    const overallScore = (locationScore + conditionScore + potentialScore) / 3

    // Calculate investment metrics
    const estimatedRoi = 0.08 // 8% default
    const cashFlow = subject.estimatedValue ? subject.estimatedValue * 0.06 : 0 // 6% cash yield
    const appreciation = 0.05 // 5% annual appreciation
    const riskLevel: "LOW" | "MEDIUM" | "HIGH" = overallScore > 0.8 ? "LOW" : overallScore > 0.6 ? "MEDIUM" : "HIGH"

    return {
      subjectProperty: subject,
      comparableProperties: comparables,
      marketAnalysis: {
        averagePricePerSqm,
        priceTrend,
        marketVelocity,
        demandLevel
      },
      competitivePosition: {
        valuePosition,
        locationScore,
        conditionScore,
        potentialScore,
        overallScore
      },
      investmentMetrics: {
        estimatedRoi,
        cashFlow,
        appreciation,
        riskLevel
      }
    }
  }

  const generateStrategicRecommendations = (analysis: ComparableAnalysis): StrategicRecommendation[] => {
    const { subjectProperty, competitivePosition, investmentMetrics } = analysis

    const recommendations: StrategicRecommendation[] = []

    // Development recommendations
    if (subjectProperty.zoning === "COMMERCIAL" && subjectProperty.assetType === "RESIDENTIAL") {
      recommendations.push({
        id: "dev_1",
        category: "DEVELOPMENT",
        priority: "HIGH",
        title: "Mixed-Use Conversion",
        description: "Convert residential property to mixed-use commercial-residential development to maximize value potential",
        expectedImpact: "30-50% value increase through higher commercial utilization",
        timeline: "18-24 months",
        estimatedCost: subjectProperty.estimatedValue ? subjectProperty.estimatedValue * 0.4 : 0,
        riskFactors: ["Regulatory approval", "Construction delays", "Market timing"],
        successFactors: ["Location suitability", "Commercial demand", "Funding availability"]
      })
    }

    // Investment recommendations
    if (investmentMetrics.estimatedRoi > 0.1) {
      recommendations.push({
        id: "inv_1",
        category: "INVESTMENT",
        priority: "HIGH",
        title: "Hold for Appreciation",
        description: "Maintain current ownership to benefit from strong market appreciation and rental income growth",
        expectedImpact: "8-12% annual returns through appreciation and cash flow",
        timeline: "3-5 years",
        riskFactors: ["Market downturn", "Interest rate changes", "Property-specific issues"],
        successFactors: ["Market conditions", "Property maintenance", "Tenant quality"]
      })
    }

    // Management recommendations
    if (subjectProperty.condition === "FAIR" || subjectProperty.condition === "POOR") {
      recommendations.push({
        id: "mgmt_1",
        category: "MANAGEMENT",
        priority: "MEDIUM",
        title: "Property Renovation",
        description: "Renovate and upgrade property to improve condition and rental appeal",
        expectedImpact: "15-25% value increase and higher rental rates",
        timeline: "6-12 months",
        estimatedCost: subjectProperty.estimatedValue ? subjectProperty.estimatedValue * 0.15 : 0,
        riskFactors: ["Cost overruns", "Renovation delays", "Permitting issues"],
        successFactors: ["Quality contractors", "Proper planning", "Market timing"]
      })
    }

    // Disposition recommendations
    if (competitivePosition.overallScore < 0.6) {
      recommendations.push({
        id: "disp_1",
        category: "DISPOSITION",
        priority: "MEDIUM",
        title: "Strategic Sale",
        description: "Consider selling property and reinvesting in higher-potential opportunities",
        expectedImpact: "Capital redeployment to better performing assets",
        timeline: "6-9 months",
        riskFactors: ["Market timing", "Transaction costs", "Reinvestment risk"],
        successFactors: ["Market timing", "Buyer identification", "Tax optimization"]
      })
    }

    // Add general recommendations
    recommendations.push({
      id: "gen_1",
      category: "MANAGEMENT",
      priority: "LOW",
      title: "Optimize Operations",
      description: "Improve property management and operational efficiency",
      expectedImpact: "5-10% increase in net operating income",
      timeline: "3-6 months",
      riskFactors: ["Implementation challenges", "Tenant disruption"],
      successFactors: ["Management expertise", "Tenant cooperation", "Cost control"]
    })

    return recommendations.sort((a, b) => {
      const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  const analysis = generateComparativeAnalysis()
  const recommendations = generateStrategicRecommendations(analysis)

  // Chart data
  const comparisonChartData = analysis.comparableProperties.map(comp => ({
    name: comp.address.split(',')[0],
    valuePerSqm: comp.valuePerSqm || 0,
    landSize: comp.landSize,
    distance: Math.random() * 5000 // Mock distance
  }))

  const radarChartData = [
    { subject: 'Location', A: analysis.competitivePosition.locationScore * 100, B: 75 },
    { subject: 'Condition', A: analysis.competitivePosition.conditionScore * 100, B: 70 },
    { subject: 'Potential', A: analysis.competitivePosition.potentialScore * 100, B: 65 },
    { subject: 'Market', A: 80, B: 70 },
    { subject: 'Accessibility', A: 85, B: 75 }
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH": return "bg-red-100 text-red-800"
      case "MEDIUM": return "bg-yellow-100 text-yellow-800"
      case "LOW": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "DEVELOPMENT": return Building2
      case "INVESTMENT": return TrendingUp
      case "MANAGEMENT": return Target
      case "DISPOSITION": return DollarSign
      default: return Lightbulb
    }
  }

  const getValuePositionColor = (position: string) => {
    switch (position) {
      case "PREMIUM": return "text-purple-600"
      case "ABOVE_AVERAGE": return "text-blue-600"
      case "AVERAGE": return "text-yellow-600"
      case "BELOW_AVERAGE": return "text-red-600"
      default: return "text-gray-600"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Comparative Analysis & Strategic Recommendations
          </CardTitle>
          <CardDescription>
            Advanced comparative analysis and AI-powered strategic recommendations for {analysis.subjectProperty.address}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getValuePositionColor(analysis.competitivePosition.valuePosition)}`}>
                {analysis.competitivePosition.valuePosition.replace(/_/g, ' ')}
              </div>
              <div className="text-sm text-muted-foreground">Value Position</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {Math.round(analysis.competitivePosition.overallScore * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Competitive Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(analysis.marketAnalysis.averagePricePerSqm)}
              </div>
              <div className="text-sm text-muted-foreground">Avg Price/m²</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {Math.round(analysis.investmentMetrics.estimatedRoi * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Est. ROI</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Analysis */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="comparison">Market Comparison</TabsTrigger>
          <TabsTrigger value="competitive">Competitive Position</TabsTrigger>
          <TabsTrigger value="recommendations">Strategic Recs</TabsTrigger>
          <TabsTrigger value="insights">Market Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="comparison" className="space-y-4">
          {/* Market Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Market Analysis Overview</CardTitle>
              <CardDescription>
                Current market conditions and trends affecting your property
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    {analysis.marketAnalysis.priceTrend === "UP" ? 
                      <ArrowUpRight className="h-6 w-6 text-green-600" /> :
                     analysis.marketAnalysis.priceTrend === "DOWN" ? 
                      <ArrowDownRight className="h-6 w-6 text-red-600" /> :
                      <Minus className="h-6 w-6 text-blue-600" />
                    }
                  </div>
                  <div className="font-semibold">{analysis.marketAnalysis.priceTrend}</div>
                  <div className="text-sm text-muted-foreground">Price Trend</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600">
                    {analysis.marketAnalysis.marketVelocity}
                  </div>
                  <div className="text-sm text-muted-foreground">Market Velocity</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600">
                    {analysis.marketAnalysis.demandLevel}
                  </div>
                  <div className="text-sm text-muted-foreground">Demand Level</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-purple-600">
                    {analysis.comparableProperties.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Comparables Found</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comparative Properties Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Price per m² Comparison</CardTitle>
              <CardDescription>
                Your property compared to similar properties in the market
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={[
                  {
                    name: "Your Property",
                    valuePerSqm: analysis.subjectProperty.valuePerSqm || 0,
                    isSubject: true
                  },
                  ...comparisonChartData
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      formatCurrency(value),
                      name === "valuePerSqm" ? "Price per m²" : name
                    ]}
                    labelFormatter={(label) => `Property: ${label}`}
                  />
                  <Bar 
                    dataKey="valuePerSqm" 
                    fill={(entry: any) => entry.isSubject ? "#3b82f6" : "#10b981"}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Comparable Properties Table */}
          <Card>
            <CardHeader>
              <CardTitle>Comparable Properties Details</CardTitle>
              <CardDescription>
                Detailed comparison with similar properties in the market
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {analysis.comparableProperties.map((property, index) => (
                  <div key={property.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{property.address}</h4>
                        <p className="text-sm text-muted-foreground">
                          {property.district}, {property.city}
                        </p>
                      </div>
                      <Badge variant="outline">{property.assetType.replace(/_/g, ' ')}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Land Size:</span>
                        <div className="font-medium">{formatNumber(property.landSize)} m²</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Building Size:</span>
                        <div className="font-medium">
                          {property.buildingSize ? formatNumber(property.buildingSize) + ' m²' : 'N/A'}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Value:</span>
                        <div className="font-medium">
                          {property.estimatedValue ? formatCurrency(property.estimatedValue) : 'N/A'}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Price/m²:</span>
                        <div className="font-medium">
                          {property.valuePerSqm ? formatCurrency(property.valuePerSqm) : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competitive" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Competitive Position Radar */}
            <Card>
              <CardHeader>
                <CardTitle>Competitive Position Analysis</CardTitle>
                <CardDescription>
                  How your property compares across key competitive factors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarChartData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar 
                      name="Your Property" 
                      dataKey="A" 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.3} 
                    />
                    <Radar 
                      name="Market Average" 
                      dataKey="B" 
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.3} 
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Competitive Scores */}
            <Card>
              <CardHeader>
                <CardTitle>Competitive Scores Breakdown</CardTitle>
                <CardDescription>
                  Detailed scoring across competitive dimensions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Location Score</span>
                    <div className="flex items-center gap-2">
                      <Progress value={analysis.competitivePosition.locationScore * 100} className="w-20" />
                      <span className="text-sm font-medium">
                        {Math.round(analysis.competitivePosition.locationScore * 100)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Condition Score</span>
                    <div className="flex items-center gap-2">
                      <Progress value={analysis.competitivePosition.conditionScore * 100} className="w-20" />
                      <span className="text-sm font-medium">
                        {Math.round(analysis.competitivePosition.conditionScore * 100)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Potential Score</span>
                    <div className="flex items-center gap-2">
                      <Progress value={analysis.competitivePosition.potentialScore * 100} className="w-20" />
                      <span className="text-sm font-medium">
                        {Math.round(analysis.competitivePosition.potentialScore * 100)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Overall Score</span>
                      <div className="flex items-center gap-2">
                        <Progress value={analysis.competitivePosition.overallScore * 100} className="w-20" />
                        <span className="text-sm font-bold">
                          {Math.round(analysis.competitivePosition.overallScore * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4" />
                    <span className="font-medium text-sm">Competitive Position</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your property is positioned as {analysis.competitivePosition.valuePosition.toLowerCase().replace(/_/g, ' ')} 
                    in the current market, with a competitive score of {Math.round(analysis.competitivePosition.overallScore * 100)}%.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Investment Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Investment Performance Metrics</CardTitle>
              <CardDescription>
                Key investment indicators and performance benchmarks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(analysis.investmentMetrics.estimatedRoi * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Estimated ROI</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {analysis.investmentMetrics.estimatedRoi > 0.1 ? 'Excellent' : 
                     analysis.investmentMetrics.estimatedRoi > 0.06 ? 'Good' : 'Average'}
                  </div>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(analysis.investmentMetrics.cashFlow)}
                  </div>
                  <div className="text-sm text-muted-foreground">Annual Cash Flow</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {analysis.investmentMetrics.cashFlow > 0 ? 'Positive' : 'Negative'}
                  </div>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(analysis.investmentMetrics.appreciation * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Annual Appreciation</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Projected growth rate
                  </div>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className={`text-2xl font-bold ${
                    analysis.investmentMetrics.riskLevel === "LOW" ? "text-green-600" :
                    analysis.investmentMetrics.riskLevel === "MEDIUM" ? "text-yellow-600" : "text-red-600"
                  }`}>
                    {analysis.investmentMetrics.riskLevel}
                  </div>
                  <div className="text-sm text-muted-foreground">Risk Level</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Investment risk assessment
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Strategic Recommendations
              </CardTitle>
              <CardDescription>
                AI-powered strategic recommendations to maximize property value and returns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {recommendations.map((recommendation, index) => {
                  const Icon = getCategoryIcon(recommendation.category)
                  return (
                    <div key={recommendation.id} className="border rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-primary" />
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">{recommendation.title}</h3>
                              <Badge className={getPriorityColor(recommendation.priority)}>
                                {recommendation.priority} PRIORITY
                              </Badge>
                            </div>
                            <Badge variant="outline" className="mt-1">
                              {recommendation.category.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Timeline</div>
                          <div className="font-medium">{recommendation.timeline}</div>
                        </div>
                      </div>

                      <p className="text-muted-foreground mb-4">{recommendation.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-green-600 mb-2">Expected Impact</h4>
                          <p className="text-sm">{recommendation.expectedImpact}</p>
                          {recommendation.estimatedCost && (
                            <div className="mt-2">
                              <span className="text-sm text-muted-foreground">Estimated Cost:</span>
                              <div className="font-medium">{formatCurrency(recommendation.estimatedCost)}</div>
                            </div>
                          )}
                        </div>

                        <div>
                          <h4 className="font-medium text-red-600 mb-2">Risk Factors</h4>
                          <ul className="text-sm space-y-1">
                            {recommendation.riskFactors.map((risk, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <AlertTriangle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                                <span>{risk}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-medium text-blue-600 mb-2">Success Factors</h4>
                        <div className="flex flex-wrap gap-2">
                          {recommendation.successFactors.map((factor, idx) => (
                            <div key={idx} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm">
                              <CheckCircle className="h-3 w-3" />
                              <span>{factor}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end mt-4">
                        <Button 
                          onClick={() => onRecommendationSelect?.(recommendation)}
                          variant="outline"
                        >
                          <Star className="h-4 w-4 mr-2" />
                          Learn More
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Market Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Key Market Insights</CardTitle>
                <CardDescription>
                  Important insights derived from comparative analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <TrendingUp className="h-4 w-4" />
                  <AlertTitle>Strong Market Position</AlertTitle>
                  <AlertDescription>
                    Your property shows competitive advantages in location and potential, 
                    positioning it well for long-term appreciation.
                  </AlertDescription>
                </Alert>

                <Alert>
                  <MapPin className="h-4 w-4" />
                  <AlertTitle>Location Premium</AlertTitle>
                  <AlertDescription>
                    The property's location in {analysis.subjectProperty.district} commands a 
                    premium compared to the broader market average.
                  </AlertDescription>
                </Alert>

                <Alert>
                  <Building2 className="h-4 w-4" />
                  <AlertTitle>Development Potential</AlertTitle>
                  <AlertDescription>
                    Current zoning and market conditions suggest significant development 
                    potential, particularly for mixed-use projects.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Competitive Advantages */}
            <Card>
              <CardHeader>
                <CardTitle>Competitive Advantages</CardTitle>
                <CardDescription>
                  Key strengths and competitive advantages of your property
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Award className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Prime Location</h4>
                      <p className="text-sm text-muted-foreground">
                        Situated in a high-demand area with excellent accessibility and amenities
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Award className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Market Timing</h4>
                      <p className="text-sm text-muted-foreground">
                        Current market conditions favor long-term holding and appreciation
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Award className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Flexibility</h4>
                      <p className="text-sm text-muted-foreground">
                        Zoning allows for multiple use cases and development scenarios
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Award className="h-5 w-5 text-purple-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Growth Corridor</h4>
                      <p className="text-sm text-muted-foreground">
                        Located in an area with planned infrastructure improvements and growth
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Strategic Outlook</CardTitle>
              <CardDescription>
                Summary of strategic recommendations and outlook
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p>
                  Based on the comprehensive comparative analysis, your property demonstrates 
                  strong competitive positioning with significant upside potential. The combination 
                  of prime location, favorable zoning, and market conditions creates multiple 
                  strategic pathways for value maximization.
                </p>
                <p>
                  The analysis suggests a {analysis.investmentMetrics.riskLevel.toLowerCase()} risk profile 
                  with attractive return potential. Key focus areas should include maintaining 
                  property condition, exploring development opportunities, and optimizing operational 
                  efficiency.
                </p>
                <p>
                  Market indicators suggest continued stability with moderate growth potential, 
                  supporting a strategic hold position with selective improvements to enhance 
                  value and returns over the medium to long term.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}