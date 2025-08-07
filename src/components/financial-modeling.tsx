"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  DollarSign,
  Percent,
  BarChart3,
  PieChart,
  Target,
  Shield
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

interface FinancialModel {
  id: string
  loanToValue: number
  debtServiceCoverage: number
  estimatedRoi: number
  cashFlow: number
  capRate: number
  stressTestResults: {
    interestRateShock: number
    rentalDecline: number
    valueDecline: number
    impact: "LOW" | "MEDIUM" | "HIGH"
  }
  scenarioAnalysis: Array<{
    name: string
    description: string
    roi: number
    cashFlow: number
    probability: number
  }>
  recommendedLoanAmount: number
  riskAssessment: {
    overallRisk: "LOW" | "MEDIUM" | "HIGH"
    factors: string[]
    mitigation: string[]
  }
}

interface PropertyValuation {
  estimatedValue: number
  valuePerSqm: number
  confidenceScore: number
}

interface FinancialModelingProps {
  valuation: PropertyValuation
  financialModel?: FinancialModel
  onModelUpdate?: (model: Partial<FinancialModel>) => void
  isLoading?: boolean
}

export function FinancialModeling({ 
  valuation, 
  financialModel, 
  onModelUpdate, 
  isLoading = false 
}: FinancialModelingProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [loanParameters, setLoanParameters] = useState({
    loanAmount: valuation.estimatedValue * 0.7, // 70% LTV default
    interestRate: 11, // 11% default
    loanTerm: 10, // 10 years default
    rentalYield: 0.06, // 6% rental yield default
    operatingExpenses: 0.3, // 30% operating expenses default
    vacancyRate: 0.05 // 5% vacancy rate default
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "LOW": return "bg-green-100 text-green-800"
      case "MEDIUM": return "bg-yellow-100 text-yellow-800"
      case "HIGH": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const calculateFinancialMetrics = () => {
    const { loanAmount, interestRate, loanTerm, rentalYield, operatingExpenses, vacancyRate } = loanParameters
    
    // Calculate loan metrics
    const ltv = loanAmount / valuation.estimatedValue
    const monthlyRate = interestRate / 100 / 12
    const numPayments = loanTerm * 12
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1)
    const annualPayment = monthlyPayment * 12

    // Calculate income metrics
    const potentialRentalIncome = valuation.estimatedValue * rentalYield
    const vacancyLoss = potentialRentalIncome * vacancyRate
    const effectiveRentalIncome = potentialRentalIncome - vacancyLoss
    const operatingExpenseAmount = effectiveRentalIncome * operatingExpenses
    const netOperatingIncome = effectiveRentalIncome - operatingExpenseAmount
    const cashFlow = netOperatingIncome - annualPayment
    const debtServiceCoverage = annualPayment > 0 ? netOperatingIncome / annualPayment : 0
    const cashOnCashReturn = loanAmount > 0 ? cashFlow / loanAmount : 0
    const capRate = valuation.estimatedValue > 0 ? netOperatingIncome / valuation.estimatedValue : 0

    return {
      ltv,
      monthlyPayment,
      annualPayment,
      potentialRentalIncome,
      effectiveRentalIncome,
      netOperatingIncome,
      cashFlow,
      debtServiceCoverage,
      cashOnCashReturn,
      capRate
    }
  }

  const generateScenarios = () => {
    const baseMetrics = calculateFinancialMetrics()
    
    return [
      {
        name: "Base Case",
        description: "Current market conditions",
        roi: baseMetrics.cashOnCashReturn,
        cashFlow: baseMetrics.cashFlow,
        probability: 0.6,
        metrics: baseMetrics
      },
      {
        name: "Optimistic",
        description: "Strong market growth, low interest rates",
        roi: baseMetrics.cashOnCashReturn * 1.5,
        cashFlow: baseMetrics.cashFlow * 1.3,
        probability: 0.2,
        metrics: {
          ...baseMetrics,
          cashFlow: baseMetrics.cashFlow * 1.3,
          cashOnCashReturn: baseMetrics.cashOnCashReturn * 1.5
        }
      },
      {
        name: "Pessimistic",
        description: "Market downturn, rising interest rates",
        roi: baseMetrics.cashOnCashReturn * 0.5,
        cashFlow: baseMetrics.cashFlow * 0.7,
        probability: 0.2,
        metrics: {
          ...baseMetrics,
          cashFlow: baseMetrics.cashFlow * 0.7,
          cashOnCashReturn: baseMetrics.cashOnCashReturn * 0.5
        }
      }
    ]
  }

  const generateStressTestResults = () => {
    const baseMetrics = calculateFinancialMetrics()
    
    return {
      interestRateShock: {
        rate: loanParameters.interestRate + 3,
        impact: "Interest rates increase by 3%",
        newCashFlow: baseMetrics.cashFlow * 0.85,
        impactLevel: baseMetrics.cashFlow > 0 ? "MEDIUM" : "HIGH"
      },
      rentalDecline: {
        rate: 0.8, // 20% decline
        impact: "Rental income declines by 20%",
        newCashFlow: baseMetrics.cashFlow * 0.75,
        impactLevel: baseMetrics.cashFlow > 0 ? "MEDIUM" : "HIGH"
      },
      valueDecline: {
        rate: 0.85, // 15% decline
        impact: "Property value declines by 15%",
        newCashFlow: baseMetrics.cashFlow * 0.9,
        impactLevel: "LOW"
      }
    }
  }

  const metrics = calculateFinancialMetrics()
  const scenarios = generateScenarios()
  const stressTests = generateStressTestResults()

  // Chart data
  const scenarioChartData = scenarios.map(scenario => ({
    name: scenario.name,
    ROI: scenario.roi * 100,
    CashFlow: scenario.cashFlow / 1000000, // Convert to millions
    Probability: scenario.probability * 100
  }))

  const cashFlowChartData = [
    { month: "Jan", cashFlow: metrics.cashFlow },
    { month: "Feb", cashFlow: metrics.cashFlow * 1.02 },
    { month: "Mar", cashFlow: metrics.cashFlow * 1.05 },
    { month: "Apr", cashFlow: metrics.cashFlow * 1.03 },
    { month: "May", cashFlow: metrics.cashFlow * 1.07 },
    { month: "Jun", cashFlow: metrics.cashFlow * 1.1 }
  ]

  const handleParameterChange = (field: string, value: number) => {
    setLoanParameters(prev => ({ ...prev, [field]: value }))
  }

  // Mock financial model for demonstration
  const mockFinancialModel: FinancialModel = {
    id: "financial_" + Date.now(),
    loanToValue: metrics.ltv,
    debtServiceCoverage: metrics.debtServiceCoverage,
    estimatedRoi: metrics.cashOnCashReturn,
    cashFlow: metrics.cashFlow,
    capRate: metrics.capRate,
    stressTestResults: {
      interestRateShock: loanParameters.interestRate + 3,
      rentalDecline: 0.8,
      valueDecline: 0.85,
      impact: metrics.debtServiceCoverage > 1.2 ? "LOW" : metrics.debtServiceCoverage > 1.0 ? "MEDIUM" : "HIGH"
    },
    scenarioAnalysis: scenarios,
    recommendedLoanAmount: valuation.estimatedValue * 0.7,
    riskAssessment: {
      overallRisk: metrics.debtServiceCoverage > 1.2 ? "LOW" : metrics.debtServiceCoverage > 1.0 ? "MEDIUM" : "HIGH",
      factors: [
        "Interest rate risk",
        "Market volatility",
        "Property location risk",
        "Tenant concentration risk"
      ],
      mitigation: [
        "Consider fixed interest rate",
        "Maintain adequate reserves",
        "Diversify tenant base",
        "Regular property maintenance"
      ]
    }
  }

  const model = financialModel || mockFinancialModel

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Financial Scenario Modeling
          </CardTitle>
          <CardDescription>
            Advanced financial analysis and scenario modeling for investment decision-making
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(metrics.cashFlow)}
              </div>
              <div className="text-sm text-muted-foreground">Annual Cash Flow</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {formatPercent(metrics.cashOnCashReturn)}
              </div>
              <div className="text-sm text-muted-foreground">Cash-on-Cash ROI</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {formatPercent(metrics.debtServiceCoverage)}
              </div>
              <div className="text-sm text-muted-foreground">DSCR</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {formatPercent(metrics.capRate)}
              </div>
              <div className="text-sm text-muted-foreground">Cap Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Analysis */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="parameters">Parameters</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          <TabsTrigger value="stress">Stress Test</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Key Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="h-4 w-4" />
                  Key Financial Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Loan-to-Value (LTV)</span>
                    <div className="text-right">
                      <div className="font-medium">{formatPercent(metrics.ltv)}</div>
                      <Progress value={metrics.ltv * 100} className="w-20 h-2" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Debt Service Coverage</span>
                    <div className="text-right">
                      <div className={`font-medium ${metrics.debtServiceCoverage > 1.2 ? 'text-green-600' : metrics.debtServiceCoverage > 1.0 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {formatPercent(metrics.debtServiceCoverage)}
                      </div>
                      <Progress value={Math.min(metrics.debtServiceCoverage * 50, 100)} className="w-20 h-2" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cash-on-Cash Return</span>
                    <div className="text-right">
                      <div className="font-medium">{formatPercent(metrics.cashOnCashReturn)}</div>
                      <div className="text-xs text-muted-foreground">
                        {metrics.cashOnCashReturn > 0.08 ? 'Excellent' : metrics.cashOnCashReturn > 0.05 ? 'Good' : 'Below Target'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Capitalization Rate</span>
                    <div className="text-right">
                      <div className="font-medium">{formatPercent(metrics.capRate)}</div>
                      <div className="text-xs text-muted-foreground">
                        {metrics.capRate > 0.08 ? 'High' : metrics.capRate > 0.05 ? 'Market' : 'Low'}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cash Flow Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4" />
                  Cash Flow Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Potential Rental Income</span>
                      <div className="font-medium">{formatCurrency(metrics.potentialRentalIncome)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Effective Rental Income</span>
                      <div className="font-medium">{formatCurrency(metrics.effectiveRentalIncome)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Operating Expenses</span>
                      <div className="font-medium">{formatCurrency(metrics.operatingExpenseAmount)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Net Operating Income</span>
                      <div className="font-medium">{formatCurrency(metrics.netOperatingIncome)}</div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Annual Debt Service</span>
                      <span className="font-medium">{formatCurrency(metrics.annualPayment)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`font-medium ${metrics.cashFlow > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        Net Cash Flow
                      </span>
                      <span className={`font-bold ${metrics.cashFlow > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(metrics.cashFlow)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cash Flow Projection Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <LineChart className="h-4 w-4" />
                6-Month Cash Flow Projection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={cashFlowChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Cash Flow']}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cashFlow" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parameters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Loan Parameters</CardTitle>
              <CardDescription>
                Adjust loan and financing parameters to model different scenarios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="loanAmount">Loan Amount</Label>
                    <div className="mt-2">
                      <Input
                        id="loanAmount"
                        type="number"
                        value={loanParameters.loanAmount}
                        onChange={(e) => handleParameterChange("loanAmount", Number(e.target.value))}
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        LTV: {formatPercent(loanParameters.loanAmount / valuation.estimatedValue)}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="interestRate">Interest Rate (%)</Label>
                    <div className="mt-2">
                      <Slider
                        value={[loanParameters.interestRate]}
                        onValueChange={(value) => handleParameterChange("interestRate", value[0])}
                        max={20}
                        min={5}
                        step={0.5}
                        className="w-full"
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        {loanParameters.interestRate}% annually
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="loanTerm">Loan Term (Years)</Label>
                    <div className="mt-2">
                      <Slider
                        value={[loanParameters.loanTerm]}
                        onValueChange={(value) => handleParameterChange("loanTerm", value[0])}
                        max={30}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        {loanParameters.loanTerm} years
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="rentalYield">Rental Yield (%)</Label>
                    <div className="mt-2">
                      <Slider
                        value={[loanParameters.rentalYield * 100]}
                        onValueChange={(value) => handleParameterChange("rentalYield", value[0] / 100)}
                        max={15}
                        min={2}
                        step={0.5}
                        className="w-full"
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatPercent(loanParameters.rentalYield)} of property value
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="operatingExpenses">Operating Expenses (%)</Label>
                    <div className="mt-2">
                      <Slider
                        value={[loanParameters.operatingExpenses * 100]}
                        onValueChange={(value) => handleParameterChange("operatingExpenses", value[0] / 100)}
                        max={60}
                        min={10}
                        step={5}
                        className="w-full"
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatPercent(loanParameters.operatingExpenses)} of effective rental income
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="vacancyRate">Vacancy Rate (%)</Label>
                    <div className="mt-2">
                      <Slider
                        value={[loanParameters.vacancyRate * 100]}
                        onValueChange={(value) => handleParameterChange("vacancyRate", value[0] / 100)}
                        max={20}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatPercent(loanParameters.vacancyRate)} vacancy rate
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scenario Analysis</CardTitle>
              <CardDescription>
                Compare different market scenarios and their financial impacts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Scenario Comparison Chart */}
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={scenarioChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" tickFormatter={(value) => `${value}%`} />
                    <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value}M`} />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        name === "ROI" ? `${value.toFixed(1)}%` : 
                        name === "CashFlow" ? `${value.toFixed(1)}M` : 
                        `${value.toFixed(0)}%`,
                        name === "ROI" ? "ROI" : 
                        name === "CashFlow" ? "Cash Flow (M)" : 
                        "Probability"
                      ]}
                    />
                    <Bar yAxisId="left" dataKey="ROI" fill="#3b82f6" name="ROI" />
                    <Bar yAxisId="right" dataKey="CashFlow" fill="#10b981" name="CashFlow" />
                  </BarChart>
                </ResponsiveContainer>

                {/* Scenario Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {scenarios.map((scenario, index) => (
                    <Card key={index} className={
                      scenario.name === "Base Case" ? "border-blue-200" : 
                      scenario.name === "Optimistic" ? "border-green-200" : 
                      "border-red-200"
                    }>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          {scenario.name === "Optimistic" ? <TrendingUp className="h-4 w-4 text-green-600" /> :
                           scenario.name === "Pessimistic" ? <TrendingDown className="h-4 w-4 text-red-600" /> :
                           <Target className="h-4 w-4 text-blue-600" />}
                          {scenario.name}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {scenario.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="text-center">
                          <div className={`text-lg font-bold ${
                            scenario.roi > 0.08 ? 'text-green-600' : 
                            scenario.roi > 0.05 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {formatPercent(scenario.roi)}
                          </div>
                          <div className="text-xs text-muted-foreground">ROI</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-lg font-bold ${scenario.cashFlow > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(scenario.cashFlow)}
                          </div>
                          <div className="text-xs text-muted-foreground">Annual Cash Flow</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium">
                            {formatPercent(scenario.probability)}
                          </div>
                          <div className="text-xs text-muted-foreground">Probability</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Stress Testing
              </CardTitle>
              <CardDescription>
                Analyze how the investment performs under adverse conditions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(stressTests).map(([key, test]: [string, any]) => (
                    <Card key={key} className={
                      test.impactLevel === "LOW" ? "border-green-200" :
                      test.impactLevel === "MEDIUM" ? "border-yellow-200" :
                      "border-red-200"
                    }>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {test.impact}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          <div className={`text-lg font-bold ${
                            test.newCashFlow > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(test.newCashFlow)}
                          </div>
                          <div className="text-xs text-muted-foreground">Stressed Cash Flow</div>
                        </div>
                        <div className="text-center mt-3">
                          <Badge className={
                            test.impactLevel === "LOW" ? "bg-green-100 text-green-800" :
                            test.impactLevel === "MEDIUM" ? "bg-yellow-100 text-yellow-800" :
                            "bg-red-100 text-red-800"
                          }>
                            {test.impactLevel} IMPACT
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertTitle>Stress Test Summary</AlertTitle>
                  <AlertDescription>
                    The investment shows {model.stressTestResults.impact === "LOW" ? "strong" : model.stressTestResults.impact === "MEDIUM" ? "moderate" : "weak"} 
                    resilience under stress conditions. {model.stressTestResults.impact === "HIGH" ? "Consider additional risk mitigation strategies." : ""}
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment</CardTitle>
              <CardDescription>
                Comprehensive risk analysis and mitigation strategies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Overall Risk Level</h4>
                  <p className="text-sm text-muted-foreground">
                    Based on financial metrics and market conditions
                  </p>
                </div>
                <Badge className={getRiskColor(model.riskAssessment.overallRisk)}>
                  {model.riskAssessment.overallRisk} RISK
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3 text-red-600">Risk Factors</h4>
                  <div className="space-y-2">
                    {model.riskAssessment.factors.map((factor, index) => (
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
                    {model.riskAssessment.mitigation.map((strategy, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <Shield className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{strategy}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Investment Recommendation</h4>
                <Alert>
                  <Target className="h-4 w-4" />
                  <AlertTitle>
                    {model.riskAssessment.overallRisk === "LOW" ? "Recommended" :
                     model.riskAssessment.overallRisk === "MEDIUM" ? "Consider with Caution" :
                     "Not Recommended"}
                  </AlertTitle>
                  <AlertDescription>
                    {model.riskAssessment.overallRisk === "LOW" ? 
                      "This investment shows strong fundamentals and acceptable risk levels. Recommended for proceed." :
                      model.riskAssessment.overallRisk === "MEDIUM" ?
                      "This investment has potential but requires careful risk management and due diligence." :
                      "This investment carries significant risks that may outweigh potential returns. Not recommended at current terms."
                    }
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}