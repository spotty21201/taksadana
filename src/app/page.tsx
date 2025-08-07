"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Building2, TrendingUp, Shield, FileText, Calculator } from "lucide-react"
import { PropertyForm } from "@/components/property-form"
import { PropertyMap } from "@/components/property-map"
import { ValuationResults } from "@/components/valuation-results"

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [selectedProperty, setSelectedProperty] = useState<any>(null)
  const [valuationResults, setValuationResults] = useState<any>(null)
  const [isValuationLoading, setIsValuationLoading] = useState(false)

  // Mock properties data for demonstration
  const mockProperties = [
    {
      id: "1",
      address: "Jl. Sudirman No. 123",
      district: "Kelapa Gading",
      city: "Jakarta",
      coordinates: "-6.1588, 106.9192",
      landSize: 5000,
      assetType: "COMMERCIAL",
      estimatedValue: 15200000000,
      confidenceScore: 0.92
    },
    {
      id: "2", 
      address: "Jl. Thamrin No. 456",
      district: "Menteng",
      city: "Jakarta",
      coordinates: "-6.1934, 106.8229",
      landSize: 3200,
      assetType: "RESIDENTIAL",
      estimatedValue: 28500000000,
      confidenceScore: 0.87
    },
    {
      id: "3",
      address: "Jl. Gatot Subroto No. 789", 
      district: "Kuningan",
      city: "Jakarta",
      coordinates: "-6.2297, 106.8295",
      landSize: 4200,
      assetType: "MIXED_USE",
      estimatedValue: 12800000000,
      confidenceScore: 0.95
    }
  ]

  const recentValuations = [
    { id: 1, address: "Jl. Sudirman No. 123", district: "Kelapa Gading", value: "Rp 15.2B", confidence: 0.92, status: "Completed" },
    { id: 2, address: "Jl. Thamrin No. 456", district: "Menteng", value: "Rp 28.5B", confidence: 0.87, status: "In Progress" },
    { id: 3, address: "Jl. Gatot Subroto No. 789", district: "Kuningan", value: "Rp 12.8B", confidence: 0.95, status: "Completed" }
  ]

  const quickStats = [
    { title: "Total Properties Valued", value: "247", change: "+12%", icon: Building2 },
    { title: "Average Confidence Score", value: "89%", change: "+3%", icon: TrendingUp },
    { title: "Legal Checks Completed", value: "198", change: "+8%", icon: Shield },
    { title: "Reports Generated", value: "156", change: "+15%", icon: FileText }
  ]

  const handlePropertySubmit = async (data: any) => {
    setIsValuationLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock valuation result
      const mockValuation = {
        id: "val_" + Date.now(),
        estimatedValue: data.landSize * 15000000, // 15 juta/m² base price
        valuePerSqm: 15000000,
        confidenceScore: 0.85,
        valuationMethod: "AI_ENHANCED",
        valuationDate: new Date().toISOString(),
        marketTrends: {
          trend: "UP",
          description: "Property market in this area shows positive growth trends",
          factors: ["Infrastructure development", "High demand", "Limited supply"]
        },
        comparableAnalysis: [
          {
            address: "Nearby similar property",
            district: data.district,
            city: data.city,
            landSize: data.landSize * 0.95,
            assetType: data.assetType,
            transactionPrice: data.landSize * 15000000 * 0.95,
            pricePerSqm: 15000000 * 0.95,
            distance: 500,
            similarityScore: 0.88,
            dataSource: "Market_Data"
          }
        ],
        riskFactors: {
          overallRisk: "MEDIUM",
          factors: ["Market volatility", "Regulatory changes"],
          mitigation: ["Regular monitoring", "Diversification"]
        },
        strategicValue: {
          highestBestUse: "Current use optimization",
          upsidePotential: "High potential for appreciation",
          recommendations: ["Monitor market trends", "Consider improvements"]
        },
        notes: "AI-generated valuation with market analysis"
      }

      setValuationResults(mockValuation)
      setActiveTab("results")
    } catch (error) {
      console.error("Valuation failed:", error)
    } finally {
      setIsValuationLoading(false)
    }
  }

  const handleSaveDraft = (data: any) => {
    console.log("Draft saved:", data)
    // TODO: Save draft to localStorage or API
  }

  const handlePropertySelect = (property: any) => {
    setSelectedProperty(property)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative w-10 h-10">
                <img src="/logo.svg" alt="Taksa Dana" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Taksa Dana</h1>
                <p className="text-sm text-muted-foreground">AI-Powered Property Valuation & Strategic Asset Intelligence</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">Beta</Badge>
              <Button variant="outline" size="sm">Settings</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="valuation">New Valuation</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickStats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <p className="text-xs text-muted-foreground">{stat.change} from last month</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Recent Valuations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Valuations</CardTitle>
                  <CardDescription>Latest property valuation requests and results</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentValuations.map((valuation) => (
                      <div key={valuation.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{valuation.address}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">{valuation.district}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{valuation.value}</div>
                          <div className="text-xs text-muted-foreground">
                            Confidence: {Math.round(valuation.confidence * 100)}%
                          </div>
                        </div>
                        <Badge variant={valuation.status === "Completed" ? "default" : "secondary"}>
                          {valuation.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks and shortcuts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start" onClick={() => setActiveTab("valuation")}>
                    <Calculator className="mr-2 h-4 w-4" />
                    Start New Valuation
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    View Market Trends
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="mr-2 h-4 w-4" />
                    Legal Verification
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* New Valuation Tab */}
          <TabsContent value="valuation" className="space-y-6">
            <PropertyForm
              onSubmit={handlePropertySubmit}
              onSaveDraft={handleSaveDraft}
            />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <PropertyMap
              properties={mockProperties}
              onPropertySelect={handlePropertySelect}
              selectedProperty={selectedProperty}
            />
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-6">
            {isValuationLoading ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Calculator className="mx-auto h-12 w-12 text-muted-foreground animate-pulse" />
                    <h3 className="mt-4 text-lg font-semibold">Processing Valuation</h3>
                    <p className="text-muted-foreground">Our AI is analyzing your property data...</p>
                  </div>
                </CardContent>
              </Card>
            ) : valuationResults ? (
              <ValuationResults
                valuation={valuationResults}
                propertyAddress="Submitted Property"
              />
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No Valuation Results</h3>
                    <p className="text-muted-foreground">Submit a property for valuation to see results here</p>
                    <Button className="mt-4" onClick={() => setActiveTab("valuation")}>
                      Start New Valuation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Generated Reports</CardTitle>
                <CardDescription>View and download valuation reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">Reports Center</h3>
                  <p className="text-muted-foreground">Report generation and management features coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}