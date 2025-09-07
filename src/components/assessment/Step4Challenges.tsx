import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  data: any;
  updateData: (updates: any) => void;
  onNext: () => void;
}

const challengeOptions = [
  "Lead Management",
  "Pre-sales discovery and scoping", 
  "Client Activation, Onboarding, Adoption",
  "Customer Success - Client services, growth, retention, re-marketing"
];

const getMetricOptions = (challenges: string[]) => {
  const metricMap: Record<string, string[]> = {
    "Lead Management": [
      "Pipeline Volume & Velocity", 
      "Lead Qualification (ICP, Attribution, Segmentation)", 
      "Lead-to-Opportunity Conversion Rate",
      "Opportunity-to-Close Rate",
      "Cost per Qualified Lead"
    ],
    "Pre-sales discovery and scoping": [
      "Discovery call conversion rate",
      "Proposal win rate", 
      "Time to proposal delivery",
      "Discovery process duration",
      "Proposal accuracy rate"
    ],
    "Client Activation, Onboarding, Adoption": [
      "Time to first value",
      "Onboarding completion rate",
      "Feature adoption rate",
      "Client activation time",
      "User engagement score"
    ],
    "Customer Success - Client services, growth, retention, re-marketing": [
      "Customer retention rate",
      "Net revenue retention",
      "Customer satisfaction score", 
      "Upsell/cross-sell revenue",
      "Customer lifetime value"
    ]
  };

  const allMetrics = new Set<string>();
  challenges.forEach(challenge => {
    metricMap[challenge]?.forEach(metric => allMetrics.add(metric));
  });
  return Array.from(allMetrics);
};

const Step4Challenges = ({ data, updateData, onNext }: Props) => {
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>(data.challenges || []);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(data.metrics?.selected || []);
  const [metricValues, setMetricValues] = useState<Record<string, string>>(data.metricsQuantified || {});
  const [step, setStep] = useState<number>(1);

  const handleChallengeToggle = (challenge: string) => {
    const updated = selectedChallenges.includes(challenge)
      ? selectedChallenges.filter(c => c !== challenge)
      : selectedChallenges.length < 2 
        ? [...selectedChallenges, challenge]
        : selectedChallenges;
    
    setSelectedChallenges(updated);
    updateData({ challenges: updated });
  };

  const handleMetricToggle = (metric: string) => {
    const updated = selectedMetrics.includes(metric)
      ? selectedMetrics.filter(m => m !== metric)
      : selectedMetrics.length < 3
        ? [...selectedMetrics, metric]
        : selectedMetrics;
    
    setSelectedMetrics(updated);
    updateData({ metrics: { selected: updated } });
  };

  const handleMetricValueChange = (metric: string, value: string) => {
    const updated = { ...metricValues, [metric]: value };
    setMetricValues(updated);
    updateData({ metricsQuantified: updated });
  };

  const handleNext = () => {
    if (step === 1 && selectedChallenges.length > 0) {
      setStep(2);
    } else if (step === 2 && selectedMetrics.length > 0) {
      setStep(3);
    } else if (step === 3) {
      onNext();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const availableMetrics = getMetricOptions(selectedChallenges);

  return (
    <div className="space-y-8 animate-fade-in">
      {step === 1 && (
        <>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-text-primary mb-3">
              Select your top revenue challenges (max 2):
            </h2>
            <p className="text-text-secondary">
              Choose the areas where you see the biggest opportunities for improvement
            </p>
          </div>

          <div className="space-y-4">
            {challengeOptions.map((challenge) => (
              <div key={challenge} className="flex items-center space-x-3">
                <Checkbox
                  id={challenge}
                  checked={selectedChallenges.includes(challenge)}
                  onCheckedChange={() => handleChallengeToggle(challenge)}
                  disabled={!selectedChallenges.includes(challenge) && selectedChallenges.length >= 2}
                />
                <Label 
                  htmlFor={challenge} 
                  className="text-text-primary cursor-pointer flex-1"
                >
                  {challenge}
                </Label>
              </div>
            ))}
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-text-primary mb-3">
              Which metrics matter most for <span className="text-user-accent">{selectedChallenges.join(" and ")}</span>?
            </h2>
            <p className="text-text-secondary">
              Select up to 3 metrics you currently track or want to improve
            </p>
          </div>

          <div className="space-y-4">
            {availableMetrics.map((metric) => (
              <div key={metric} className="flex items-center space-x-3">
                <Checkbox
                  id={metric}
                  checked={selectedMetrics.includes(metric)}
                  onCheckedChange={() => handleMetricToggle(metric)}
                  disabled={!selectedMetrics.includes(metric) && selectedMetrics.length >= 3}
                />
                <Label 
                  htmlFor={metric} 
                  className="text-text-primary cursor-pointer flex-1"
                >
                  {metric}
                </Label>
              </div>
            ))}
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-text-primary mb-3">
              Quantify your top metrics:
            </h2>
            <p className="text-text-secondary">
              Help us understand your current performance baseline
            </p>
          </div>

          <div className="space-y-4">
            {selectedMetrics.slice(0, 2).map((metric) => (
              <div key={metric} className="space-y-2">
                <Label htmlFor={metric} className="text-text-primary font-medium">
                  {metric}
                </Label>
                <Input
                  id={metric}
                  value={metricValues[metric] || ""}
                  onChange={(e) => handleMetricValueChange(metric, e.target.value)}
                  placeholder={`e.g., "150 leads per month" or "16 hour discovery process"`}
                  className="input-field"
                />
              </div>
            ))}
          </div>
        </>
      )}

      <div className="flex justify-between">
        {step > 1 && (
          <Button
            onClick={handleBack}
            variant="outline"
          >
            ← Back
          </Button>
        )}
        
        <Button
          onClick={handleNext}
          disabled={
            (step === 1 && selectedChallenges.length === 0) ||
            (step === 2 && selectedMetrics.length === 0)
          }
          className="btn-sep px-8 ml-auto"
        >
          {step === 3 ? 'Continue' : 'Next'}
          <span className="ml-2">→</span>
        </Button>
      </div>
    </div>
  );
};

export default Step4Challenges;