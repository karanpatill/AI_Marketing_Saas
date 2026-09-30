"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CalendarDays, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface GeneratePlanButtonProps {
  orgId: string;
  brandId?: string;
}

export function GeneratePlanButton({ orgId, brandId }: GeneratePlanButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      toast.loading("Generating 30-day strategy using Gemini...", { id: "gen-plan" });
      
      const res = await fetch("/api/campaigns/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId, brandId }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate plan");
      }

      toast.success(`Successfully mapped ${data.postCount} posts to your calendar!`, { id: "gen-plan" });
      router.refresh();
    } catch (err: any) {
      toast.error(err.message, { id: "gen-plan" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleGenerate} 
      disabled={isGenerating}
      leadingIcon={isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarDays className="h-4 w-4" />}
    >
      {isGenerating ? "Planning..." : "Generate 30 Days"}
    </Button>
  );
}
