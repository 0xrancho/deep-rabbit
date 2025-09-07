import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Props {
  data: any;
  updateData: (updates: any) => void;
  onNext: () => void;
}

const Step3RevenueModel = ({ data, updateData, onNext }: Props) => {
  const [revenueModel, setRevenueModel] = useState<string>(data.revenueModel || "");
  const [error, setError] = useState<string>("");

  const handleChange = (value: string) => {
    setRevenueModel(value);
    updateData({ revenueModel: value });
    if (error && value.length >= 50) {
      setError("");
    }
  };

  const handleNext = () => {
    if (revenueModel.trim().length < 50) {
      setError("Please provide at least 50 characters");
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-text-primary mb-3">
          How do you generate revenue from <span className="text-user-accent">{data.opportunityFocus}</span>?
        </h2>
        <p className="text-text-secondary">
          Describe your pricing model and typical engagement structure
        </p>
      </div>

      <div className="space-y-4">
        <Label htmlFor="revenue-model" className="text-text-primary font-medium">
          Revenue Model & Pricing Structure
        </Label>
        
        <Textarea
          id="revenue-model"
          value={revenueModel}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Describe your pricing model and typical engagement structure..."
          className="input-field min-h-32 resize-none"
        />
        
        <div className="flex justify-between items-center text-sm">
          <div className="space-y-1 text-text-muted">
            <p><strong>Examples:</strong></p>
            <p>• "We charge $50K for implementations then $5K/month for support"</p>
            <p>• "Discovery at $15K, then projects from $100-500K"</p>
            <p>• "Monthly retainers of $10-20K"</p>
          </div>
          <div className="text-right">
            <p className={`${revenueModel.length >= 50 ? 'text-success' : 'text-text-muted'}`}>
              {revenueModel.length}/50 minimum
            </p>
          </div>
        </div>
        
        {error && (
          <p className="text-error text-sm">{error}</p>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleNext}
          disabled={revenueModel.trim().length < 50}
          className="btn-gabi px-8"
        >
          Continue
          <span className="ml-2">→</span>
        </Button>
      </div>
    </div>
  );
};

export default Step3RevenueModel;