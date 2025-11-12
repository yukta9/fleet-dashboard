import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import RightPanel from './RightPanel';
import PlaybackBar from './PlaybackBar';

export default function Layout() {
  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Header */}
      <Header />

      {/* Main Grid */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <MainContent />

        {/* Right Panel */}
        <RightPanel />
      </div>

      {/* Playback Controls */}
      <PlaybackBar />
    </div>
  );
}
