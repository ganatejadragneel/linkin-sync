import React, { useState } from 'react';
import { Header } from "./components/header";
import { Sidebar } from "./components/sidebar";
import { MainContent } from "./components/main-content";
import { About } from "./components/about";
import { Artists } from "./components/artists";
import { Playlists } from "./components/playlists";
import { PlayerBar } from "./components/player-bar";
import { ChatOptions } from "./components/chat-options";
import { GlobalChat } from "./components/global-chat";
import { LyricChatbot } from "./components/lyric-chatbot";
import { Callback } from "./components/callback";
import { Toaster } from "./components/ui/toaster"

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('featured');

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    if (isChatbotOpen) setIsChatbotOpen(false);
  };

  const toggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen);
    if (isChatOpen) setIsChatOpen(false);
  };

  // Check if we're on the callback route
  if (window.location.pathname === '/callback') {
    return <Callback />;
  }

  return (
    <>
      <div className="flex flex-col min-h-screen bg-background pb-24">
        <Header />
        <div className="flex flex-1">
          <Sidebar 
            activeSection={activeSection} 
            onSectionChange={setActiveSection} 
          />
          <main className={`flex-1 overflow-y-auto transition-all duration-300 ${
            isChatOpen ? 'mr-64' : ''} ${isChatbotOpen ? 'mr-1/3' : ''
          }`}>
            {activeSection === 'featured' && <MainContent />}
            {activeSection === 'about' && <About />}
            {activeSection === 'artists' && <Artists />}
            {activeSection === 'playlists' && <Playlists />}
          </main>
        </div>
        <ChatOptions 
          onToggleChat={toggleChat}
          onToggleChatbot={toggleChatbot}
          isChatOpen={isChatOpen}
          isChatbotOpen={isChatbotOpen}
        />
        <PlayerBar />
        <GlobalChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        <LyricChatbot isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />
      </div>
      <Toaster />
    </>
  );
}

export default App;