'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input, Textarea } from '../../../components/ui/Input';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Badge } from '../../../components/ui/Badge';
import { Plus, Edit2, Save, X, ArrowLeft } from 'lucide-react';

interface Brand {
  id: string;
  name: string;
  description: string;
  brand_dna: string;
  styling_json: { primaryColor: string; font: string; tone: string };
}

export default function BrandHubPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBrand, setCurrentBrand] = useState<Partial<Brand>>({});

  useEffect(() => {
    setTimeout(() => {
      setBrands([{
        id: '1',
        name: 'AUTOMARC',
        description: 'AI Marketing OS',
        brand_dna: 'Minimalist, Professional, Innovative',
        styling_json: { primaryColor: '#DEDBC8', font: 'Almarai', tone: 'Professional' }
      }]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSave = async () => {
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6 bg-black min-h-screen text-[#E1E0CC]">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 bg-black min-h-screen text-[#E1E0CC]">
      
      <a 
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#E1E0CC]/60 hover:text-[#E1E0CC] transition-colors group"
      >
        <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
        Back to Dashboard
      </a>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-[#E1E0CC] tracking-tight">Brand Hub</h1>
          <p className="text-[#E1E0CC]/60 text-sm mt-1 font-light">Manage your brand&apos;s DNA, visual identity, and core messaging.</p>
        </div>
        <Button onClick={() => { setIsEditing(true); setCurrentBrand({}); }}>
          <Plus className="w-4 h-4 mr-2" />
          New Brand Profile
        </Button>
      </div>

      {isEditing ? (
        <Card className="bg-[#101010] border border-[#E1E0CC]/10">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Edit Brand Profile</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Brand Name" 
                value={currentBrand.name || ''} 
                onChange={e => setCurrentBrand({...currentBrand, name: e.target.value})}
                placeholder="e.g. Acme Corp" 
              />
              <Input 
                label="Primary Tone" 
                value={currentBrand.styling_json?.tone || ''} 
                onChange={e => setCurrentBrand({...currentBrand, styling_json: { ...currentBrand.styling_json, tone: e.target.value } as any})}
                placeholder="e.g. Professional, Witty" 
              />
            </div>
            
            <Textarea 
              label="Brand DNA (Core Identity)" 
              value={currentBrand.brand_dna || ''} 
              onChange={e => setCurrentBrand({...currentBrand, brand_dna: e.target.value})}
              placeholder="Describe your brand's mission, values, and core identity..."
              rows={5}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-[#E1E0CC]/10">
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {brands.map(brand => (
            <Card key={brand.id} className="bg-[#101010] border border-[#E1E0CC]/10 hover:border-[#E1E0CC]/20 transition-colors">
              <CardHeader className="flex flex-row justify-between items-start pb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-xl">{brand.name}</CardTitle>
                    <Badge variant="success">Active</Badge>
                  </div>
                  <p className="text-[#E1E0CC]/60 text-sm mt-1 font-light">{brand.description}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => { setCurrentBrand(brand); setIsEditing(true); }}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </CardHeader>
              <CardContent>
                <div className="bg-[#212121] p-4 rounded-xl border border-[#E1E0CC]/10">
                  <h4 className="text-[10px] font-mono text-[#E1E0CC]/40 uppercase tracking-widest mb-2">Brand DNA</h4>
                  <p className="text-sm text-[#E1E0CC]/80 whitespace-pre-wrap font-light">{brand.brand_dna}</p>
                </div>
                
                <div className="mt-4 flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border border-[#E1E0CC]/30" style={{ backgroundColor: brand.styling_json?.primaryColor }} />
                    <span className="text-xs text-[#E1E0CC]/60 font-mono">{brand.styling_json?.primaryColor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-[#E1E0CC]/60">Tone:</span>
                    <Badge variant="default">{brand.styling_json?.tone}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
