"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  FileText, 
  Download, 
  Share2, 
  Eye, 
  Calendar,
  MapPin,
  Building2,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  FileSpreadsheet,
  File
} from "lucide-react"

interface ReportData {
  property: {
    address: string
    district: string
    city: string
    landSize: number
    buildingSize?: number
    assetType: string
    ownershipStatus: string
    certificateNumber?: string
    zoning?: string
    landUse?: string
  }
  valuation: {
    estimatedValue: number
    valuePerSqm: number
    confidenceScore: number
    valuationMethod: string
    valuationDate: string
    marketTrends: {
      trend: string
      description: string
      factors: string[]
    }
    comparableAnalysis: Array<{
      address: string
      district: string
      city: string
      landSize: number
      assetType: string
      transactionPrice?: number
      pricePerSqm?: number
      similarityScore: number
    }>
    riskFactors: {
      overallRisk: string
      factors: string[]
      mitigation: string[]
    }
    strategicValue: {
      highestBestUse: string
      upsidePotential: string
      recommendations: string[]
    }
  }
  legalCheck?: {
    ownershipVerified: boolean
    certificateValid: boolean
    zoningCompliant: boolean
    landUsePermitted: boolean
    complianceScore: number
    riskFlags: string[]
    verificationDate: string
  }
  financialModel?: {
    loanToValue: number
    debtServiceCoverage: number
    estimatedRoi: number
    cashFlow: number
    capRate: number
    recommendedLoanAmount: number
    riskAssessment: {
      overallRisk: string
      factors: string[]
      mitigation: string[]
    }
  }
}

interface ReportGeneratorProps {
  data: ReportData
  onGenerateReport?: (reportConfig: ReportConfig) => void
}

interface ReportConfig {
  title: string
  type: "VALUATION_REPORT" | "LEGAL_COMPLIANCE" | "FINANCIAL_ANALYSIS" | "COMPREHENSIVE_ANALYSIS"
  format: "PDF" | "GOOGLE_SHEETS" | "MARKDOWN" | "JSON"
  includeSections: string[]
  customNotes?: string
  recipientEmail?: string
}

export function ReportGenerator({ data, onGenerateReport }: ReportGeneratorProps) {
  const [activeTab, setActiveTab] = useState("generator")
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    title: `Property Valuation Report - ${data.property.address}`,
    type: "VALUATION_REPORT",
    format: "PDF",
    includeSections: ["overview", "valuation", "legal", "financial", "recommendations"],
    customNotes: ""
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedReports, setGeneratedReports] = useState<any[]>([])

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleConfigChange = (field: keyof ReportConfig, value: any) => {
    setReportConfig(prev => ({ ...prev, [field]: value }))
  }

  const handleSectionToggle = (section: string) => {
    setReportConfig(prev => ({
      ...prev,
      includeSections: prev.includeSections.includes(section)
        ? prev.includeSections.filter(s => s !== section)
        : [...prev.includeSections, section]
    }))
  }

  const generateReport = async () => {
    setIsGenerating(true)
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newReport = {
        id: "report_" + Date.now(),
        title: reportConfig.title,
        type: reportConfig.type,
        format: reportConfig.format,
        generatedAt: new Date().toISOString(),
        downloadUrl: "#", // In real app, this would be a real URL
        size: "2.4 MB"
      }

      setGeneratedReports(prev => [newReport, ...prev])
      setActiveTab("history")
      
      if (onGenerateReport) {
        onGenerateReport(reportConfig)
      }
    } catch (error) {
      console.error("Report generation failed:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateMarkdownReport = () => {
    const { title, includeSections, customNotes } = reportConfig
    const { property, valuation, legalCheck, financialModel } = data

    let markdown = `# ${title}

**Generated on:** ${formatDate(new Date().toISOString())}  
**Report Type:** ${reportConfig.type.replace(/_/g, ' ')}  
**Property:** ${property.address}, ${property.district}, ${property.city}

---

`

    if (includeSections.includes("overview")) {
      markdown += `## Property Overview

### Property Details
- **Address:** ${property.address}
- **District:** ${property.district}
- **City:** ${property.city}
- **Land Size:** ${formatNumber(property.landSize)} m²
- **Building Size:** ${property.buildingSize ? formatNumber(property.buildingSize) + ' m²' : 'N/A'}
- **Asset Type:** ${property.assetType.replace(/_/g, ' ')}
- **Ownership Status:** ${property.ownershipStatus.replace(/_/g, ' ')}
- **Certificate Number:** ${property.certificateNumber || 'Not provided'}
- **Zoning:** ${property.zoning || 'Not specified'}
- **Land Use:** ${property.landUse || 'Not specified'}

`
    }

    if (includeSections.includes("valuation")) {
      markdown += `## Valuation Analysis

### Valuation Summary
- **Estimated Market Value:** ${formatCurrency(valuation.estimatedValue)}
- **Value per m²:** ${formatCurrency(valuation.valuePerSqm)}
- **Confidence Score:** ${Math.round(valuation.confidenceScore * 100)}%
- **Valuation Method:** ${valuation.valuationMethod.replace(/_/g, ' ')}
- **Valuation Date:** ${formatDate(valuation.valuationDate)}

### Market Trends
- **Trend:** ${valuation.marketTrends.trend}
- **Description:** ${valuation.marketTrends.description}
- **Key Factors:** ${valuation.marketTrends.factors.join(', ')}

### Comparable Properties
`
      valuation.comparableAnalysis.forEach((comp, index) => {
        markdown += `
${index + 1}. **${comp.address}**
   - District: ${comp.district}, ${comp.city}
   - Land Size: ${formatNumber(comp.landSize)} m²
   - Asset Type: ${comp.assetType.replace(/_/g, ' ')}
   - Similarity Score: ${Math.round(comp.similarityScore * 100)}%
   ${comp.transactionPrice ? `- Transaction Price: ${formatCurrency(comp.transactionPrice)}` : ''}
   ${comp.pricePerSqm ? `- Price per m²: ${formatCurrency(comp.pricePerSqm)}` : ''}
`
      })

      markdown += `

### Risk Assessment
- **Overall Risk:** ${valuation.riskFactors.overallRisk}
- **Risk Factors:** ${valuation.riskFactors.factors.join(', ')}
- **Mitigation Strategies:** ${valuation.riskFactors.mitigation.join(', ')}

### Strategic Value
- **Highest & Best Use:** ${valuation.strategicValue.highestBestUse}
- **Upside Potential:** ${valuation.strategicValue.upsidePotential}
- **Recommendations:** ${valuation.strategicValue.recommendations.join(', ')}

`
    }

    if (includeSections.includes("legal") && legalCheck) {
      markdown += `## Legal Compliance

### Verification Status
- **Ownership Verified:** ${legalCheck.ownershipVerified ? '✅ Yes' : '❌ No'}
- **Certificate Valid:** ${legalCheck.certificateValid ? '✅ Yes' : '❌ No'}
- **Zoning Compliant:** ${legalCheck.zoningCompliant ? '✅ Yes' : '❌ No'}
- **Land Use Permitted:** ${legalCheck.landUsePermitted ? '✅ Yes' : '❌ No'}
- **Compliance Score:** ${Math.round(legalCheck.complianceScore * 100)}%
- **Verification Date:** ${formatDate(legalCheck.verificationDate)}

### Risk Flags
`
      if (legalCheck.riskFlags.length > 0) {
        legalCheck.riskFlags.forEach((flag, index) => {
          markdown += `- ${flag}\n`
        })
      } else {
        markdown += "- No risk flags identified\n"
      }

      markdown += "\n"
    }

    if (includeSections.includes("financial") && financialModel) {
      markdown += `## Financial Analysis

### Key Metrics
- **Loan-to-Value (LTV):** ${Math.round(financialModel.loanToValue * 100)}%
- **Debt Service Coverage (DSCR):** ${financialModel.debtServiceCoverage.toFixed(2)}x
- **Estimated ROI:** ${Math.round(financialModel.estimatedRoi * 100)}%
- **Annual Cash Flow:** ${formatCurrency(financialModel.cashFlow)}
- **Capitalization Rate:** ${Math.round(financialModel.capRate * 100)}%
- **Recommended Loan Amount:** ${formatCurrency(financialModel.recommendedLoanAmount)}

### Risk Assessment
- **Overall Risk:** ${financialModel.riskAssessment.overallRisk}
- **Risk Factors:** ${financialModel.riskAssessment.factors.join(', ')}
- **Mitigation Strategies:** ${financialModel.riskAssessment.mitigation.join(', ')}

`
    }

    if (includeSections.includes("recommendations")) {
      markdown += `## Recommendations & Next Steps

### Key Recommendations
`
      if (valuation.strategicValue.recommendations.length > 0) {
        valuation.strategicValue.recommendations.forEach((rec, index) => {
          markdown += `${index + 1}. ${rec}\n`
        })
      }

      markdown += `
### Action Items
1. **Immediate Actions:**
   - Review and verify all documentation
   - Conduct physical property inspection
   - Validate market assumptions

2. **Due Diligence:**
   - Legal verification with relevant authorities
   - Environmental assessment if applicable
   - Title search and encumbrance check

3. **Strategic Planning:**
   - Develop timeline for acquisition or development
   - Secure financing arrangements
   - Engage legal and tax advisors

`
    }

    if (customNotes) {
      markdown += `## Additional Notes

${customNotes}

`
    }

    markdown += `---

*This report was generated by Taksa Dana AI-Powered Property Valuation System.  
For questions or additional analysis, please contact your valuation specialist.*

**Report ID:** RPT-${Date.now()}  
**Confidentiality Level:** Restricted  
**Distribution:** Authorized Personnel Only`

    return markdown
  }

  const downloadReport = (format: string) => {
    const content = format === "MARKDOWN" ? generateMarkdownReport() : JSON.stringify(data, null, 2)
    const filename = `${reportConfig.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${format === "MARKDOWN" ? "md" : "json"}`
    const blob = new Blob([content], { type: format === "MARKDOWN" ? "text/markdown" : "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const reportSections = [
    { id: "overview", label: "Property Overview", icon: MapPin },
    { id: "valuation", label: "Valuation Analysis", icon: DollarSign },
    { id: "legal", label: "Legal Compliance", icon: CheckCircle },
    { id: "financial", label: "Financial Analysis", icon: TrendingUp },
    { id: "recommendations", label: "Recommendations", icon: AlertTriangle }
  ]

  const reportTypes = [
    { value: "VALUATION_REPORT", label: "Valuation Report", description: "Comprehensive property valuation analysis" },
    { value: "LEGAL_COMPLIANCE", label: "Legal Compliance", description: "Legal verification and compliance report" },
    { value: "FINANCIAL_ANALYSIS", label: "Financial Analysis", description: "Financial modeling and investment analysis" },
    { value: "COMPREHENSIVE_ANALYSIS", label: "Comprehensive Analysis", description: "Complete analysis with all sections" }
  ]

  const formatOptions = [
    { value: "PDF", label: "PDF Document", icon: FileText, description: "Professional formatted report" },
    { value: "GOOGLE_SHEETS", label: "Google Sheets", icon: FileSpreadsheet, description: "Editable spreadsheet format" },
    { value: "MARKDOWN", label: "Markdown", icon: File, description: "Flexible text format" },
    { value: "JSON", label: "JSON Data", icon: File, description: "Raw data export" }
  ]

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generator">Generate Report</TabsTrigger>
          <TabsTrigger value="history">Report History</TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-6">
          {/* Report Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Report Configuration
              </CardTitle>
              <CardDescription>
                Configure your report settings and generate customized analysis documents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="reportTitle">Report Title</Label>
                    <Input
                      id="reportTitle"
                      value={reportConfig.title}
                      onChange={(e) => handleConfigChange("title", e.target.value)}
                      placeholder="Enter report title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="reportType">Report Type</Label>
                    <Select value={reportConfig.type} onValueChange={(value) => handleConfigChange("type", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent>
                        {reportTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-xs text-muted-foreground">{type.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="reportFormat">Output Format</Label>
                    <Select value={reportConfig.format} onValueChange={(value) => handleConfigChange("format", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        {formatOptions.map((format) => (
                          <SelectItem key={format.value} value={format.value}>
                            <div className="flex items-center gap-2">
                              <format.icon className="h-4 w-4" />
                              <div>
                                <div className="font-medium">{format.label}</div>
                                <div className="text-xs text-muted-foreground">{format.description}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Include Sections</Label>
                    <div className="mt-2 space-y-2">
                      {reportSections.map((section) => {
                        const Icon = section.icon
                        const isIncluded = reportConfig.includeSections.includes(section.id)
                        return (
                          <div key={section.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={section.id}
                              checked={isIncluded}
                              onChange={() => handleSectionToggle(section.id)}
                              className="rounded"
                            />
                            <label htmlFor={section.id} className="flex items-center gap-2 text-sm cursor-pointer">
                              <Icon className="h-4 w-4" />
                              {section.label}
                            </label>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="customNotes">Custom Notes</Label>
                    <Textarea
                      id="customNotes"
                      value={reportConfig.customNotes}
                      onChange={(e) => handleConfigChange("customNotes", e.target.value)}
                      placeholder="Add any additional notes or comments for the report"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button 
                  variant="outline" 
                  onClick={() => downloadReport(reportConfig.format)}
                  disabled={isGenerating}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Quick Download
                </Button>
                <Button onClick={generateReport} disabled={isGenerating}>
                  {isGenerating ? (
                    <>
                      <Calendar className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Report Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Report Preview
              </CardTitle>
              <CardDescription>
                Preview of what your report will contain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
                <pre className="text-sm whitespace-pre-wrap font-mono">
                  {generateMarkdownReport()}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generated Reports</CardTitle>
              <CardDescription>
                History of previously generated reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedReports.length > 0 ? (
                <div className="space-y-4">
                  {generatedReports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <h4 className="font-medium">{report.title}</h4>
                          <Badge variant="outline">{report.type.replace(/_/g, ' ')}</Badge>
                          <Badge variant="secondary">{report.format}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Generated on {formatDate(report.generatedAt)} • {report.size}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No Reports Generated Yet</h3>
                  <p className="text-muted-foreground">
                    Generate your first report to see it appear here
                  </p>
                  <Button className="mt-4" onClick={() => setActiveTab("generator")}>
                    Generate Report
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}