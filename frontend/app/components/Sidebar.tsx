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
  ChevronRight,
  Database,
  Activity,
  Layers,
  Building2,
  Plus,
  Scale,
  LogOut,
  User,
  SlidersHorizontal
} from 'lucide-react';
import { store } from '../lib/store';
import { CURRENCY_REGISTRY } from '../lib/money';
import { ConfirmModal } from './ConfirmModal';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onResetDemo: () => void;
  onStartGuidedDemo: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onOpenWorkspaceModal?: () => void;
  onLogout?: () => void;
  exceptionCount?: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  onResetDemo,
  onStartGuidedDemo,
  onOpenSettings,
  onOpenHelp,
  onOpenWorkspaceModal,
  onLogout,
  exceptionCount = 0,
  isOpenMobile,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const activeWs = store.getActiveWorkspace();
  const workspaces = store.getWorkspaces();
  const currencyMeta = CURRENCY_REGISTRY[activeWs.reportingCurrency] || CURRENCY_REGISTRY.USD;

  interface NavItem {
    id: string;
    label: string;
    icon: any;
    badge?: number;
  }

  interface NavSection {
    title: string;
    items: NavItem[];
  }

  // Nav categories matching Requirement 18 & Reference 5
  const navSections: NavSection[] = [
    {
      title: 'WORKSPACE',
      items: [
        { id: 'command-center', label: 'Overview', icon: LayoutDashboard },
        { id: 'control-plane', label: 'Control Plane', icon: Layers },
        { id: 'data-sources', label: 'Data Sources', icon: Database },
        { id: 'transactions', label: 'Transactions', icon: FileText },
        { id: 'reconciliation', label: 'Reconciliation', icon: Scale },
        { id: 'exceptions', label: 'Exceptions', icon: CircleAlert, badge: exceptionCount },
      ]
    },
    {
      title: 'INTELLIGENCE',
      items: [
        { id: 'agent-lab', label: 'Agent Lab', icon: Bot },
        { id: 'evaluations', label: 'Evaluations', icon: BarChart3 },
        { id: 'policies', label: 'Policies', icon: ScrollText },
      ]
    },
    {
      title: 'GOVERNANCE',
      items: [
        { id: 'audit-vault', label: 'Audit Vault', icon: FileSearch },
        { id: 'reports', label: 'Reports', icon: FileSpreadsheetIcon },
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'architecture', label: 'Architecture', icon: Network },
        { id: 'observability', label: 'Observability', icon: Activity },
      ]
    }
  ];

  const handleSelectWorkspace = (id: string) => {
    store.setActiveWorkspace(id);
    setIsWorkspaceMenuOpen(false);
  };

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    if (onLogout) {
      onLogout();
    } else {
      setCurrentTab('landing');
    }
  };

  const renderContent = (isDrawer = false) => {
    const showLabels = !isCollapsed || isDrawer;

    return (
      <div className="flex flex-col h-full bg-white border-r border-border-subtle select-none">
        
        {/* Top Section: Brand & Workspace */}
        <div className="shrink-0 border-b border-border-subtle">
          
          {/* Brand Mark */}
          <div className={`px-4 py-4 flex items-center ${isCollapsed && !isDrawer ? 'justify-center' : 'justify-between'}`}>
            <button
              onClick={() => {
                setCurrentTab('command-center');
                if (isDrawer) onCloseMobile();
              }}
              className="flex items-center space-x-2.5 text-left group focus-visible:outline-none"
              title="LedgerProof Overview"
            >
              <div className="w-8 h-8 rounded-lg bg-[#0E332E] p-1.5 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-sm">
                <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
                  <path d="M12 14H30C32.2 14 34 15.8 34 18V18" stroke="#DDF7EE" strokeWidth="3.5" strokeLinecap="round"/>
                  <path d="M14 14V34C14 35.1 14.9 36 16 36H36" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 21V29C21 30.1 21.9 31 23 31H34" stroke="#818CF8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M28 16L32 20L40 12" stroke="#10B981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
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

          {/* Dynamic Active Workspace Switcher (Requirement 1, 2, 4) */}
          {showLabels ? (
            <div className="px-3 pb-3 relative">
              <button
                onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
                className="w-full p-2 rounded-xl bg-bg-primary border border-border-subtle hover:border-text-secondary/40 transition-all flex items-center justify-between text-left group shadow-subtle"
              >
                <div className="flex items-center space-x-2 truncate">
                  <div className="w-6 h-6 rounded-lg bg-pastel-mint border border-pastel-mintBorder flex items-center justify-center text-xs shrink-0 font-medium">
                    {currencyMeta.flag}
                  </div>
                  <div className="truncate">
                    <div className="font-semibold text-xs text-text-primary truncate">
                      {activeWs.name}
                    </div>
                    <div className="text-[10px] text-text-muted truncate">
                      {activeWs.reportingCurrency} &bull; {activeWs.closePeriod}
                    </div>
                  </div>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-text-muted shrink-0 ml-1 transition-transform duration-150 ${isWorkspaceMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Workspace Selector Dropdown */}
              {isWorkspaceMenuOpen && (
                <div className="absolute left-3 right-3 mt-1.5 bg-white border border-border-subtle rounded-2xl shadow-modal z-50 py-1.5 divide-y divide-border-subtle/50 animate-fade-in">
                  <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                    Switch Workspace ({workspaces.length})
                  </div>
                  
                  <div className="py-1 max-h-48 overflow-y-auto">
                    {workspaces.map((ws) => {
                      const isSelected = activeWs.id === ws.id;
                      const cMeta = CURRENCY_REGISTRY[ws.reportingCurrency] || CURRENCY_REGISTRY.USD;
                      return (
                        <button
                          key={ws.id}
                          onClick={() => handleSelectWorkspace(ws.id)}
                          className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-bg-subtle transition-colors text-xs ${
                            isSelected ? 'bg-pastel-mint/40 font-semibold text-text-primary' : 'text-text-secondary'
                          }`}
                        >
                          <div className="truncate pr-2">
                            <div className="flex items-center space-x-1.5 truncate">
                              <span>{cMeta.flag}</span>
                              <span className="truncate">{ws.name}</span>
                            </div>
                            <div className="text-[10px] text-text-muted font-normal">
                              {ws.reportingCurrency} &bull; {ws.closePeriod}
                            </div>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-800 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Trigger to open full Workspace Modal */}
                  <div className="pt-1 px-1">
                    <button
                      onClick={() => {
                        setIsWorkspaceMenuOpen(false);
                        onOpenWorkspaceModal?.();
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold text-text-primary hover:bg-bg-primary flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-700" />
                      <span>+ Create / Manage Workspaces</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="px-2 pb-3 flex justify-center">
              <button
                onClick={() => onOpenWorkspaceModal?.()}
                className="w-8 h-8 rounded-lg bg-pastel-mint border border-pastel-mintBorder flex items-center justify-center text-xs shadow-subtle"
                title={`${activeWs.name} (${activeWs.reportingCurrency})`}
              >
                {currencyMeta.flag}
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Navigation Groups (Matching Reference 5 pill style) */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 text-xs">
          {navSections.map((sec) => (
            <div key={sec.title} className="space-y-1">
              {showLabels && (
                <div className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  {sec.title}
                </div>
              )}

              {sec.items.map((item) => {
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
                      showLabels ? 'justify-between px-3 py-2' : 'justify-center p-2.5'
                    } rounded-xl text-xs transition-all ${
                      isActive
                        ? 'bg-[#0E332E] text-white font-semibold shadow-card'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-primary font-medium'
                    }`}
                  >
                    <span className={`flex items-center ${showLabels ? 'space-x-2.5' : ''} truncate`}>
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-pastel-mint' : 'text-text-muted'}`} />
                      {showLabels && <span className="truncate">{item.label}</span>}
                    </span>

                    {showLabels && item.badge !== undefined && item.badge > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold shrink-0 ${
                        isActive 
                          ? 'bg-pastel-pink text-status-blocked' 
                          : 'bg-pastel-pink text-status-blocked border border-pastel-pinkBorder'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom Section: User Profile & Real Logout (Requirement 20 & Reference 5) */}
        <div className="shrink-0 p-3 border-t border-border-subtle bg-bg-primary/60">
          {showLabels ? (
            <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-border-subtle shadow-subtle">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-7 h-7 rounded-full bg-pastel-mint text-text-primary font-bold text-xs flex items-center justify-center shrink-0 border border-pastel-mintBorder">
                  BS
                </div>
                <div className="truncate">
                  <div className="text-xs font-semibold text-text-primary truncate">Budiono Siregar</div>
                  <div className="text-[10px] text-text-muted truncate">Financial Controller</div>
                </div>
              </div>

              <button
                onClick={() => setIsLogoutModalOpen(true)}
                className="p-1.5 rounded-lg text-text-muted hover:text-status-blocked hover:bg-pastel-pink/50 transition-colors"
                title="Log out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={() => setIsLogoutModalOpen(true)}
                className="w-8 h-8 rounded-full bg-white border border-border-subtle flex items-center justify-center text-text-muted hover:text-status-blocked shadow-subtle"
                title="Log out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Real Logout Confirmation Modal */}
        <ConfirmModal
          isOpen={isLogoutModalOpen}
          title="Log out of LedgerProof?"
          description="You will be returned to the product landing page. Your workspace data, transactions, and audit logs remain safely saved in local storage."
          confirmLabel="Log Out"
          isDestructive={false}
          onConfirm={handleConfirmLogout}
          onCancel={() => setIsLogoutModalOpen(false)}
        />

      </div>
    );
  };

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside 
        className={`hidden md:block shrink-0 transition-all duration-200 z-30 h-screen sticky top-0 ${
          isCollapsed ? 'w-16' : 'w-60 lg:w-64'
        }`}
      >
        {renderContent(false)}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-fade-in">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-modal z-10">
            {renderContent(true)}
          </div>
        </div>
      )}
    </>
  );
};

function FileSpreadsheetIcon(props: any) {
  return <FileText {...props} />;
}
