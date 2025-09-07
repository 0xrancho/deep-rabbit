import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  data: any;
  updateData: (updates: any) => void;
  onNext: () => void;
}

const getOpportunityOptions = (businessType: string) => {
  const options: Record<string, Array<{value: string, label: string, projects: string[]}>> = {
    "Custom Development Agencies": [
      {
        value: "Enterprise Software Development",
        label: "🎯 Enterprise Software Development",
        projects: ["Legacy Modernization", "Digital Transformation", "Custom ERP/CRM Extensions"]
      },
      {
        value: "SaaS Product Development",
        label: "🚀 SaaS Product Development",
        projects: ["MVP to Scale-up Builds", "Multi-tenant Architecture", "API-First Platforms"]
      },
      {
        value: "Mobile & Cross-Platform",
        label: "📱 Mobile & Cross-Platform",
        projects: ["Enterprise Mobile Apps", "Consumer App Development", "Progressive Web Apps"]
      },
      {
        value: "Integration & Automation",
        label: "🔧 Integration & Automation",
        projects: ["System Integration Projects", "Workflow Automation", "Data Pipeline Development"]
      }
    ],
    "Digital Transformation Consultancies": [
      {
        value: "Enterprise Modernization",
        label: "🏢 Enterprise Modernization",
        projects: ["Cloud Migration Strategy", "Monolith to Microservices", "Technical Debt Remediation"]
      },
      {
        value: "Process Automation",
        label: "🤖 Process Automation",
        projects: ["RPA Implementation", "BPM/BPMN Solutions", "AI-Powered Workflows"]
      },
      {
        value: "Data & Analytics Transformation",
        label: "📊 Data & Analytics Transformation",
        projects: ["Data Lake/Warehouse Setup", "BI Dashboard Development", "Predictive Analytics"]
      },
      {
        value: "Customer Experience (CX)",
        label: "🎨 Customer Experience (CX)",
        projects: ["Omnichannel Strategy", "Personalization Engines", "Customer Journey Mapping"]
      }
    ],
    "System Integration Specialists": [
      {
        value: "CRM Integration",
        label: "💼 CRM Integration",
        projects: ["Salesforce Implementation", "HubSpot Optimization", "Multi-CRM Synchronization"]
      },
      {
        value: "RevOps Platform Integration",
        label: "🔄 RevOps Platform Integration",
        projects: ["Lead-to-Cash Automation", "CPQ Implementation", "Commission/Incentive Systems"]
      },
      {
        value: "ERP Integration",
        label: "🏭 ERP Integration",
        projects: ["SAP/Oracle Implementation", "NetSuite Customization", "Manufacturing Systems (MES)"]
      },
      {
        value: "Middleware & iPaaS",
        label: "🔗 Middleware & iPaaS",
        projects: ["API Gateway Development", "Event-Driven Architecture", "Master Data Management"]
      }
    ],
    "Data & Analytics Consultancies": [
      {
        value: "AI/ML Implementation",
        label: "🧠 AI/ML Implementation",
        projects: ["Predictive Model Development", "NLP/Conversational AI", "Computer Vision Solutions"]
      },
      {
        value: "Business Intelligence",
        label: "📈 Business Intelligence",
        projects: ["Executive Dashboard Design", "Self-Service Analytics", "Real-time Reporting Systems"]
      },
      {
        value: "Data Engineering",
        label: "🏗️ Data Engineering",
        projects: ["ETL/ELT Pipeline Design", "Data Quality Management", "DataOps Implementation"]
      },
      {
        value: "Advanced Analytics",
        label: "🎯 Advanced Analytics",
        projects: ["Customer Analytics & Segmentation", "Revenue Attribution Modeling", "Operational Optimization"]
      }
    ],
    "Managed Service Providers (MSPs)": [
      {
        value: "Cloud Management Services",
        label: "☁️ Cloud Management Services",
        projects: ["Multi-Cloud Orchestration", "FinOps/Cost Optimization", "Disaster Recovery as a Service"]
      },
      {
        value: "Security Operations",
        label: "🛡️ Security Operations",
        projects: ["SOC as a Service", "Compliance Management", "Zero Trust Implementation"]
      },
      {
        value: "Infrastructure Management",
        label: "🖥️ Infrastructure Management",
        projects: ["Network Operations Center", "Database Administration", "Application Performance Management"]
      },
      {
        value: "Strategic IT Services",
        label: "🤝 Strategic IT Services",
        projects: ["vCIO/vCTO Services", "IT Roadmap Planning", "Digital Workplace Solutions"]
      }
    ],
    "Technology Resellers & Agents": [
      {
        value: "Software Licensing & Distribution",
        label: "💻 Software Licensing & Distribution",
        projects: ["Microsoft/O365 Licensing", "Adobe Creative Suite", "Enterprise Security Software"]
      },
      {
        value: "Cloud Brokerage Services",
        label: "☁️ Cloud Brokerage Services",
        projects: ["AWS/Azure/GCP Reselling", "SaaS Aggregation & Management", "Cloud Migration Facilitation"]
      },
      {
        value: "Unified Communications",
        label: "📞 Unified Communications",
        projects: ["UCaaS Solutions (Teams, Zoom)", "Contact Center Platforms", "VoIP/Telephony Systems"]
      },
      {
        value: "Hardware & Infrastructure",
        label: "🔌 Hardware & Infrastructure",
        projects: ["Networking Equipment", "Storage Solutions", "Edge Computing Devices"]
      }
    ]
  };

  return options[businessType] || [];
};

const Step2OpportunityFocus = ({ data, updateData, onNext }: Props) => {
  const [selectedFocus, setSelectedFocus] = useState<string>(data.opportunityFocus || "");
  
  const options = getOpportunityOptions(data.businessType || "");
  
  const handleSelect = (focus: string) => {
    setSelectedFocus(focus);
    updateData({ opportunityFocus: focus });
  };

  const handleNext = () => {
    if (selectedFocus) {
      onNext();
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-text-primary mb-3">
          Which <span className="text-user-accent">{data.businessType}</span> area is your biggest opportunity?
        </h2>
        <p className="text-text-secondary">
          Focus on where you see the most potential for growth or efficiency gains
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => handleSelect(option.value)}
            className={`selection-card text-left ${
              selectedFocus === option.value ? 'selected' : ''
            }`}
          >
            <div className="space-y-2">
              <h3 className="font-medium text-text-primary text-lg">{option.label}</h3>
              <div className="text-sm text-text-secondary">
                <span className="font-medium">Common projects:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {option.projects.map((project, idx) => (
                    <span key={idx} className="inline-block px-2 py-1 bg-interactive-bg rounded text-xs">
                      {project}
                    </span>
                  ))}
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 ${
                selectedFocus === option.value
                  ? 'border-user-accent bg-user-accent'
                  : 'border-interactive-border'
              } ml-auto`}>
                {selectedFocus === option.value && (
                  <div className="w-full h-full rounded-full bg-white scale-50" />
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleNext}
          disabled={!selectedFocus}
          className="btn-sep px-8"
        >
          Continue
          <span className="ml-2">→</span>
        </Button>
      </div>
    </div>
  );
};

export default Step2OpportunityFocus;