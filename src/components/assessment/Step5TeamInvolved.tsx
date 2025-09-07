import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Props {
  data: any;
  updateData: (updates: any) => void;
  onNext: () => void;
}

const Step5TeamInvolved = ({ data, updateData, onNext }: Props) => {
  const [teamDescription, setTeamDescription] = useState<string>(data.teamDescription || "");
  const [error, setError] = useState<string>("");

  const handleChange = (value: string) => {
    setTeamDescription(value);
    updateData({ teamDescription: value });
    if (error && value.length >= 30) {
      setError("");
    }
  };

  const handleNext = () => {
    if (teamDescription.trim().length < 30) {
      setError("Please provide at least 30 characters");
      return;
    }
    onNext();
  };

  const challengeArea = data.challenges?.[0] || "your selected challenge area";

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-text-primary mb-3">
          Who handles <span className="text-user-accent">{challengeArea}</span> in your organization?
        </h2>
        <p className="text-text-secondary">
          Include team size and primary responsibilities
        </p>
      </div>

      <div className="space-y-4">
        <Label htmlFor="team-description" className="text-text-primary font-medium">
          Team Structure & Roles
        </Label>
        
        <Textarea
          id="team-description"
          value={teamDescription}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="List the roles involved (e.g., '2 Solution Architects, 1 Sales Engineer, 3 Account Managers')"
          className="input-field min-h-32 resize-none"
        />
        
        <div className="flex justify-between items-center text-sm">
          <div className="text-text-muted">
            <p><strong>Helper:</strong> Include team size and primary responsibilities</p>
          </div>
          <div className="text-right">
            <p className={`${teamDescription.length >= 30 ? 'text-success' : 'text-text-muted'}`}>
              {teamDescription.length}/30 minimum
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
          disabled={teamDescription.trim().length < 30}
          className="btn-gabi px-8"
        >
          Continue
          <span className="ml-2">→</span>
        </Button>
      </div>
    </div>
  );
};

export default Step5TeamInvolved;