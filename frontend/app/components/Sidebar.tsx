'use client';

import React, { useState } from 'react';
import { 
  LayoutDashboard,
  CircleAlert,
  Bot,
  BarChart3,
  ScrollText,
  FileSearch,
  Network,
  Upload,
  ShieldCheck,
  RotateCcw,
  Compass,
  FileText,
  ChevronDown,
  Route,
  Settings,
  BookOpen,
  X,
  Check,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onResetDemo: () => void;
  onStartGuidedDemo: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  exceptionCount?: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const ENTITIES = [
  { id: 'northstar', name: 'Northstar Labs Inc.', cycle: 'Sep Close · Active', flag: 'US-GAAP' },
  { id: 'horizon', name: 'Horizon FinTech UK', cycle: 'Q3 Close · Mirror', flag: 'IFRS-15' },
  { id: 'apex', name: 'Apex Global EMEA', cycle: 'Oct Close · Sandbox', flag: 'Dual-Audit' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  onResetDemo,
  onStartGuidedDemo,
  onOpenSettings,
  onOpenHelp,
  exceptionCount = 7,
  isOpenMobile,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const [isEntityMenuOpen, setIsEntityMenuOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState(ENTITIES[0]);

  const mainNavigation = [
    { id: 'command-center', label: 'Overview', icon: LayoutDashboard },
    { id: 'exceptions', label: 'Exceptions', icon: CircleAlert, badge: exceptionCount },
    { id: 'agent-lab', label: 'Agent Lab', icon: Bot },
    { id: 'evaluations', label: 'Evaluations', icon: BarChart3 },
    { id: 'policies', label: 'Policies', icon: ScrollText },
    { id: 'audit-vault', label: 'Audit', icon: FileSearch },
    { id: 'architecture', label: 'Architecture', icon: Network },
    { id: 'try-data', label: 'Try Your Data', icon: Upload },
  ];

  const secondaryNavigation = [
    { id: 'decision-trace', label: 'Decision Trace', icon: Route },
    { id: 'built-with-ao', label: 'AO Engine', icon: ShieldCheck },
    { id: 'landing', label: 'Product Story', icon: FileText },
  ];

  const renderContent = (isDrawer = false) => {
    const showLabels = !isCollapsed || isDrawer;

    return (
      <div className="flex flex-col h-full bg-bg-secondary select-none">
        
        {/* Top Section: Brand & Workspace */}
        <div className="shrink-0 border-b border-border-subtle">
          
          {/* Logo Bar */}
          <div className={`px-4 py-4 flex items-center ${isCollapsed && !isDrawer ? 'justify-center' : 'justify-between'}`}>
            <button
              onClick={() => {
                setCurrentTab('command-center');
                if (isDrawer) onCloseMobile();
              }}
              className="flex items-center space-x-2.5 text-left group focus-visible:outline-none"
              title="LedgerProof Overview"
            >
              <div className="w-7 h-7 rounded bg-text-primary text-white flex items-center justify-center font-serif text-sm font-semibold tracking-tight shrink-0 transition-transform group-hover:scale-105">
                L
              </div>
              {showLabels && (
                <div className="flex items-baseline space-x-1.5 truncate">
                  <span className="font-serif text-lg tracking-tight text-text-primary font-semibold truncate">
                    LedgerProof
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted shrink-0">
                    v2.4
                  </span>
                </div>
              )}
            </button>

            {/* Mobile close button */}
            {isDrawer && (
              <button
                onClick={onCloseMobile}
                className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-black/5"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* Tablet/Desktop collapse toggle */}
            {!isDrawer && onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="hidden lg:flex p-1 rounded text-text-muted hover:text-text-primary hover:bg-black/5 transition-colors"
                title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            )}
          </div>

          {/* Company / Workspace Switcher */}
          {showLabels ? (
            <div className="px-3 pb-3 relative">
              <button
                onClick={() => setIsEntityMenuOpen(!isEntityMenuOpen)}
                className="w-full p-2 rounded-lg bg-bg-card border border-border-subtle hover:border-text-secondary/30 transition-all flex items-center justify-between text-left group shadow-subtle"
              >
                <div className="flex items-center space-x-2 truncate">
                  <div className="w-5 h-5 rounded bg-accent-light text-accent flex items-center justify-center font-bold text-[10px] shrink-0">
                    NL
                  </div>
                  <div className="truncate">
                    <div className="font-medium text-xs text-text-primary truncate group-hover:text-accent transition-colors">
                      {selectedEntity.name}
                    </div>
                    <div className="text-[10px] text-text-muted truncate">
                      {selectedEntity.cycle}
                    </div>
                  </div>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-text-muted shrink-0 ml-1 transition-transform duration-150 ${isEntityMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Entity Selector Dropdown */}
              {isEntityMenuOpen && (
                <div className="absolute left-3 right-3 mt-1.5 bg-white border border-border-subtle rounded-xl shadow-modal z-50 py-1 divide-y divide-border-subtle/50 animate-fade-in">
                  <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                    Switch Active Ledger
                  </div>
                  <div className="py-0.5">
                    {ENTITIES.map((ent) => {
                      const isSelected = selectedEntity.id === ent.id;
                      return (
                        <button
                          key={ent.id}
                          onClick={() => {
                            setSelectedEntity(ent);
                            setIsEntityMenuOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-bg-subtle transition-colors text-xs ${
                            isSelected ? 'bg-bg-subtle/70 font-semibold text-text-primary' : 'text-text-secondary'
                          }`}
                        >
                          <div className="truncate pr-2">
                            <div className="truncate">{ent.name}</div>
                            <div className="text-[10px] text-text-muted font-normal">{ent.cycle}</div>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-accent shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="px-2 pb-3 flex justify-center">
              <button
                onClick={() => onToggleCollapse && onToggleCollapse()}
                className="w-8 h-8 rounded-lg bg-bg-card border border-border-subtle flex items-center justify-center font-bold text-[10px] text-accent hover:border-accent shadow-subtle"
                title={`${selectedEntity.name} (${selectedEntity.cycle})`}
              >
                NL
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Middle Navigation */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4 text-xs">
          
          {/* Main Navigation */}
          <div className="space-y-0.5">
            {showLabels && (
              <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                Platform
              </div>
            )}
            {mainNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    if (isDrawer) onCloseMobile();
                  }}
                  title={!showLabels ? item.label : undefined}
                  className={`w-full flex items-center ${
                    showLabels ? 'justify-between px-2.5 py-1.5' : 'justify-center p-2'
                  } rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-bg-subtle text-text-primary font-semibold shadow-subtle border-l-2 border-accent'
                      : 'text-text-secondary hover:text-text-primary hover:bg-black/[0.03]'
                  }`}
                >
                  <span className={`flex items-center ${showLabels ? 'space-x-2.5' : ''} truncate`}>
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-accent' : 'text-text-secondary'}`} />
                    {showLabels && <span className="truncate">{item.label}</span>}
                  </span>

                  {showLabels && item.badge !== undefined && item.badge > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold shrink-0 ${
                      isActive 
                        ? 'bg-status-reviewBg text-status-review' 
                        : 'bg-black/5 text-text-secondary'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Secondary Inspection Section */}
          <div className="space-y-0.5 pt-1 border-t border-border-subtle/50">
            {showLabels && (
              <div className="px-2 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                Telemetry & System
              </div>
            )}
            {secondaryNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    if (isDrawer) onCloseMobile();
                  }}
                  title={!showLabels ? item.label : undefined}
                  className={`w-full flex items-center ${
                    showLabels ? 'justify-start space-x-2.5 px-2.5 py-1.5' : 'justify-center p-2'
                  } rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-bg-subtle text-text-primary font-semibold shadow-subtle border-l-2 border-accent'
                      : 'text-text-secondary hover:text-text-primary hover:bg-black/[0.03]'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-accent' : 'text-text-secondary'}`} />
                  {showLabels && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </div>

          {/* Support / Secondary Controls */}
          <div className="space-y-0.5 pt-1 border-t border-border-subtle/50">
            {showLabels && (
              <div className="px-2 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                Support
              </div>
            )}
            
            {/* Guided Tour Trigger */}
            <button
              onClick={() => {
                onStartGuidedDemo();
                if (isDrawer) onCloseMobile();
              }}
              title={!showLabels ? 'Guided Tour' : undefined}
              className={`w-full flex items-center ${
                showLabels ? 'space-x-2.5 px-2.5 py-1.5' : 'justify-center p-2'
              } rounded-md text-xs font-medium text-accent hover:bg-accent-light/60 transition-colors`}
            >
              <Compass className="w-4 h-4 text-accent shrink-0" />
              {showLabels && <span>Guided Demo Flow</span>}
            </button>

            {/* Settings Trigger */}
            <button
              onClick={() => {
                onOpenSettings();
                if (isDrawer) onCloseMobile();
              }}
              title={!showLabels ? 'Settings' : undefined}
              className={`w-full flex items-center ${
                showLabels ? 'space-x-2.5 px-2.5 py-1.5' : 'justify-center p-2'
              } rounded-md text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-black/[0.03] transition-colors`}
            >
              <Settings className="w-4 h-4 text-text-secondary shrink-0" />
              {showLabels && <span>Settings</span>}
            </button>

            {/* Help / Docs Trigger */}
            <button
              onClick={() => {
                onOpenHelp();
                if (isDrawer) onCloseMobile();
              }}
              title={!showLabels ? 'Documentation' : undefined}
              className={`w-full flex items-center ${
                showLabels ? 'space-x-2.5 px-2.5 py-1.5' : 'justify-center p-2'
              } rounded-md text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-black/[0.03] transition-colors`}
            >
              <BookOpen className="w-4 h-4 text-text-secondary shrink-0" />
              {showLabels && <span>Help & Docs</span>}
            </button>
          </div>

        </div>

        {/* Bottom Section: Velocity Mini-Widget, Reset Demo, and User Profile */}
        <div className="shrink-0 p-2.5 border-t border-border-subtle bg-bg-secondary space-y-2 text-xs">
          
          {/* Close Velocity Mini Widget */}
          {showLabels ? (
            <div className="p-2.5 rounded-lg bg-bg-card border border-border-subtle space-y-1.5 font-tabular shadow-subtle">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-text-muted">Close Velocity</span>
                <span className="font-semibold text-status-verified">97.4%</span>
              </div>
              <div className="w-full bg-black/5 h-1.5 rounded-full overflow-hidden">
                <div className="bg-status-verified h-full w-[97.4%] transition-all duration-500" />
              </div>
              <div className="flex items-center justify-between text-[10px] text-text-muted pt-0.5">
                <span>4,082 / 4,128 Rec.</span>
                <button
                  onClick={onResetDemo}
                  title="Reset Demo Dataset"
                  className="text-text-secondary hover:text-text-primary flex items-center space-x-0.5 transition-colors font-medium"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={onResetDemo}
                title="Reset Demo Dataset (97.4% reconciled)"
                className="p-1.5 rounded-md hover:bg-black/5 text-text-muted hover:text-text-primary transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* User Profile Section */}
          <div className={`flex items-center ${showLabels ? 'justify-between px-1 py-1' : 'justify-center p-1'} rounded-md hover:bg-black/[0.03] transition-colors cursor-default`}>
            <div className="flex items-center space-x-2 truncate">
              <div className="w-6 h-6 rounded bg-text-primary text-white flex items-center justify-center font-mono font-bold text-[10px] shrink-0 shadow-subtle">
                MV
              </div>
              {showLabels && (
                <div className="truncate">
                  <div className="font-medium text-text-primary text-[11px] truncate">Marcus Vance</div>
                  <div className="text-[10px] text-text-muted truncate">Controller &bull; Admin</div>
                </div>
              )}
            </div>
            {showLabels && (
              <span 
                className="w-2 h-2 rounded-full bg-status-verified shrink-0 ml-1.5" 
                title="Active Connection & Verified Session" 
              />
            )}
          </div>

        </div>

      </div>
    );
  };

  return (
    <>
      {/* Desktop / Tablet Sidebar */}
      <aside 
        className={`hidden md:block shrink-0 h-screen sticky top-0 z-30 border-r border-border-subtle transition-[width] duration-200 ease-in-out ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {renderContent(false)}
      </aside>

      {/* Mobile Slide-out Drawer */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs md:hidden animate-fade-in"
          onClick={onCloseMobile}
        >
          <div 
            className="w-72 h-full max-w-[85vw] shadow-modal animate-fade-in border-r border-border-subtle"
            onClick={(e) => e.stopPropagation()}
          >
            {renderContent(true)}
          </div>
        </div>
      )}
    </>
  );
};
