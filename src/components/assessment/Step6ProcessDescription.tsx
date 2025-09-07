import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Props {
  data: any;
  updateData: (updates: any) => void;
  onNext: () => void;
}

const Step6ProcessDescription = ({ data, updateData, onNext }: Props) => {
  const [processDescription, setProcessDescription] = useState<string>(data.processDescription || "");
  const [error, setError] = useState<string>("");

  const handleChange = (value: string) => {
    setProcessDescription(value);
    updateData({ processDescription: value });
    
    const wordCount = value.trim().split(/\s+/).filter(word => word.length > 0).length;
    if (error && wordCount >= 50) {
      setError("");
    }
  };

  const handleNext = () => {
    const wordCount = processDescription.trim().split(/\s+/).filter(word => word.length > 0).length;
    if (wordCount < 50) {
      setError("Please provide at least 50 words");
      return;
    }
    onNext();
  };

  const challengeArea = data.challenges?.[0] || "your selected challenge area";
  const wordCount = processDescription.trim().split(/\s+/).filter(word => word.length > 0).length;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-text-primary mb-3">
          Walk us through your <span className="text-user-accent">{challengeArea}</span> process:
        </h2>
        <p className="text-text-secondary">
          Start from the trigger event and describe each step
        </p>
      </div>

      <div className="space-y-4">
        <Label htmlFor="process-description" className="text-text-primary font-medium">
          Current Process Flow
        </Label>

        <div className="bg-interactive-bg/30 border border-interactive-border rounded-lg p-4 mb-4">
          <p className="text-sm text-text-secondary">
            <strong>Example:</strong> When a prospect books a discovery call, our solutions architect spends 
            8 hours researching their tech stack using LinkedIn and their website. They create 
            a 10-slide deck in PowerPoint, then do a 1-hour call. The biggest friction is 
            finding accurate technical requirements without direct access to their systems.
          </p>
        </div>
        
        <Textarea
          id="process-description"
          value={processDescription}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Start from the trigger event and describe each step..."
          className="input-field min-h-40 resize-none"
        />
        
        <div className="flex justify-between items-center text-sm">
          <div className="text-text-muted">
            <p>Describe each step in your current process</p>
          </div>
          <div className="text-right">
            <p className={`${wordCount >= 50 ? 'text-success' : 'text-text-muted'}`}>
              {wordCount} words (minimum 50)
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
          disabled={wordCount < 50}
          className="btn-gabi px-8"
        >
          Continue
          <span className="ml-2">→</span>
        </Button>
      </div>
    </div>
  );
};

export default Step6ProcessDescription;