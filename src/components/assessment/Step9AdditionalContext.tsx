import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Props {
  data: any;
  updateData: (updates: any) => void;
  onNext: () => void;
}

const Step9AdditionalContext = ({ data, updateData, onNext }: Props) => {
  const [additionalContext, setAdditionalContext] = useState<string>(data.additionalContext || "");

  const handleChange = (value: string) => {
    setAdditionalContext(value);
    updateData({ additionalContext: value });
  };

  const handleNext = () => {
    onNext();
  };

  const handleSkip = () => {
    updateData({ additionalContext: "" });
    onNext();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-text-primary mb-3">
          Anything else we should know?
        </h2>
        <p className="text-text-secondary">
          Share any specific goals, timeline, constraints, or context about your situation
        </p>
      </div>

      <div className="space-y-4">
        <Label htmlFor="additional-context" className="text-text-primary font-medium">
          Additional Context (Optional)
        </Label>
        
        <Textarea
          id="additional-context"
          value={additionalContext}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Specific goals, timeline, constraints, or context about your situation..."
          className="input-field min-h-32 resize-none"
        />
        
        <p className="text-sm text-text-muted">
          This helps us provide more tailored recommendations in your assessment report.
        </p>
      </div>

      <div className="flex justify-between gap-4">
        <Button
          onClick={handleSkip}
          variant="outline"
          className="px-8"
        >
          Skip to Assessment →
        </Button>
        
        <Button
          onClick={handleNext}
          className="btn-gabi px-8"
        >
          Generate Assessment →
        </Button>
      </div>
    </div>
  );
};

export default Step9AdditionalContext;