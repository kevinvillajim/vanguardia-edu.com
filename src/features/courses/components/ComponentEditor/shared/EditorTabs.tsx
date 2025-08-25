import React from 'react';
import { Settings } from 'lucide-react';

export type TabType = 'content' | 'settings';

interface Tab {
  id: TabType;
  label: string;
  icon?: React.ReactNode;
}

interface EditorTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  tabs?: Tab[];
}

const DEFAULT_TABS: Tab[] = [
  { id: 'content', label: 'Contenido' },
  { id: 'settings', label: 'Diseño', icon: <Settings className="w-4 h-4 inline mr-2" /> }
];

export const EditorTabs: React.FC<EditorTabsProps> = ({
  activeTab,
  onTabChange,
  tabs = DEFAULT_TABS
}) => {
  return (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === tab.id
              ? 'bg-white text-primary-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
};