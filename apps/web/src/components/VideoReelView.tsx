import { useVideoSearch, useMediaTracking } from '@media-sdk/react';
import { useReelSwiper, type MediaItem } from '@media-sdk/ui-react';

interface VideoReelViewProps {
  query: string;
}

// vertical video reel component
export function VideoReelView({ query }: VideoReelViewProps) {
  const { data: videos, loading, error } = useVideoSearch({
    query,
    per_page: 10,
  });
  const { trackView, trackDownload } = useMediaTracking();

  // map video objects to media items
  const items: MediaItem[] = (videos || []).map((v) => {
    const file = v.video_files.find((f) => f.file_type === 'video/mp4') || v.video_files[0];
    return {
      id: v.id,
      src: v.image,
      type: 'video',
      videoSrc: file?.link,
      alt: `Video by ${v.user?.name || 'Pexels user'} (${v.duration}s)`,
    };
  });

  const reel = useReelSwiper({
    items,
    onActiveChange: (_index, item) => {
      if (item) {
        trackView(item.id);
      }
    },
  });

  return (
    <div className="video-reel-view">
      {/* error message */}
      {error && (
        <div className="error-banner">
          ⚠️ <strong>Error [{error.kind}]:</strong> {error.message}
        </div>
      )}

      {/* empty message */}
      {!loading && !error && items.length === 0 && (
        <div className="empty-state">
          🎬 No videos found for &quot;{query}&quot;. Try searching for &quot;nature&quot; or &quot;ocean&quot;.
        </div>
      )}

      {/* loading spinner */}
      {loading && items.length === 0 && (
        <div className="loading-spinner-container">
          <div className="spinner"></div>
          <span>Loading video reel...</span>
        </div>
      )}

      {/* vertical scroll container */}
      {items.length > 0 && (
        <div {...reel.getContainerProps({ className: 'reel-container' })}>
          {items.map((item, index) => {
            const isActive = reel.activeIndex === index;
            return (
              <div
                key={item.id}
                {...reel.getItemProps(item, index, {
                  className: `reel-slide ${isActive ? 'active-slide' : ''}`,
                })}
              >
                {item.videoSrc ? (
                  <video
                    src={item.videoSrc}
                    poster={item.src}
                    autoPlay={isActive}
                    controls
                    loop
                    muted
                    playsInline
                    className="reel-video"
                  />
                ) : (
                  <img src={item.src} alt={item.alt} className="reel-poster" />
                )}

                <div className="reel-info-overlay">
                  <p className="reel-title">{item.alt}</p>
                  <div className="reel-actions">
                    <span className="reel-index-badge">
                      {index + 1} / {items.length}
                    </span>
                    <button
                      type="button"
                      className="reel-download-btn"
                      onClick={() => {
                        trackDownload(item.id);
                        if (item.videoSrc) window.open(item.videoSrc, '_blank');
                      }}
                    >
                      📥 Save Video
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
