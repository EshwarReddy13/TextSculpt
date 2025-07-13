'use client';

import React, { useState } from 'react';
import { 
  TextBolder, TextItalic, TextUnderline, ListBullets, ListNumbers, 
  Code, Image, Link, CaretUp, CaretDown 
} from 'phosphor-react';

const ToolbarButton = ({ icon: Icon, label }: { icon: React.ElementType; label: string }) => (
  <button
    className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
    aria-label={label}
    title={label}
  >
    <Icon size={20} className="text-gray-700 dark:text-gray-200" />
  </button>
);

export const EditorToolbar = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className={`flex items-center transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-40' : 'max-h-0 overflow-hidden'}`}>
        <div className="flex items-center p-2 flex-wrap">
          {/* Placeholder formatting buttons */}
          <ToolbarButton icon={TextBolder} label="Bold" />
          <ToolbarButton icon={TextItalic} label="Italic" />
          <ToolbarButton icon={TextUnderline} label="Underline" />
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-600 mx-2"></div>
          <ToolbarButton icon={ListBullets} label="Bulleted List" />
          <ToolbarButton icon={ListNumbers} label="Numbered List" />
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-600 mx-2"></div>
          <ToolbarButton icon={Link} label="Insert Link" />
          <ToolbarButton icon={Image} label="Insert Image" />
          <ToolbarButton icon={Code} label="Code Block" />
        </div>
      </div>
      <div className="flex justify-center">
        <button 
          onClick={() => setIsExpanded(!isExpanded)} 
          className="w-full py-1 text-center hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          aria-label={isExpanded ? 'Collapse toolbar' : 'Expand toolbar'}
        >
          {isExpanded 
            ? <CaretUp size={16} className="mx-auto text-gray-500 dark:text-gray-400" /> 
            : <CaretDown size={16} className="mx-auto text-gray-500 dark:text-gray-400" />}
        </button>
      </div>
    </div>
  );
}; 