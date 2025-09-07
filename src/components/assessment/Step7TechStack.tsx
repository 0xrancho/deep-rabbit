import { useState, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface Props {
  data: any;
  updateData: (updates: any) => void;
  onNext: () => void;
}

const Step7TechStack = ({ data, updateData, onNext }: Props) => {
  const [techStack, setTechStack] = useState<string[]>(data.techStack || []);
  const [inputValue, setInputValue] = useState<string>("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addTool(inputValue.trim());
    }
  };

  const addTool = (tool: string) => {
    if (tool && !techStack.includes(tool)) {
      const updated = [...techStack, tool];
      setTechStack(updated);
      updateData({ techStack: updated });
      setInputValue("");
    }
  };

  const removeTool = (tool: string) => {
    const updated = techStack.filter(t => t !== tool);
    setTechStack(updated);
    updateData({ techStack: updated });
  };

  const handleNext = () => {
    if (techStack.length > 0) {
      onNext();
    }
  };

  const challengeArea = data.challenges?.[0] || "your selected challenge area";

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-text-primary mb-3">
          What tools does your team use for <span className="text-user-accent">{challengeArea}</span>?
        </h2>
        <p className="text-text-secondary">
          Type tool names and press Enter to add them
        </p>
      </div>

      <div className="space-y-4">
        <Label htmlFor="tech-stack" className="text-text-primary font-medium">
          Current Technology Stack
        </Label>
        
        <Input
          id="tech-stack"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type tool names and press Enter (e.g., Salesforce, HubSpot, Excel, Slack...)"
          className="input-field"
        />
        
        {techStack.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-text-secondary">Added tools:</p>
            <div className="flex flex-wrap gap-2">
              {techStack.map((tool) => (
                <Badge
                  key={tool}
                  variant="secondary"
                  className="px-3 py-1 bg-user-accent/10 text-user-accent border border-user-accent/20 hover:bg-user-accent/20"
                >
                  {tool}
                  <button
                    onClick={() => removeTool(tool)}
                    className="ml-2 hover:text-error transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        <p className="text-sm text-text-muted">
          Minimum: 1 tool required
        </p>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleNext}
          disabled={techStack.length === 0}
          className="btn-gabi px-8"
        >
          Continue
          <span className="ml-2">→</span>
        </Button>
      </div>
    </div>
  );
};

export default Step7TechStack;