import { useMemo } from "react";
import { useMessageStore } from "../store/useMessageStore";

function UploadDebugOverlay() {
  const { uploadLogs } = useMessageStore();
  const enabled = import.meta.env.VITE_UPLOAD_DEBUG === "true";
  const entries = useMemo(() => uploadLogs.slice(0, 8), [uploadLogs]);

  if (!enabled || entries.length === 0) return null;

  return (
    <div className="fixed bottom-24 right-3 z-50 w-72 rounded-lg border border-slate-700/50 bg-slate-800/80 p-3 text-xs text-slate-200 shadow-lg backdrop-blur-sm">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wide text-slate-400">Upload Logs</span>
        <span className="text-[10px] text-slate-400">{entries.length}</span>
      </div>
      <div className="space-y-2">
        {entries.map((entry) => (
          <div key={entry.id} className="rounded-md border border-slate-700/40 px-2 py-1">
            <div className="flex items-center justify-between">
              <span className="font-medium">{entry.status}</span>
              <span className="text-[10px] text-slate-400">
                {new Date(entry.timestamp).toLocaleTimeString()}
              </span>
            </div>
            {entry.fileName && <div className="truncate">{entry.fileName}</div>}
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              {entry.statusCode && <span>HTTP {entry.statusCode}</span>}
              {entry.errorCode && <span>{entry.errorCode}</span>}
            </div>
            {entry.url && (
              <div className="truncate text-[10px] text-slate-400">{entry.url}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default UploadDebugOverlay;
