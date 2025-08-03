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
import { YouTubeCallback } from "./components/youtube-callback";
import { Toaster } from "./components/ui/toaster"
import { useSpotifyPlayer } from './components/spotify-web-player';
import { AuthProvider } from './contexts/AuthContext';
import { PlayerProvider } from './contexts/PlayerContext';
import { MusicPlayerProvider } from './contexts/MusicPlayerContext';

function App() {
  const { isReady, error } = useSpotifyPlayer();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [songSearchQuery, setSongSearchQuery] = useState('');
  const [isSearchingPlaylists, setIsSearchingPlaylists] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    if (isChatbotOpen) setIsChatbotOpen(false);
  };

  const toggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen);
    if (isChatOpen) setIsChatOpen(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setActiveSection('search'); // Switch to search results view
  };

  const handleSongRequest = (query: string, artist?: string) => {
    setSongSearchQuery(query);
    setActiveSection('song-results');
    setIsSearchingPlaylists(true);
    // TODO: Implement playlist search functionality
  };

  // Check if we're on the callback routes
  if (window.location.pathname === '/callback') {
    return <Callback />;
  }
  
  if (window.location.pathname === '/youtube-callback') {
    return <YouTubeCallback />;
  }

  return (
    <>
      <AuthProvider>
        <PlayerProvider>
          <MusicPlayerProvider>
            <div className="flex flex-col min-h-screen bg-background pb-24">
            {error && (
              <div className="fixed top-4 right-4 bg-destructive text-destructive-foreground p-4 rounded-md shadow-lg">
                {error}
              </div>
            )}
            <Header onSearch={handleSearch} />
            <div className="flex flex-1">
              <Sidebar 
                activeSection={activeSection} 
                onSectionChange={setActiveSection} 
              />
              <main className={`flex-1 overflow-y-auto transition-all duration-300 ${
                isChatOpen ? 'mr-64' : ''} ${isChatbotOpen ? 'mr-1/3' : ''
              }`}>
                {(activeSection === 'featured' || activeSection === 'search' || activeSection === 'song-results') && 
                  <MainContent 
                    searchQuery={activeSection === 'song-results' ? songSearchQuery : searchQuery} 
                    searchType={activeSection === 'song-results' ? 'song-request' : 'general'}
                    isSearchingPlaylists={isSearchingPlaylists}
                  />
                }
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
            <LyricChatbot 
              isOpen={isChatbotOpen} 
              onClose={() => setIsChatbotOpen(false)} 
              onSongRequest={handleSongRequest}
            />
            </div>
            <Toaster />
          </MusicPlayerProvider>
        </PlayerProvider>
      </AuthProvider>
    </>
  );
}

export default App;