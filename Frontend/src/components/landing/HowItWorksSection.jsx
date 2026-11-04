import React from 'react';
import { Layers, FolderGit2, Kanban, Rocket } from 'lucide-react';
import Card from '../common/Card';

export function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      title: 'Create a Workspace',
      description: 'Set up your organization, configure visibility, and invite team members with specific roles.',
      icon: Layers
    },
    {
      number: '02',
      title: 'Structure Projects',
      description: 'Define projects and services with custom prefixes and auto-incrementing sequential issue IDs.',
      icon: FolderGit2
    },
    {
      number: '03',
      title: 'Plan Sprint Backlogs',
      description: 'Prioritize tasks, estimate story points, and commit issues to focused two-week agile iterations.',
      icon: Kanban
    },
    {
      number: '04',
      title: 'Execute & Ship',
      description: 'Track daily progress on the board, monitor sprint burndown charts, and complete iterations on time.',
      icon: Rocket
    }
  ];

  return (
    <section id="workflow" className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-10">
      {/* Section Header */}
      <div className="space-y-2 text-center max-w-2xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-semibold text-[#252525] dark:text-[#F2F2F2] tracking-tight my-0">
          How DevSpace powers your workflow
        </h2>
        <p className="text-xs sm:text-sm text-[#777777] dark:text-[#A0A0A0] leading-relaxed">
          From initial setup to deployment, keep every developer, task, and sprint aligned in four straightforward steps.
        </p>
      </div>

      {/* 4 Steps Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <Card
              key={step.number}
              hoverable={true}
              className="p-4 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-[#999999] dark:text-[#777777]">
                    STEP {step.number}
                  </span>
                  <div className="w-7 h-7 rounded-md bg-[#F1F1EF] dark:bg-[#2A2A2A] border border-[#E8E8E5] dark:border-[#353535] flex items-center justify-center text-[#252525] dark:text-[#F2F2F2]">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-[#252525] dark:text-[#F2F2F2] my-0">
                    {step.title}
                  </h3>
                  <p className="text-xs text-[#777777] dark:text-[#A0A0A0] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

export default HowItWorksSection;
