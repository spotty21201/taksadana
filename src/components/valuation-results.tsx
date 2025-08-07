"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Target } from "lucide-react"

interface ValuationResult {
  id: string
  estimatedValue: number
  valuePerSqm: number
  confidenceScore: number
  valuationMethod: string
  valuationDate: string
  marketTrends: {
    trend: "UP" | "DOWN" | "STABLE"
    description: string
    factors: string[]
  }
  comparableAnalysis: Array<{
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
  }>
  riskFactors: {
    overallRisk: "LOW" | "MEDIUM" | "HIGH"
    factors: string[]
    mitigation: string[]
  }
  strategicValue: {
    highestBestUse: string
    upsidePotential: string
    recommendations: string[]
  }
  notes?: string
}

interface ValuationResultsProps {
  valuation: ValuationResult
  propertyAddress: string
}

export function ValuationResults({ valuation, propertyAddress }: ValuationResultsProps) {
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

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return "text-green-600"
    if (score >= 0.6) return "text-yellow-600"
    return "text-red-600"
  }

  const getConfidenceLabel = (score: number) => {
    if (score >= 0.8) return "High"
    if (score >= 0.6) return "Medium"
    return "Low"
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "LOW": return "bg-green-100 text-green-800"
      case "MEDIUM": return "bg-yellow-100 text-yellow-800"
      case "HIGH": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "UP": return <TrendingUp className="h-4 w-4 text-green-600" />
      case "DOWN": return <TrendingDown className="h-4 w-4 text-red-600" />
      case "STABLE": return <Minus className="h-4 w-4 text-blue-600" />
      default: return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "UP": return "text-green-600"
      case "DOWN": return "text-red-600"
      case "STABLE": return "text-blue-600"
      default: return "text-gray-600"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Valuation Results
          </CardTitle>
          <CardDescription>
            AI-powered property valuation for {propertyAddress}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(valuation.estimatedValue)}
              </div>
              <div className="text-sm text-muted-foreground">Estimated Market Value</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(valuation.valuePerSqm)}
              </div>
              <div className="text-sm text-muted-foreground">Value per m²</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getConfidenceColor(valuation.confidenceScore)}`}>
                {Math.round(valuation.confidenceScore * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">
                Confidence ({getConfidenceLabel(valuation.confidenceScore)})
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      <Tabs defaultValue="market" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="market">Market Analysis</TabsTrigger>
          <TabsTrigger value="comparables">Comparables</TabsTrigger>
          <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
          <TabsTrigger value="strategic">Strategic Value</TabsTrigger>
        </TabsList>

        <TabsContent value="market" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Market Trends</CardTitle>
              <CardDescription>
                Current market conditions and trends affecting property value
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                {getTrendIcon(valuation.marketTrends.trend)}
                <div>
                  <span className={`font-semibold ${getTrendColor(valuation.marketTrends.trend)}`}>
                    {valuation.marketTrends.trend}
                  </span>
                  <span className="text-muted-foreground ml-2">
                    Market Trend
                  </span>
                </div>
              </div>
              
              <p className="text-sm">{valuation.marketTrends.description}</p>
              
              <div>
                <h4 className="font-medium mb-2">Key Factors:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {valuation.marketTrends.factors.map((factor, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span>{factor}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Valuation Methodology</CardTitle>
              <CardDescription>
                Approach and method used for this valuation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Primary Method</span>
                  <Badge variant="outline">{valuation.valuationMethod.replace('_', ' ')}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Valuation Date</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(valuation.valuationDate).toLocaleDateString('id-ID')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Confidence Level</span>
                  <div className="flex items-center gap-2">
                    <Progress value={valuation.confidenceScore * 100} className="w-20" />
                    <span className={`text-sm font-medium ${getConfidenceColor(valuation.confidenceScore)}`}>
                      {getConfidenceLabel(valuation.confidenceScore)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Comparable Properties</CardTitle>
              <CardDescription>
                Similar properties used for comparison analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {valuation.comparableAnalysis.map((comp, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{comp.address}</h4>
                        <p className="text-sm text-muted-foreground">
                          {comp.district}, {comp.city}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{comp.assetType.replace('_', ' ')}</Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {Math.round(comp.similarityScore * 100)}% similar
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Land Size:</span>
                        <div className="font-medium">{formatNumber(comp.landSize)} m²</div>
                      </div>
                      {comp.buildingSize && (
                        <div>
                          <span className="text-muted-foreground">Building Size:</span>
                          <div className="font-medium">{formatNumber(comp.buildingSize)} m²</div>
                        </div>
                      )}
                      {comp.transactionPrice && (
                        <div>
                          <span className="text-muted-foreground">Price:</span>
                          <div className="font-medium">{formatCurrency(comp.transactionPrice)}</div>
                        </div>
                      )}
                      {comp.pricePerSqm && (
                        <div>
                          <span className="text-muted-foreground">Price/m²:</span>
                          <div className="font-medium">{formatCurrency(comp.pricePerSqm)}</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                      <span className="text-xs text-muted-foreground">
                        Source: {comp.dataSource}
                      </span>
                      {comp.distance && (
                        <span className="text-xs text-muted-foreground">
                          Distance: {formatNumber(comp.distance)}m
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Risk Assessment
              </CardTitle>
              <CardDescription>
                Risk factors and mitigation strategies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className={getRiskColor(valuation.riskFactors.overallRisk)}>
                  {valuation.riskFactors.overallRisk} RISK
                </Badge>
                <span className="text-sm text-muted-foreground">Overall Risk Level</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3 text-red-600">Risk Factors</h4>
                  <div className="space-y-2">
                    {valuation.riskFactors.factors.map((factor, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span>{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3 text-green-600">Mitigation Strategies</h4>
                  <div className="space-y-2">
                    {valuation.riskFactors.mitigation.map((strategy, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{strategy}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strategic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Strategic Value Analysis</CardTitle>
              <CardDescription>
                Highest and best use recommendations and strategic insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Highest & Best Use</h4>
                <p className="text-sm text-muted-foreground">
                  {valuation.strategicValue.highestBestUse}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Upside Potential</h4>
                <p className="text-sm text-muted-foreground">
                  {valuation.strategicValue.upsidePotential}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Strategic Recommendations</h4>
                <div className="space-y-2">
                  {valuation.strategicValue.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <Target className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>{recommendation}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Notes */}
      {valuation.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Valuation Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{valuation.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}