import { useState } from 'react';
import { MediaProvider } from '@media-sdk/react';
import { Logo } from './components/Logo';
import { ActivityLog } from './components/ActivityLog';
import { PhotoGridView } from './components/PhotoGridView';
import { VideoReelView } from './components/VideoReelView';

export default function App() {
  // api key from env or fallback
  const apiKey = import.meta.env.VITE_PEXELS_API_KEY || 'demo_key';

  // search input state
  const [inputQuery, setInputQuery] = useState('nature');
  const [activeQuery, setActiveQuery] = useState('nature');
  const [viewMode, setViewMode] = useState<'photos' | 'videos'>('photos');

  // form submit handler
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputQuery.trim()) {
      setActiveQuery(inputQuery.trim());
    }
  };

  return (
    <MediaProvider apiKey={apiKey}>
      <div className="app-container">
        {/* app header */}
        <header className="app-header">
          <div className="header-title-row">
            <Logo />

            <div className="search-and-nav">
              {/* search input form */}
              <form onSubmit={handleSearchSubmit} className="search-form">
                <input
                  type="text"
                  className="search-input"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="Search photos & videos..."
                />
                <button type="submit" className="search-btn">
                  Search
                </button>
              </form>

              {/* photo grid / video reel view toggle */}
              <div className="view-toggle">
                <button
                  type="button"
                  className={`toggle-btn ${viewMode === 'photos' ? 'active' : ''}`}
                  onClick={() => setViewMode('photos')}
                >
                  🖼️ Photos (Grid)
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${viewMode === 'videos' ? 'active' : ''}`}
                  onClick={() => setViewMode('videos')}
                >
                  🎥 Videos (Reel)
                </button>
              </div>
            </div>
          </div>

          {/* activity event tracker bar */}
          <ActivityLog />
        </header>

        {/* content views */}
        <main style={{ flex: 1 }}>
          {viewMode === 'photos' ? (
            <PhotoGridView query={activeQuery} />
          ) : (
            <VideoReelView query={activeQuery} />
          )}
        </main>
      </div>
    </MediaProvider>
  );
}
