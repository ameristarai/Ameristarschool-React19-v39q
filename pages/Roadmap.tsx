import type { ReactNode } from 'react';
import {
  ChevronDown, ChevronRight,
  Award, BookOpen, GraduationCap,
  Briefcase, FileCheck, RefreshCw,
} from 'lucide-react';
import SEO from '../components/SEO';
import { Page } from '../types';

// ── Types ──────────────────────────────────────────────────────────
interface MapNode {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  children?: MapNode[];
}

// ── ShieldIcon — declared BEFORE roadmapData uses it ───────────────
function ShieldIcon() {
  return (
    <svg
      width="20" height="20" viewBox="0 0 24 24"
      fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

// ── Roadmap Data ───────────────────────────────────────────────────
const roadmapData: MapNode[] = [
  {
    id: 'root',
    label: 'Select Your Path',
    description: 'Begin by choosing your desired professional license.',
    icon: <Award size={24} />,
    children: [
      {
        id: 'real-estate',
        label: 'Real Estate (DRE)',
        description: 'California Department of Real Estate Licensing',
        icon: <GraduationCap size={20} />,
        children: [
          {
            id: 're-salesperson',
            label: 'Salesperson License',
            description: 'For agents working under a broker.',
            children: [
              {
                id: 're-sales-ed',
                label: 'Education Requirements',
                description: 'Complete 3 college-level courses (135 Hours total).',
                children: [
                  {
                    id: 're-princ',
                    label: 'Real Estate Principles (45 Hrs)',
                    description: 'Mandatory',
                  },
                  {
                    id: 're-prac',
                    label: 'Real Estate Practice (45 Hrs)',
                    description: 'Mandatory',
                  },
                  {
                    id: 're-elec',
                    label: '1 Elective Course (45 Hrs)',
                    description: 'e.g., Finance, Appraisal, Legal Aspects',
                  },
                ],
              },
              {
                id: 're-sales-exam',
                label: 'State Examination',
                description: 'Pass the proctored exam with 70% or higher.',
                icon: <FileCheck size={16} />,
              },
              {
                id: 're-sales-app',
                label: 'License Application',
                description: 'Submit RE 205 form, fingerprints, and fees.',
                icon: <Briefcase size={16} />,
              },
            ],
          },
          {
            id: 're-broker',
            label: 'Broker License',
            description: 'For independent operation or managing agents.',
            children: [
              {
                id: 're-broker-ed',
                label: 'Education Requirements',
                description: '8 Statutory College-level Courses (360 Hours).',
                icon: <BookOpen size={16} />,
              },
              {
                id: 're-broker-exp',
                label: 'Experience Requirement',
                description:
                  '2 Years full-time experience as salesperson within last 5 years OR a 4-year real estate degree.',
                icon: <Award size={16} />,
              },
              {
                id: 're-broker-exam',
                label: 'Broker Examination',
                description: 'Pass the exam with 75% or higher.',
                icon: <FileCheck size={16} />,
              },
            ],
          },
          {
            id: 're-ce',
            label: 'License Renewal (CE)',
            description: 'Every 4 years.',
            icon: <RefreshCw size={16} />,
            children: [
              {
                id: 're-ce-first',
                label: 'First Renewal',
                description: '45 Hours including 5 separate ethics/agency courses.',
              },
              {
                id: 're-ce-subs',
                label: 'Subsequent Renewals',
                description: '45 Hours including 8-hour survey or separate mandates.',
              },
            ],
          },
        ],
      },
      {
        id: 'insurance',
        label: 'Insurance (DOI)',
        description: 'California Department of Insurance Licensing',
        icon: <ShieldIcon />,
        children: [
          {
            id: 'ins-life',
            label: 'Life, Accident & Health',
            description: 'Sell life insurance, annuities, and health coverage.',
            children: [
              {
                id: 'ins-life-pre',
                label: 'Pre-Licensing',
                description: '12 Hours Total (Ethics).',
                icon: <BookOpen size={16} />,
              },
              {
                id: 'ins-life-exam',
                label: 'PSI Examination',
                description: 'Pass the PSI proctored exam (60% min score).',
                icon: <FileCheck size={16} />,
              },
            ],
          },
          {
            id: 'ins-pc',
            label: 'Property & Casualty',
            description: 'Auto, home, commercial, and liability insurance.',
            children: [
              {
                id: 'ins-pc-pre',
                label: 'Pre-Licensing',
                description: '12 Hours Total (Ethics).',
                icon: <BookOpen size={16} />,
              },
              {
                id: 'ins-pc-exam',
                label: 'PSI Examination',
                description: 'Pass the PSI proctored exam (60% min score).',
                icon: <FileCheck size={16} />,
              },
            ],
          },
          {
            id: 'ins-ce',
            label: 'License Renewal (CE)',
            description: 'Every 2 years.',
            icon: <RefreshCw size={16} />,
            children: [
              {
                id: 'ins-ce-req',
                label: 'Requirement',
                description: '24 Hours total, must include 3 hours of Ethics.',
              },
            ],
          },
        ],
      },
    ],
  },
];

// ── Recursive Node Component ───────────────────────────────────────
// Expanded state is NOT stored locally — it lives in App.tsx so it
// survives SPA navigation (click away, come back = state preserved),
// while still resetting on a full page reload (F5 / direct URL load).
interface MindMapNodeProps {
  node: MapNode;
  depth: number;
  expandedNodes: Record<string, boolean>;
  onExpandedChange: (updater: (prev: Record<string, boolean>) => Record<string, boolean>) => void;
}

const MindMapNode = ({ node, depth, expandedNodes, onExpandedChange }: MindMapNodeProps) => {
  const isExpanded = Boolean(expandedNodes[node.id]);
  const hasChildren = Boolean(node.children && node.children.length > 0);

  const toggle = () => {
    if (!hasChildren) return;
    onExpandedChange((prev) => ({ ...prev, [node.id]: !prev[node.id] }));
  };

  return (
    <div className="relative animate-fade-in">
      {/* Node row */}
      <div className={`flex items-start gap-4 mb-4 ${depth > 0 ? 'ml-2 md:ml-8' : ''}`}>

        {/* Horizontal connector line */}
        {depth > 0 && (
          <div className="absolute left-0 top-6 w-8 h-px bg-champagne/40 -translate-x-full" />
        )}

        {/* Card */}
        <div
          onClick={toggle}
          className={[
            'relative z-10 flex-1 p-3 md:p-5 rounded-xl border transition-all duration-300 group',
            hasChildren
              ? 'cursor-pointer hover:border-champagne hover:shadow-lg hover:bg-white'
              : 'cursor-default bg-gray-50/50',
            isExpanded && hasChildren
              ? 'bg-white border-champagne shadow-md'
              : 'bg-white border-gray-200',
          ].join(' ')}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              {/* Icon */}
              {node.icon && (
                <div
                  className={[
                    'p-2 rounded-full flex items-center justify-center transition-colors shrink-0',
                    isExpanded
                      ? 'bg-champagne text-white'
                      : 'bg-gray-100 text-gray-500 group-hover:bg-champagne/20 group-hover:text-champagne',
                  ].join(' ')}
                >
                  {node.icon}
                </div>
              )}

              <div>
                <h4 className={`font-serif text-lg ${isExpanded ? 'text-obsidian' : 'text-gray-700'}`}>
                  {node.label}
                </h4>
                {node.description && (
                  <p className="text-sm text-gray-500 font-light mt-1 max-w-md">
                    {node.description}
                  </p>
                )}
              </div>
            </div>

            {/* Chevron */}
            {hasChildren && (
              <div
                className={`text-champagne transition-transform duration-300 shrink-0 ml-4 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              >
                <ChevronDown size={20} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className={`relative ${depth > 0 ? 'ml-2 md:ml-8' : ''}`}>
          {/* Vertical trunk line */}
          <div className="absolute left-8 top-0 bottom-8 w-px bg-champagne/30" />

          <div className="pl-2 md:pl-8 pt-2">
            {node.children!.map((child) => (
              <MindMapNode
                key={child.id}
                node={child}
                depth={depth + 1}
                expandedNodes={expandedNodes}
                onExpandedChange={onExpandedChange}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Page Component ─────────────────────────────────────────────────
interface RoadmapProps {
  onNavigate: (page: Page) => void;
  expandedNodes: Record<string, boolean>;
  onExpandedChange: (updater: (prev: Record<string, boolean>) => Record<string, boolean>) => void;
}

const Roadmap = ({ onNavigate, expandedNodes, onExpandedChange }: RoadmapProps) => {
  return (
    <div className="w-full pt-24 pb-24 min-h-screen relative">
      <SEO
        title="Licensing Roadmap"
        description="Interactive guide to California Real Estate and Insurance licensing requirements. Explore the steps from education to examination."
        keywords="CA license requirements, DRE roadmap, DOI roadmap, licensing steps, interactive guide"
      />

      <div className="max-w-5xl mx-auto px-6 md:px-12">

        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <p className="text-champagne uppercase tracking-widest text-sm font-semibold">
            Interactive Guide
          </p>
          <h1 className="font-serif text-5xl md:text-6xl text-obsidian">
            Licensing Roadmap
          </h1>
          <p className="text-gray-400 font-light max-w-xl mx-auto text-lg">
            Explore the specific requirements for your career path. Click on any
            section to expand the details and discover your next step.
          </p>
        </div>

        {/* Tree */}
        <div className="relative">
          {/* Start dot */}
          <div className="absolute left-8 top-0 w-4 h-4 rounded-full bg-champagne z-20 shadow-[0_0_15px_rgba(197,160,101,0.5)]" />

          <div className="pt-2">
            {roadmapData.map((node) => (
              <MindMapNode
                key={node.id}
                node={node}
                depth={0}
                expandedNodes={expandedNodes}
                onExpandedChange={onExpandedChange}
              />
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="mt-24 text-center bg-oxford text-white p-12 rounded-3xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <h3 className="font-serif text-3xl">Ready to start your journey?</h3>
            <p className="text-gray-400 font-light max-w-lg mx-auto">
              Now that you know the path, take the first step with Ameristar
              School's premier education packages.
            </p>
            <button
              onClick={() => onNavigate(Page.Courses)}
              className="inline-flex items-center gap-2 bg-champagne text-white px-8 py-3 rounded-full uppercase tracking-widest text-sm font-bold hover:bg-white hover:text-obsidian transition-all"
            >
              View Courses <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Roadmap;
