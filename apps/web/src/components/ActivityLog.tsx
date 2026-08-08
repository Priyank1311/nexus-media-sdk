import { useState } from 'react';
import { useMediaEvent } from '@media-sdk/react';

interface LogEntry {
  id: string;
  type: 'view' | 'download';
  itemId: number | string;
  timestamp: number;
}

// live event log component
export function ActivityLog() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [viewCount, setViewCount] = useState(0);
  const [downloadCount, setDownloadCount] = useState(0);

  // listen to view event
  useMediaEvent('view', (payload) => {
    setViewCount((c) => c + 1);
    setLogs((prev) => [
      {
        id: Math.random().toString(36).substring(2, 9),
        type: 'view',
        itemId: payload.itemId,
        timestamp: payload.timestamp,
      },
      ...prev.slice(0, 19),
    ]);
  });

  // listen to download event
  useMediaEvent('download', (payload) => {
    setDownloadCount((c) => c + 1);
    setLogs((prev) => [
      {
        id: Math.random().toString(36).substring(2, 9),
        type: 'download',
        itemId: payload.itemId,
        timestamp: payload.timestamp,
      },
      ...prev.slice(0, 19),
    ]);
  });

  return (
    <div className="activity-log-bar">
      <div className="activity-stats">
        <span className="badge view-badge">
          👁️ Views: <strong>{viewCount}</strong>
        </span>
        <span className="badge download-badge">
          📥 Downloads: <strong>{downloadCount}</strong>
        </span>
      </div>
      {logs.length > 0 && (
        <div className="activity-recent">
          <span className="latest-tag">Latest event:</span>
          <span className="event-item">
            {logs[0].type === 'view' ? '👁️ Viewed' : '📥 Downloaded'} #{logs[0].itemId} at{' '}
            {new Date(logs[0].timestamp).toLocaleTimeString()}
          </span>
        </div>
      )}
    </div>
  );
}
