"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Building2, Home, Factory, Store, LandPlot, Upload, X } from "lucide-react"

interface PropertyFormData {
  address: string
  district: string
  city: string
  province: string
  postalCode: string
  coordinates: string
  landSize: string
  buildingSize: string
  assetType: string
  zoning: string
  landUse: string
  ownershipStatus: string
  certificateNumber: string
  yearBuilt: string
  condition: string
  description: string
  features: string[]
  images: File[]
}

interface PropertyFormProps {
  onSubmit: (data: PropertyFormData) => void
  onSaveDraft?: (data: PropertyFormData) => void
  initialData?: Partial<PropertyFormData>
}

export function PropertyForm({ onSubmit, onSaveDraft, initialData }: PropertyFormProps) {
  const [formData, setFormData] = useState<PropertyFormData>({
    address: initialData?.address || "",
    district: initialData?.district || "",
    city: initialData?.city || "Jakarta",
    province: initialData?.province || "DKI Jakarta",
    postalCode: initialData?.postalCode || "",
    coordinates: initialData?.coordinates || "",
    landSize: initialData?.landSize || "",
    buildingSize: initialData?.buildingSize || "",
    assetType: initialData?.assetType || "",
    zoning: initialData?.zoning || "",
    landUse: initialData?.landUse || "",
    ownershipStatus: initialData?.ownershipStatus || "",
    certificateNumber: initialData?.certificateNumber || "",
    yearBuilt: initialData?.yearBuilt || "",
    condition: initialData?.condition || "",
    description: initialData?.description || "",
    features: initialData?.features || [],
    images: initialData?.images || []
  })

  const [newFeature, setNewFeature] = useState("")

  const assetTypeIcons = {
    RESIDENTIAL: Home,
    COMMERCIAL: Store,
    INDUSTRIAL: Factory,
    MIXED_USE: Building2,
    AGRICULTURAL: LandPlot,
    LAND_ONLY: MapPin
  }

  const handleInputChange = (field: keyof PropertyFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }))
      setNewFeature("")
    }
  }

  const removeFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== feature)
    }))
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }))
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleSaveDraft = () => {
    if (onSaveDraft) {
      onSaveDraft(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Basic Information
          </CardTitle>
          <CardDescription>Property location and basic details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address">Property Address *</Label>
              <Input
                id="address"
                placeholder="Enter complete property address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="district">District *</Label>
              <Input
                id="district"
                placeholder="e.g., Kelapa Gading"
                value={formData.district}
                onChange={(e) => handleInputChange("district", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Select value={formData.city} onValueChange={(value) => handleInputChange("city", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Jakarta">Jakarta</SelectItem>
                  <SelectItem value="Surabaya">Surabaya</SelectItem>
                  <SelectItem value="Bandung">Bandung</SelectItem>
                  <SelectItem value="Medan">Medan</SelectItem>
                  <SelectItem value="Semarang">Semarang</SelectItem>
                  <SelectItem value="Makassar">Makassar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="province">Province *</Label>
              <Select value={formData.province} onValueChange={(value) => handleInputChange("province", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select province" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DKI Jakarta">DKI Jakarta</SelectItem>
                  <SelectItem value="Jawa Barat">Jawa Barat</SelectItem>
                  <SelectItem value="Jawa Timur">Jawa Timur</SelectItem>
                  <SelectItem value="Jawa Tengah">Jawa Tengah</SelectItem>
                  <SelectItem value="Bali">Bali</SelectItem>
                  <SelectItem value="Sumatera Utara">Sumatera Utara</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                placeholder="e.g., 14240"
                value={formData.postalCode}
                onChange={(e) => handleInputChange("postalCode", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coordinates">Coordinates (Lat, Lng)</Label>
              <Input
                id="coordinates"
                placeholder="e.g., -6.2297, 106.8295"
                value={formData.coordinates}
                onChange={(e) => handleInputChange("coordinates", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Property Details
          </CardTitle>
          <CardDescription>Physical characteristics and asset type</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="landSize">Land Size (m²) *</Label>
              <Input
                id="landSize"
                type="number"
                placeholder="e.g., 5000"
                value={formData.landSize}
                onChange={(e) => handleInputChange("landSize", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buildingSize">Building Size (m²)</Label>
              <Input
                id="buildingSize"
                type="number"
                placeholder="e.g., 2000"
                value={formData.buildingSize}
                onChange={(e) => handleInputChange("buildingSize", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearBuilt">Year Built</Label>
              <Input
                id="yearBuilt"
                type="number"
                placeholder="e.g., 2010"
                value={formData.yearBuilt}
                onChange={(e) => handleInputChange("yearBuilt", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assetType">Asset Type *</Label>
              <Select value={formData.assetType} onValueChange={(value) => handleInputChange("assetType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select asset type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(assetTypeIcons).map(([type, Icon]) => (
                    <SelectItem key={type} value={type}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {type.replace("_", " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="condition">Property Condition</Label>
              <Select value={formData.condition} onValueChange={(value) => handleInputChange("condition", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXCELLENT">Excellent</SelectItem>
                  <SelectItem value="GOOD">Good</SelectItem>
                  <SelectItem value="FAIR">Fair</SelectItem>
                  <SelectItem value="POOR">Poor</SelectItem>
                  <SelectItem value="NEEDS_RENOVATION">Needs Renovation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Property Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the property, its surroundings, accessibility, and notable features..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Legal & Zoning */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Legal & Zoning Information
          </CardTitle>
          <CardDescription>Ownership status, zoning, and regulatory details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ownershipStatus">Ownership Status *</Label>
              <Select value={formData.ownershipStatus} onValueChange={(value) => handleInputChange("ownershipStatus", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select ownership status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CERTIFIED">Certified (SHM/SHGB)</SelectItem>
                  <SelectItem value="UNDER_PROCESS">Under Process</SelectItem>
                  <SelectItem value="UNCERTIFIED">Uncertified</SelectItem>
                  <SelectItem value="DISPUTED">Disputed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="certificateNumber">Certificate Number</Label>
              <Input
                id="certificateNumber"
                placeholder="e.g., SHM No. 1234"
                value={formData.certificateNumber}
                onChange={(e) => handleInputChange("certificateNumber", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zoning">Zoning Classification</Label>
              <Input
                id="zoning"
                placeholder="e.g., Commercial, Residential, Industrial"
                value={formData.zoning}
                onChange={(e) => handleInputChange("zoning", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="landUse">Current Land Use</Label>
              <Input
                id="landUse"
                placeholder="e.g., Office Building, Warehouse, Housing"
                value={formData.landUse}
                onChange={(e) => handleInputChange("landUse", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features & Amenities */}
      <Card>
        <CardHeader>
          <CardTitle>Features & Amenities</CardTitle>
          <CardDescription>Key features and amenities of the property</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add a feature (e.g., Swimming Pool, Parking, Security)"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
            />
            <Button type="button" onClick={addFeature} variant="outline">
              Add
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {formData.features.map((feature, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {feature}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeFeature(feature)}
                />
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Property Images */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Property Images
          </CardTitle>
          <CardDescription>Upload property photos and documents</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to upload images or drag and drop
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
              />
            </label>
          </div>

          {formData.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Property image ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        {onSaveDraft && (
          <Button type="button" variant="outline" onClick={handleSaveDraft}>
            Save Draft
          </Button>
        )}
        <Button type="submit">
          Start AI Valuation
        </Button>
      </div>
    </form>
  )
}