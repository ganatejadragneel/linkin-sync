import React, { useState } from 'react';
import { Header } from "./components/header";
import { Sidebar } from "./components/sidebar";
import { MainContent } from "./components/main-content";
import { PlayerBar } from "./components/player-bar";
import { ChatOptions } from "./components/chat-options";
import { GlobalChat } from "./components/global-chat";
import { LyricChatbot } from "./components/lyric-chatbot";

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    if (isChatbotOpen) setIsChatbotOpen(false);
  };

  const toggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen);
    if (isChatOpen) setIsChatOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 pb-24">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className={`flex-1 overflow-y-auto transition-all duration-300 ${isChatOpen ? 'mr-80' : ''} ${isChatbotOpen ? 'mr-1/2' : ''}`}>
          <MainContent />
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
  );
}

export default App;