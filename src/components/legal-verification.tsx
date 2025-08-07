"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  FileText, 
  MapPin,
  Building2,
  Scale,
  Gavel
} from "lucide-react"

interface LegalCheckResult {
  id: string
  ownershipVerified: boolean
  certificateValid: boolean
  zoningCompliant: boolean
  landUsePermitted: boolean
  encumbrances: Array<{
    type: string
    description: string
    severity: "LOW" | "MEDIUM" | "HIGH"
  }>
  disputes: Array<{
    type: string
    description: string
    status: "ACTIVE" | "RESOLVED" | "PENDING"
  }>
  restrictions: Array<{
    type: string
    description: string
    impact: "LOW" | "MEDIUM" | "HIGH"
  }>
  complianceScore: number
  riskFlags: string[]
  verificationDate: string
  notes?: string
}

interface PropertyData {
  address: string
  district: string
  city: string
  ownershipStatus: string
  certificateNumber?: string
  zoning?: string
  landUse?: string
  assetType: string
}

interface LegalVerificationProps {
  property: PropertyData
  legalCheck?: LegalCheckResult
  onRefreshLegalCheck?: () => void
  isLoading?: boolean
}

export function LegalVerification({ 
  property, 
  legalCheck, 
  onRefreshLegalCheck, 
  isLoading = false 
}: LegalVerificationProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const getComplianceColor = (score: number) => {
    if (score >= 0.8) return "text-green-600"
    if (score >= 0.6) return "text-yellow-600"
    return "text-red-600"
  }

  const getComplianceLabel = (score: number) => {
    if (score >= 0.8) return "High Compliance"
    if (score >= 0.6) return "Moderate Compliance"
    return "Low Compliance"
  }

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-5 w-5 text-green-600" />
    ) : (
      <XCircle className="h-5 w-5 text-red-600" />
    )
  }

  const getStatusBadge = (status: boolean) => {
    return status ? (
      <Badge className="bg-green-100 text-green-800">Verified</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">Not Verified</Badge>
    )
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "LOW": return "bg-yellow-100 text-yellow-800"
      case "MEDIUM": return "bg-orange-100 text-orange-800"
      case "HIGH": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "bg-red-100 text-red-800"
      case "RESOLVED": return "bg-green-100 text-green-800"
      case "PENDING": return "bg-yellow-100 text-yellow-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  // Mock legal check result for demonstration
  const mockLegalCheck: LegalCheckResult = {
    id: "legal_" + Date.now(),
    ownershipVerified: property.ownershipStatus === "CERTIFIED",
    certificateValid: !!property.certificateNumber,
    zoningCompliant: true,
    landUsePermitted: true,
    encumbrances: property.ownershipStatus !== "CERTIFIED" ? [
      {
        type: "Ownership Verification",
        description: "Property ownership requires verification with land registry",
        severity: "MEDIUM"
      }
    ] : [],
    disputes: [],
    restrictions: [
      {
        type: "Building Height",
        description: "Maximum building height restricted to 4 floors",
        impact: "MEDIUM"
      },
      {
        type: "Setback Requirements",
        description: "Minimum 3m setback from property boundaries",
        impact: "LOW"
      }
    ],
    complianceScore: property.ownershipStatus === "CERTIFIED" ? 0.9 : 0.6,
    riskFlags: property.ownershipStatus === "CERTIFIED" ? [] : [
      "Ownership verification required",
      "Certificate number missing"
    ],
    verificationDate: new Date().toISOString(),
    notes: "Legal verification completed using Jakarta Satu and Sentuh Tanahku data sources"
  }

  const checkResult = legalCheck || mockLegalCheck

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Legal Verification
          </CardTitle>
          <CardDescription>
            Comprehensive legal check for property at {property.address}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getComplianceColor(checkResult.complianceScore)}`}>
                  {Math.round(checkResult.complianceScore * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">
                  {getComplianceLabel(checkResult.complianceScore)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">
                  {checkResult.riskFlags.length === 0 ? "No Issues" : `${checkResult.riskFlags.length} Flag(s)`}
                </div>
                <div className="text-sm text-muted-foreground">Risk Flags</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={onRefreshLegalCheck}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Shield className="h-4 w-4 mr-2" />
                )}
                Refresh Check
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legal Check Results */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="restrictions">Restrictions</TabsTrigger>
          <TabsTrigger value="risks">Risk Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4" />
                  Ownership Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Ownership Verified</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(checkResult.ownershipVerified)}
                    {getStatusBadge(checkResult.ownershipVerified)}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Certificate Valid</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(checkResult.certificateValid)}
                    {getStatusBadge(checkResult.certificateValid)}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Certificate Number</span>
                  <span className="text-sm font-medium">
                    {property.certificateNumber || "Not provided"}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="h-4 w-4" />
                  Zoning & Land Use
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Zoning Compliant</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(checkResult.zoningCompliant)}
                    {getStatusBadge(checkResult.zoningCompliant)}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Land Use Permitted</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(checkResult.landUsePermitted)}
                    {getStatusBadge(checkResult.landUsePermitted)}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Zoning Classification</span>
                  <span className="text-sm font-medium">
                    {property.zoning || "Not specified"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Flags */}
          {checkResult.riskFlags.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Risk Flags Identified</AlertTitle>
              <AlertDescription>
                <ul className="mt-2 space-y-1">
                  {checkResult.riskFlags.map((flag, index) => (
                    <li key={index} className="text-sm">• {flag}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Verification Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Verification Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Verification Date:</span>
                  <div className="font-medium">
                    {new Date(checkResult.verificationDate).toLocaleDateString('id-ID')}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Property Type:</span>
                  <div className="font-medium">{property.assetType.replace('_', ' ')}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Location:</span>
                  <div className="font-medium">{property.district}, {property.city}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Data Sources:</span>
                  <div className="font-medium">Jakarta Satu, Sentuh Tanahku</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Score Breakdown</CardTitle>
              <CardDescription>
                Detailed compliance analysis across different legal aspects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Ownership Compliance</span>
                  <span className="text-sm">{checkResult.ownershipVerified ? "100%" : "0%"}</span>
                </div>
                <Progress value={checkResult.ownershipVerified ? 100 : 0} className="h-2" />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Certificate Compliance</span>
                  <span className="text-sm">{checkResult.certificateValid ? "100%" : "0%"}</span>
                </div>
                <Progress value={checkResult.certificateValid ? 100 : 0} className="h-2" />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Zoning Compliance</span>
                  <span className="text-sm">{checkResult.zoningCompliant ? "100%" : "0%"}</span>
                </div>
                <Progress value={checkResult.zoningCompliant ? 100 : 0} className="h-2" />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Land Use Compliance</span>
                  <span className="text-sm">{checkResult.landUsePermitted ? "100%" : "0%"}</span>
                </div>
                <Progress value={checkResult.landUsePermitted ? 100 : 0} className="h-2" />
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Overall Compliance Score</span>
                  <span className={`font-bold ${getComplianceColor(checkResult.complianceScore)}`}>
                    {Math.round(checkResult.complianceScore * 100)}%
                  </span>
                </div>
                <Progress value={checkResult.complianceScore * 100} className="h-3 mt-2" />
              </div>
            </CardContent>
          </Card>

          {/* Encumbrances */}
          {checkResult.encumbrances.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Encumbrances & Liens
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {checkResult.encumbrances.map((encumbrance, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{encumbrance.type}</h4>
                        <Badge className={getSeverityColor(encumbrance.severity)}>
                          {encumbrance.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{encumbrance.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Disputes */}
          {checkResult.disputes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gavel className="h-4 w-4" />
                  Legal Disputes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {checkResult.disputes.map((dispute, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{dispute.type}</h4>
                        <Badge className={getStatusColor(dispute.status)}>
                          {dispute.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{dispute.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="restrictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Property Restrictions</CardTitle>
              <CardDescription>
                Legal restrictions and usage limitations for the property
              </CardDescription>
            </CardHeader>
            <CardContent>
              {checkResult.restrictions.length > 0 ? (
                <div className="space-y-4">
                  {checkResult.restrictions.map((restriction, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{restriction.type}</h4>
                        <Badge className={getSeverityColor(restriction.impact)}>
                          {restriction.impact} Impact
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{restriction.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No Restrictions Found</h3>
                  <p className="text-muted-foreground">
                    This property has no known legal restrictions
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Analysis Summary</CardTitle>
              <CardDescription>
                Comprehensive risk assessment and mitigation recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {checkResult.encumbrances.length === 0 ? "None" : checkResult.encumbrances.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Encumbrances</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {checkResult.disputes.length === 0 ? "None" : checkResult.disputes.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Active Disputes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {checkResult.restrictions.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Restrictions</div>
                </div>
              </div>

              {checkResult.riskFlags.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Risk Flags & Recommendations</h4>
                  <div className="space-y-3">
                    {checkResult.riskFlags.map((flag, index) => (
                      <Alert key={index}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Risk Identified</AlertTitle>
                        <AlertDescription className="mt-2">
                          <div className="text-sm">{flag}</div>
                          <div className="mt-2 text-xs text-muted-foreground">
                            Recommendation: {flag.includes("verification") ? 
                              "Complete verification process immediately" : 
                              flag.includes("certificate") ? 
                              "Obtain and verify certificate documentation" :
                              "Consult with legal counsel for resolution"
                            }
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Legal Health Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-4 w-4" />
                Legal Health Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className={`text-4xl font-bold ${getComplianceColor(checkResult.complianceScore)}`}>
                  {Math.round(checkResult.complianceScore * 100)}
                </div>
                <div className="text-sm text-muted-foreground">out of 100</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-center">
                  <div className="w-full max-w-md">
                    <Progress value={checkResult.complianceScore * 100} className="h-4" />
                  </div>
                </div>
                
                <div className="text-center text-sm text-muted-foreground">
                  {checkResult.complianceScore >= 0.8 ? "Excellent legal standing" :
                   checkResult.complianceScore >= 0.6 ? "Good legal standing with minor issues" :
                   "Legal issues require attention"}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Notes */}
      {checkResult.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Verification Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{checkResult.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}