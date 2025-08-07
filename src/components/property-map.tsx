"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Building2, Layers, ZoomIn, ZoomOut, RotateCcw } from "lucide-react"

interface Property {
  id: string
  address: string
  district: string
  city: string
  coordinates?: string
  landSize: number
  assetType: string
  estimatedValue?: number
  confidenceScore?: number
}

interface ZoningOverlay {
  type: string
  color: string
  description: string
  regulations: string[]
}

interface PropertyMapProps {
  properties: Property[]
  center?: { lat: number; lng: number }
  zoom?: number
  onPropertySelect?: (property: Property) => void
  selectedProperty?: Property
}

export function PropertyMap({ 
  properties, 
  center = { lat: -6.2297, lng: 106.8295 }, // Jakarta coordinates
  zoom = 12,
  onPropertySelect,
  selectedProperty 
}: PropertyMapProps) {
  const [mapCenter, setMapCenter] = useState(center)
  const [mapZoom, setMapZoom] = useState(zoom)
  const [showZoning, setShowZoning] = useState(false)
  const [activeOverlay, setActiveOverlay] = useState<string>("none")

  // Mock zoning overlays for demonstration
  const zoningOverlays: ZoningOverlay[] = [
    {
      type: "Residential",
      color: "#10b981",
      description: "Residential zoning areas",
      regulations: ["Max 4 floors", "60% building coverage", "Minimum 3m setback"]
    },
    {
      type: "Commercial",
      color: "#3b82f6",
      description: "Commercial and business zones",
      regulations: ["No height limit", "80% building coverage", "Parking required"]
    },
    {
      type: "Industrial",
      color: "#f59e0b",
      description: "Industrial and manufacturing areas",
      regulations: ["Environmental impact required", "Heavy vehicle access", "Utility infrastructure"]
    },
    {
      type: "Mixed Use",
      color: "#8b5cf6",
      description: "Mixed commercial and residential",
      regulations: ["Mixed use permitted", "Floor area ratio limits", "Shared facilities"]
    }
  ]

  const handleZoomIn = () => {
    setMapZoom(prev => Math.min(prev + 1, 18))
  }

  const handleZoomOut = () => {
    setMapZoom(prev => Math.max(prev - 1, 1))
  }

  const handleResetView = () => {
    setMapCenter(center)
    setMapZoom(zoom)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const getAssetTypeColor = (assetType: string) => {
    const colors: Record<string, string> = {
      RESIDENTIAL: "bg-green-100 text-green-800",
      COMMERCIAL: "bg-blue-100 text-blue-800",
      INDUSTRIAL: "bg-yellow-100 text-yellow-800",
      MIXED_USE: "bg-purple-100 text-purple-800",
      LAND_ONLY: "bg-gray-100 text-gray-800",
      AGRICULTURAL: "bg-orange-100 text-orange-800"
    }
    return colors[assetType] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-4">
      {/* Map Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Property Map & Zoning Analysis
          </CardTitle>
          <CardDescription>
            Interactive map with property locations and zoning overlays
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button
                variant={showZoning ? "default" : "outline"}
                size="sm"
                onClick={() => setShowZoning(!showZoning)}
              >
                <Layers className="h-4 w-4 mr-2" />
                Zoning Layers
              </Button>
              
              {showZoning && (
                <Select value={activeOverlay} onValueChange={setActiveOverlay}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select overlay" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Overlay</SelectItem>
                    {zoningOverlays.map((zone) => (
                      <SelectItem key={zone.type} value={zone.type}>
                        {zone.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">Zoom: {mapZoom}</span>
              <Button variant="outline" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleResetView}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Map Container */}
          <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: "500px" }}>
            {/* Simplified map representation */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50">
              {/* Grid lines for map */}
              <div className="absolute inset-0 opacity-20">
                <div className="grid grid-cols-8 grid-rows-6 h-full w-full">
                  {Array.from({ length: 48 }).map((_, i) => (
                    <div key={i} className="border border-gray-300"></div>
                  ))}
                </div>
              </div>

              {/* Zoning overlays */}
              {showZoning && activeOverlay !== "none" && (
                <div className="absolute inset-0 opacity-30">
                  {zoningOverlays
                    .filter(zone => activeOverlay === zone.type || activeOverlay === "all")
                    .map((zone, index) => (
                      <div
                        key={zone.type}
                        className="absolute rounded-lg"
                        style={{
                          backgroundColor: zone.color,
                          top: `${20 + (index * 15)}%`,
                          left: `${15 + (index * 10)}%`,
                          width: `${30 + (index * 5)}%`,
                          height: `${25 + (index * 3)}%`
                        }}
                      />
                    ))}
                </div>
              )}

              {/* Property markers */}
              {properties.map((property, index) => {
                const isSelected = selectedProperty?.id === property.id
                const confidenceColor = property.confidenceScore 
                  ? property.confidenceScore > 0.8 ? "bg-green-500" 
                    : property.confidenceScore > 0.6 ? "bg-yellow-500" 
                    : "bg-red-500"
                  : "bg-gray-500"

                return (
                  <div
                    key={property.id}
                    className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
                      isSelected ? "scale-125 z-10" : "hover:scale-110"
                    }`}
                    style={{
                      top: `${30 + (index * 15)}%`,
                      left: `${25 + (index * 12)}%`
                    }}
                    onClick={() => onPropertySelect?.(property)}
                  >
                    <div className="relative">
                      <div className={`w-6 h-6 rounded-full ${confidenceColor} border-2 border-white shadow-lg`}></div>
                      <div className={`w-3 h-3 rounded-full bg-white absolute top-1.5 left-1.5 ${isSelected ? "animate-pulse" : ""}`}></div>
                      {isSelected && (
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                          {property.address}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* Map legend */}
              <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 max-w-xs">
                <h4 className="font-semibold text-sm mb-2">Legend</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>High Confidence (&gt;80%)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span>Medium Confidence (60-80%)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span>Low Confidence (&lt;60%)</span>
                  </div>
                </div>
              </div>

              {/* Zoning legend */}
              {showZoning && (
                <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 max-w-xs">
                  <h4 className="font-semibold text-sm mb-2">Zoning Types</h4>
                  <div className="space-y-1">
                    {zoningOverlays.map((zone) => (
                      <div key={zone.type} className="flex items-center gap-2 text-xs">
                        <div 
                          className="w-3 h-3 rounded" 
                          style={{ backgroundColor: zone.color }}
                        ></div>
                        <span>{zone.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Details Panel */}
      {selectedProperty && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Property Details
            </CardTitle>
            <CardDescription>
              Selected property information and analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="zoning">Zoning Info</TabsTrigger>
                <TabsTrigger value="comparables">Comparables</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Address</label>
                    <p className="text-sm">{selectedProperty.address}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">District</label>
                    <p className="text-sm">{selectedProperty.district}, {selectedProperty.city}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Land Size</label>
                    <p className="text-sm">{selectedProperty.landSize.toLocaleString('id-ID')} m²</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Asset Type</label>
                    <Badge className={getAssetTypeColor(selectedProperty.assetType)}>
                      {selectedProperty.assetType.replace('_', ' ')}
                    </Badge>
                  </div>
                  {selectedProperty.estimatedValue && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Estimated Value</label>
                      <p className="text-sm font-semibold">{formatCurrency(selectedProperty.estimatedValue)}</p>
                    </div>
                  )}
                  {selectedProperty.confidenceScore && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Confidence Score</label>
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              selectedProperty.confidenceScore > 0.8 ? "bg-green-500" :
                              selectedProperty.confidenceScore > 0.6 ? "bg-yellow-500" : "bg-red-500"
                            }`}
                            style={{ width: `${selectedProperty.confidenceScore * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{Math.round(selectedProperty.confidenceScore * 100)}%</span>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="zoning" className="space-y-4">
                <div className="space-y-4">
                  {zoningOverlays.map((zone) => (
                    <div key={zone.type} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div 
                          className="w-4 h-4 rounded" 
                          style={{ backgroundColor: zone.color }}
                        ></div>
                        <h4 className="font-semibold">{zone.type} Zone</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{zone.description}</p>
                      <div>
                        <label className="text-sm font-medium">Regulations:</label>
                        <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                          {zone.regulations.map((reg, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-primary">•</span>
                              <span>{reg}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="comparables" className="space-y-4">
                <div className="text-center py-8">
                  <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">Comparable Properties</h3>
                  <p className="text-muted-foreground">
                    Comparable property analysis will be displayed here
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Nearby Properties */}
      <Card>
        <CardHeader>
          <CardTitle>Properties in Area</CardTitle>
          <CardDescription>
            Showing {properties.length} properties in the current view
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {properties.map((property) => (
              <div
                key={property.id}
                className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                  selectedProperty?.id === property.id ? "border-primary bg-primary/5" : ""
                }`}
                onClick={() => onPropertySelect?.(property)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{property.address}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {property.district}, {property.city} • {property.landSize.toLocaleString('id-ID')} m²
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getAssetTypeColor(property.assetType)}>
                    {property.assetType.replace('_', ' ')}
                  </Badge>
                  {property.confidenceScore && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {Math.round(property.confidenceScore * 100)}% confidence
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}