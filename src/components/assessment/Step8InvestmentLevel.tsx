import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Zap, Rocket, Building } from "lucide-react";

interface Props {
  data: any;
  updateData: (updates: any) => void;
  onNext: () => void;
}

const investmentOptions = [
  {
    value: "Quick Win",
    icon: Zap,
    title: "Quick Win",
    budget: "Under $15,000",
    description: "Single tool or automation",
    timeline: "3-5 week sprint",
    color: "text-success",
    bgColor: "bg-success/10 border-success/20"
  },
  {
    value: "Transformation", 
    icon: Rocket,
    title: "Transformation",
    budget: "$15,000 - $50,000",
    description: "Department-wide system",
    timeline: "3-6 month rollout",
    color: "text-gabi-purple",
    bgColor: "bg-gabi-purple/10 border-gabi-purple/20"
  },
  {
    value: "Enterprise",
    icon: Building,
    title: "Enterprise", 
    budget: "$100,000+",
    description: "Company-wide AI operations",
    timeline: "6-12 month program",
    color: "text-gabi-pink",
    bgColor: "bg-gabi-pink/10 border-gabi-pink/20"
  }
];

const Step8InvestmentLevel = ({ data, updateData, onNext }: Props) => {
  const [selectedLevel, setSelectedLevel] = useState<string>(data.investmentLevel || "");

  const handleSelect = (level: string) => {
    setSelectedLevel(level);
    updateData({ investmentLevel: level });
  };

  const handleNext = () => {
    if (selectedLevel) {
      onNext();
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-text-primary mb-3">
          What solution size aligns with your growth plans?
        </h2>
        <p className="text-text-secondary">
          Choose the investment level that matches your current objectives
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {investmentOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedLevel === option.value;
          
          return (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`
                relative p-6 rounded-xl border-2 transition-all duration-300 text-center
                ${isSelected 
                  ? `${option.bgColor} border-current ${option.color} shadow-lg transform scale-105` 
                  : 'border-interactive-border hover:border-interactive-border/60 hover:transform hover:scale-102'
                }
              `}
            >
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                isSelected ? option.bgColor : 'bg-interactive-bg'
              }`}>
                <Icon className={`w-8 h-8 ${isSelected ? option.color : 'text-text-muted'}`} />
              </div>
              
              <h3 className={`text-xl font-bold mb-2 ${
                isSelected ? option.color : 'text-text-primary'
              }`}>
                {option.title}
              </h3>
              
              <p className={`text-lg font-semibold mb-3 ${
                isSelected ? option.color : 'text-user-accent'
              }`}>
                {option.budget}
              </p>
              
              <p className="text-text-secondary mb-2">
                {option.description}
              </p>
              
              <p className="text-sm text-text-muted">
                {option.timeline}
              </p>

              {isSelected && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-transparent via-transparent to-white/5 pointer-events-none" />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleNext}
          disabled={!selectedLevel}
          className="btn-gabi px-8"
        >
          Continue
          <span className="ml-2">→</span>
        </Button>
      </div>
    </div>
  );
};

export default Step8InvestmentLevel;