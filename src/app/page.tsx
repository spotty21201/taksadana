"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  MapPin, 
  Building, 
  Calculator, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  FileText,
  Download,
  Search,
  Landmark,
  Scale,
  BarChart3
} from "lucide-react";

interface PropertyData {
  location: string;
  landSize: string;
  assetType: string;
  description: string;
}

interface ValuationResult {
  estimatedMarketValue: number;
  zoningImpact: string;
  highestBestUse: string;
  liquidityRisk: number;
  transactionConfidence: number;
  comparablePricing: Array<{
    location: string;
    pricePerSqm: number;
    distance: number;
  }>;
  legalRiskFlags: string[];
  growthPotential: number;
}

interface LegalVerificationResult {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  flags: string[];
  recommendations: string[];
  complianceScore: number;
  titleStatus: 'clean' | 'disputed' | 'pending' | 'unknown';
  zoningCompliance: 'compliant' | 'non-compliant' | 'partial' | 'unknown';
  encumbrances: string[];
  sentuhTanahkuStatus: {
    integrated: boolean;
    lastUpdated: string;
    databaseStatus: string;
    coverage: string;
  };
  assessmentDate: string;
  nextReviewDate: string;
}

export default function TaksaDanaDashboard() {
  const [propertyData, setPropertyData] = useState<PropertyData>({
    location: "",
    landSize: "",
    assetType: "",
    description: ""
  });
  
  const [valuationResult, setValuationResult] = useState<ValuationResult | null>(null);
  const [legalVerificationResult, setLegalVerificationResult] = useState<LegalVerificationResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isVerifyingLegal, setIsVerifyingLegal] = useState(false);

  const handleInputChange = (field: keyof PropertyData, value: string) => {
    setPropertyData(prev => ({ ...prev, [field]: value }));
  };

  const analyzeProperty = async () => {
    if (!propertyData.location || !propertyData.landSize || !propertyData.assetType) {
      alert("Please fill in all required fields");
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const response = await fetch('/api/valuation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: propertyData.location,
          landSize: parseInt(propertyData.landSize),
          assetType: propertyData.assetType,
          description: propertyData.description
        })
      });

      if (!response.ok) {
        throw new Error('Valuation failed');
      }

      const result = await response.json();
      
      // Transform API response to match our interface
      const transformedResult: ValuationResult = {
        estimatedMarketValue: result.estimatedMarketValue,
        zoningImpact: result.zoningImpact,
        highestBestUse: result.highestBestUse,
        liquidityRisk: result.liquidityRisk,
        transactionConfidence: result.transactionConfidence,
        comparablePricing: result.comparablePricing.map((comp: any) => ({
          location: comp.location,
          pricePerSqm: comp.pricePerSqm,
          distance: comp.distance
        })),
        legalRiskFlags: result.legalRiskFlags,
        growthPotential: result.growthPotential
      };
      
      setValuationResult(transformedResult);
      
      // Automatically trigger legal verification after successful valuation
      await verifyLegalStatus();
    } catch (error) {
      console.error('Error analyzing property:', error);
      alert('Failed to analyze property. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const verifyLegalStatus = async () => {
    if (!propertyData.location || !propertyData.assetType) {
      return;
    }

    setIsVerifyingLegal(true);
    
    try {
      const response = await fetch('/api/legal-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: propertyData.location,
          assetType: propertyData.assetType,
          propertyId: '' // Could be added as a field in the form
        })
      });

      if (!response.ok) {
        throw new Error('Legal verification failed');
      }

      const result = await response.json();
      setLegalVerificationResult(result);
    } catch (error) {
      console.error('Error verifying legal status:', error);
      // Don't show alert for legal verification failure as it's not critical
    } finally {
      setIsVerifyingLegal(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 py-6">
          <h1 className="text-4xl font-bold text-primary">Taksa Dana</h1>
          <p className="text-xl text-muted-foreground">
            AI-Powered Property Valuation & Strategic Asset Intelligence
          </p>
          <Badge variant="secondary" className="text-sm">
            Jakarta Satu & Sentuh Tanahku Integrated
          </Badge>
        </div>

        <Tabs defaultValue="valuation" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="valuation" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Valuation
            </TabsTrigger>
            <TabsTrigger value="intelligence" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Intelligence
            </TabsTrigger>
            <TabsTrigger value="legal" className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Legal
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Financial
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="valuation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Property Input Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Property Details
                  </CardTitle>
                  <CardDescription>
                    Enter property information for AI-powered valuation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      placeholder="e.g., East Jakarta, Kelapa Gading"
                      value={propertyData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="landSize">Land Size (m²) *</Label>
                    <Input
                      id="landSize"
                      type="number"
                      placeholder="e.g., 5000"
                      value={propertyData.landSize}
                      onChange={(e) => handleInputChange("landSize", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="assetType">Asset Type *</Label>
                    <Select onValueChange={(value) => handleInputChange("assetType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select asset type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="residential">Residential</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="industrial">Industrial</SelectItem>
                        <SelectItem value="mixed-use">Mixed-Use</SelectItem>
                        <SelectItem value="agricultural">Agricultural</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Additional Details</Label>
                    <Textarea
                      id="description"
                      placeholder="Any additional information about the property..."
                      value={propertyData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                    />
                  </div>
                  
                  <Button 
                    onClick={analyzeProperty} 
                    disabled={isAnalyzing}
                    className="w-full"
                  >
                    {isAnalyzing ? (
                      <>
                        <Search className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing Property...
                      </>
                    ) : (
                      <>
                        <Calculator className="mr-2 h-4 w-4" />
                        Analyze Property Value
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Valuation Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Valuation Results
                  </CardTitle>
                  <CardDescription>
                    AI-powered property assessment and market analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isAnalyzing ? (
                    <div className="space-y-4">
                      <div className="text-center space-y-2">
                        <Search className="h-8 w-8 animate-spin mx-auto text-primary" />
                        <p className="text-sm text-muted-foreground">
                          Analyzing property data and market conditions...
                        </p>
                      </div>
                      <Progress value={75} className="w-full" />
                    </div>
                  ) : valuationResult ? (
                    <div className="space-y-4">
                      <div className="text-center space-y-2">
                        <div className="text-3xl font-bold text-primary">
                          {formatCurrency(valuationResult.estimatedMarketValue)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Estimated Market Value
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm">Liquidity Risk</Label>
                          <div className="flex items-center gap-2">
                            <Progress value={valuationResult.liquidityRisk} className="flex-1" />
                            <span className="text-sm">{valuationResult.liquidityRisk}%</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm">Transaction Confidence</Label>
                          <div className="flex items-center gap-2">
                            <Progress value={valuationResult.transactionConfidence} className="flex-1" />
                            <span className="text-sm">{valuationResult.transactionConfidence}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm">Zoning Impact</Label>
                        <p className="text-sm">{valuationResult.zoningImpact}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm">Highest & Best Use</Label>
                        <p className="text-sm">{valuationResult.highestBestUse}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm">Growth Potential</Label>
                        <div className="flex items-center gap-2">
                          <Progress value={valuationResult.growthPotential} className="flex-1" />
                          <span className="text-sm">{valuationResult.growthPotential}%</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-2 py-8">
                      <Building className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Enter property details and click "Analyze Property Value" to get started
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Comparable Properties */}
            {valuationResult && (
              <Card>
                <CardHeader>
                  <CardTitle>Comparable Properties</CardTitle>
                  <CardDescription>
                    Recent transactions and market comparables in the area
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {valuationResult.comparablePricing.map((comp, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{comp.location}</p>
                          <p className="text-sm text-muted-foreground">{comp.distance} km away</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(comp.pricePerSqm)}/m²</p>
                          <p className="text-sm text-muted-foreground">per sqm</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="intelligence" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Strategic Asset Intelligence
                </CardTitle>
                <CardDescription>
                  Market analysis, growth potential, and strategic insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                {valuationResult ? (
                  <div className="space-y-6">
                    {/* Market Analysis */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold">Market Analysis</h3>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm leading-relaxed">
                          The property shows strong potential given its location in {propertyData.location}. 
                          Current market trends indicate steady appreciation in this area, supported by 
                          infrastructure development and increasing commercial activity. The {propertyData.assetType} 
                          sector in this region has shown consistent growth over the past 24 months.
                        </p>
                      </div>
                    </div>

                    {/* Strategic Recommendations */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold">Strategic Recommendations</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3 border rounded-lg">
                          <h4 className="font-medium mb-2">Short-term Strategy</h4>
                          <p className="text-sm text-muted-foreground">
                            Hold asset and monitor market conditions. Current zoning supports optimal utilization.
                          </p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <h4 className="font-medium mb-2">Long-term Strategy</h4>
                          <p className="text-sm text-muted-foreground">
                            Consider redevelopment potential based on area growth trajectory and infrastructure plans.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Investment Metrics */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold">Investment Metrics</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{valuationResult.growthPotential}%</div>
                          <p className="text-sm text-muted-foreground">Growth Potential</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{100 - valuationResult.liquidityRisk}%</div>
                          <p className="text-sm text-muted-foreground">Market Liquidity</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">{valuationResult.transactionConfidence}%</div>
                          <p className="text-sm text-muted-foreground">Investment Confidence</p>
                        </div>
                      </div>
                    </div>

                    {/* Competitive Analysis */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold">Competitive Position</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                          <span className="text-sm">Location Advantage</span>
                          <Badge variant="secondary">High</Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                          <span className="text-sm">Development Potential</span>
                          <Badge variant="secondary">Medium</Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                          <span className="text-sm">Market Timing</span>
                          <Badge variant="secondary">Optimal</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-2 py-8">
                    <Landmark className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Strategic intelligence analysis will be available after property valuation
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="legal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  Legal & Compliance Risk Analysis
                </CardTitle>
                <CardDescription>
                  Sentuh Tanahku integration for legal verification
                </CardDescription>
              </CardHeader>
              <CardContent>
                {legalVerificationResult ? (
                  <div className="space-y-6">
                    {/* Overall Risk Assessment */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold">Overall Risk Assessment</h3>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <span className="text-sm text-muted-foreground">Risk Level</span>
                          <div className="text-2xl font-bold capitalize">{legalVerificationResult.riskLevel}</div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-muted-foreground">Compliance Score</span>
                          <div className="text-2xl font-bold">{legalVerificationResult.complianceScore}%</div>
                        </div>
                      </div>
                    </div>

                    {/* Sentuh Tanahku Status */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold">Sentuh Tanahku Integration</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-3 h-3 rounded-full ${legalVerificationResult.sentuhTanahkuStatus.integrated ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="font-medium">Database Status</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {legalVerificationResult.sentuhTanahkuStatus.databaseStatus}
                          </p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <span className="font-medium mb-2 block">Coverage Area</span>
                          <p className="text-sm text-muted-foreground">
                            {legalVerificationResult.sentuhTanahkuStatus.coverage}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Title Status */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold">Title Status</h3>
                      <div className="flex items-center gap-3 p-4 border rounded-lg">
                        <div className={`w-4 h-4 rounded-full ${
                          legalVerificationResult.titleStatus === 'clean' ? 'bg-green-500' :
                          legalVerificationResult.titleStatus === 'disputed' ? 'bg-red-500' :
                          legalVerificationResult.titleStatus === 'pending' ? 'bg-yellow-500' : 'bg-gray-500'
                        }`}></div>
                        <div>
                          <span className="font-medium capitalize">{legalVerificationResult.titleStatus}</span>
                          <p className="text-sm text-muted-foreground">
                            Last checked: {new Date(legalVerificationResult.assessmentDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Zoning Compliance */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold">Zoning Compliance</h3>
                      <div className="flex items-center gap-3 p-4 border rounded-lg">
                        <div className={`w-4 h-4 rounded-full ${
                          legalVerificationResult.zoningCompliance === 'compliant' ? 'bg-green-500' :
                          legalVerificationResult.zoningCompliance === 'non-compliant' ? 'bg-red-500' :
                          legalVerificationResult.zoningCompliance === 'partial' ? 'bg-yellow-500' : 'bg-gray-500'
                        }`}></div>
                        <span className="font-medium capitalize">{legalVerificationResult.zoningCompliance}</span>
                      </div>
                    </div>

                    {/* Legal Risk Flags */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold">Legal Risk Flags</h3>
                      <div className="space-y-2">
                        {legalVerificationResult.flags.map((flag, index) => (
                          <Alert key={index}>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>{flag}</AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </div>

                    {/* Encumbrances */}
                    {legalVerificationResult.encumbrances.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold">Potential Encumbrances</h3>
                        <div className="space-y-2">
                          {legalVerificationResult.encumbrances.map((encumbrance, index) => (
                            <Alert key={index}>
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>{encumbrance}</AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold">Legal Recommendations</h3>
                      <div className="space-y-2">
                        {legalVerificationResult.recommendations.map((recommendation, index) => (
                          <div key={index} className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                            <CheckCircle className="h-4 w-4 mt-0.5 text-green-500" />
                            <p className="text-sm">{recommendation}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Next Review Date */}
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Next Legal Review Recommended</p>
                      <p className="font-medium">
                        {new Date(legalVerificationResult.nextReviewDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-2 py-8">
                    <Scale className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {isVerifyingLegal ? "Verifying legal status..." : "Legal analysis will be available after property valuation"}
                    </p>
                    {isVerifyingLegal && (
                      <div className="flex justify-center">
                        <Search className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Financial Modeling & Scenario Analysis
                </CardTitle>
                <CardDescription>
                  Loan-to-Value, DSCR, and investment scenario projections
                </CardDescription>
              </CardHeader>
              <CardContent>
                {valuationResult ? (
                  <div className="space-y-6">
                    {/* Key Financial Metrics */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold">Key Financial Metrics</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-xl font-bold text-blue-600">65%</div>
                          <p className="text-sm text-muted-foreground">LTV Ratio</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-xl font-bold text-green-600">1.8x</div>
                          <p className="text-sm text-muted-foreground">DSCR</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-xl font-bold text-purple-600">7.2%</div>
                          <p className="text-sm text-muted-foreground">Cap Rate</p>
                        </div>
                      </div>
                    </div>

                    {/* Scenario Analysis */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold">Investment Scenarios</h3>
                      <div className="space-y-4">
                        <div className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-medium text-green-600">Conservative Scenario</h4>
                              <p className="text-sm text-muted-foreground">Low risk, steady returns</p>
                            </div>
                            <Badge variant="secondary">Low Risk</Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <span className="text-muted-foreground">ROI:</span>
                              <div className="font-medium">8%</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">5yr Value:</span>
                              <div className="font-medium">{formatCurrency(valuationResult.estimatedMarketValue * 1.15)}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Cash Flow:</span>
                              <div className="font-medium">{formatCurrency(valuationResult.estimatedMarketValue * 0.03)}/yr</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Break-even:</span>
                              <div className="font-medium">12 years</div>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-medium text-yellow-600">Moderate Scenario</h4>
                              <p className="text-sm text-muted-foreground">Balanced risk and return</p>
                            </div>
                            <Badge variant="secondary">Medium Risk</Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <span className="text-muted-foreground">ROI:</span>
                              <div className="font-medium">15%</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">5yr Value:</span>
                              <div className="font-medium">{formatCurrency(valuationResult.estimatedMarketValue * 1.35)}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Cash Flow:</span>
                              <div className="font-medium">{formatCurrency(valuationResult.estimatedMarketValue * 0.06)}/yr</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Break-even:</span>
                              <div className="font-medium">8 years</div>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-medium text-red-600">Aggressive Scenario</h4>
                              <p className="text-sm text-muted-foreground">High risk, high return</p>
                            </div>
                            <Badge variant="secondary">High Risk</Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <span className="text-muted-foreground">ROI:</span>
                              <div className="font-medium">25%</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">5yr Value:</span>
                              <div className="font-medium">{formatCurrency(valuationResult.estimatedMarketValue * 1.6)}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Cash Flow:</span>
                              <div className="font-medium">{formatCurrency(valuationResult.estimatedMarketValue * 0.1)}/yr</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Break-even:</span>
                              <div className="font-medium">5 years</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Loan Analysis */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold">Loan Analysis</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">Loan-to-Value Analysis</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Property Value:</span>
                              <span>{formatCurrency(valuationResult.estimatedMarketValue)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Recommended Loan (65% LTV):</span>
                              <span className="font-medium">{formatCurrency(valuationResult.estimatedMarketValue * 0.65)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Required Equity:</span>
                              <span className="font-medium">{formatCurrency(valuationResult.estimatedMarketValue * 0.35)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">Debt Service Coverage</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Annual NOI:</span>
                              <span>{formatCurrency(valuationResult.estimatedMarketValue * 0.06)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Annual Debt Service:</span>
                              <span>{formatCurrency(valuationResult.estimatedMarketValue * 0.033)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>DSCR Ratio:</span>
                              <span className="font-medium text-green-600">1.8x</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Investment Recommendation */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold">Investment Recommendation</h3>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm leading-relaxed">
                          Based on the financial analysis, this property shows strong investment potential 
                          with moderate risk profile. The moderate scenario offers the best balance of 
                          risk and return, with a 15% ROI and 8-year break-even period. 
                          Recommended for investors with medium-term investment horizon.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-2 py-8">
                    <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Financial modeling will be available after property valuation
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Reports & Exports
                </CardTitle>
                <CardDescription>
                  Generate professional reports and export data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-20 flex-col">
                    <Download className="h-6 w-6 mb-2" />
                    PDF Report
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Download className="h-6 w-6 mb-2" />
                    Google Sheets
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Download className="h-6 w-6 mb-2" />
                    Markdown Brief
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}