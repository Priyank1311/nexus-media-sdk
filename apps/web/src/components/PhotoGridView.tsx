import { usePhotoSearch, useMediaTracking } from '@media-sdk/react';
import { useGrid, useLightbox, type MediaItem } from '@media-sdk/ui-react';

interface PhotoGridViewProps {
  query: string;
}

// photo grid view with lightbox integration
export function PhotoGridView({ query }: PhotoGridViewProps) {
  const { data: photos, loading, error, loadMore, hasMore } = usePhotoSearch({
    query,
    per_page: 18,
  });
  const { trackView, trackDownload } = useMediaTracking();

  // map photo list items to media item shape
  const items: MediaItem[] = (photos || []).map((p) => ({
    id: p.id,
    src: p.src.large2x || p.src.large || p.src.medium,
    alt: p.alt || `Photo by ${p.photographer}`,
    width: p.width,
    height: p.height,
  }));

  const grid = useGrid({
    items,
    hasMore,
    loading,
    onLoadMore: loadMore,
  });

  const lightbox = useLightbox({
    items,
  });

  return (
    <div className="photo-grid-view">
      {/* error alert */}
      {error && (
        <div className="error-banner">
          ⚠️ <strong>Error [{error.kind}]:</strong> {error.message}
          {error.kind === 'RATE_LIMIT' && (
            <p className="error-subtext">
              Pexels free tier limit hit (200 requests/hr). Please provide a valid VITE_PEXELS_API_KEY.
            </p>
          )}
        </div>
      )}

      {/* empty message */}
      {!loading && !error && items.length === 0 && (
        <div className="empty-state">
          🔍 No photos found for &quot;{query}&quot;. Try searching for something else.
        </div>
      )}

      {/* photo grid */}
      <div {...grid.getGridProps({ className: 'media-grid' })}>
        {grid.items.map((item, index) => {
          const rawPhoto = photos?.find((p) => p.id === item.id);
          return (
            <div
              key={item.id}
              {...grid.getItemProps(item, index, {
                className: 'grid-card',
              })}
            >
              <div
                {...lightbox.getTriggerProps(index, {
                  className: 'img-wrapper',
                  onClick: () => {
                    trackView(item.id);
                  },
                })}
              >
                <img src={item.src} alt={item.alt} loading="lazy" />
                <div className="card-overlay">
                  <span className="zoom-hint">🔍 Expand</span>
                  {rawPhoto && <span className="author-tag">📷 {rawPhoto.photographer}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* loading indicator */}
      {loading && (
        <div className="loading-spinner-container">
          <div className="spinner"></div>
          <span>Loading photos...</span>
        </div>
      )}

      {/* scroll sentinel */}
      {grid.hasMore && <div {...grid.getLoadMoreTriggerProps({ className: 'sentinel-box' })} />}

      {/* lightbox popup modal */}
      {lightbox.isOpen && lightbox.currentItem && (
        <div {...lightbox.getOverlayProps({ className: 'lightbox-overlay' })}>
          <div className="lightbox-content">
            <button {...lightbox.getCloseButtonProps({ className: 'lightbox-close-btn' })}>
              ✕
            </button>

            {lightbox.hasPrev && (
              <button {...lightbox.getNextProps({ className: 'lightbox-nav-btn prev-btn' })}>
                ‹
              </button>
            )}

            <div className="lightbox-media-container">
              <img
                src={lightbox.currentItem.src}
                alt={lightbox.currentItem.alt}
                className="lightbox-img"
              />
              <div className="lightbox-caption">
                <span>{lightbox.currentItem.alt}</span>
                <button
                  type="button"
                  className="download-btn"
                  onClick={() => {
                    if (lightbox.currentItem) {
                      trackDownload(lightbox.currentItem.id);
                      window.open(lightbox.currentItem.src, '_blank');
                    }
                  }}
                >
                  📥 Download Photo
                </button>
              </div>
            </div>

            {lightbox.hasNext && (
              <button {...lightbox.getNextProps({ className: 'lightbox-nav-btn next-btn' })}>
                ›
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
