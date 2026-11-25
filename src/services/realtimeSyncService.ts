/**
 * Unified Cross-Platform & Cross-Device Real-Time Sync Hub
 *
 * Ensures new data (accounts, uploaded exams, QR assignments, submissions,
 * custom exams, mistake analytics, visitor/download stats) syncs immediately
 * across ALL platforms and devices (Windows, macOS, Android, iOS, iPad,
 * Chrome, Safari, Edge, Zalo WebView, multi-tab, ais-dev <-> ais-pre):
 *
 * 1. Single shared EventSource('/api/submissions/stream') per tab (prevents
 *    exhausting the browser's 6-connection HTTP/1.1 limit).
 * 2. Automatic exponential-backoff SSE reconnection + instant full version
 *    reconciliation on reconnect.
 * 3. Instant 0ms cross-tab sync via BroadcastChannel + localStorage storage
 *    event fallback (compatible with older iOS Safari / Zalo WebViews).
 * 4. Immediate resume sync on visibilitychange, focus, pageshow (iOS bfcache),
 *    and online events.
 * 5. Lightweight background version check (/api/sync/version every 3.5s while
 *    visible) so mobile browsers / proxies that drop or buffer SSE still
 *    receive updates automatically within seconds.
 */

export type SyncDomainEvent =
  | 'datauser_updated'
  | 'uploaded_exams_updated'
  | 'submission_added'
  | 'submission_deleted'
  | 'submissions_reset'
  | 'assignment_updated'
  | 'custom_exams_updated'
  | 'mistakes_updated'
  | 'visitor_stats_updated'
  | 'sync_all_updated';

export interface SyncVersionsSnapshot {
  datauser: number;
  uploadedExams: number;
  submissions: number;
  assignments: number;
  customExams: number;
  mistakes: number;
  visitorStats: number;
}

type EventCallback = (payload: any) => void;
type ConnectionCallback = (connected: boolean) => void;

const BROADCAST_CHANNEL_NAME = 'agritech_realtime_sync_v1';
const STORAGE_PING_KEY = 'agritech_realtime_sync_ping_v1';

const ALL_SSE_EVENTS: SyncDomainEvent[] = [
  'datauser_updated',
  'uploaded_exams_updated',
  'submission_added',
  'submission_deleted',
  'submissions_reset',
  'assignment_updated',
  'custom_exams_updated',
  'mistakes_updated',
  'visitor_stats_updated',
  'sync_all_updated',
];

class RealtimeSyncHub {
  private listeners = new Map<SyncDomainEvent, Set<EventCallback>>();
  private connectionListeners = new Set<ConnectionCallback>();
  private eventSource: EventSource | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private isConnected = false;
  private isStarted = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectAttempt = 0;
  private lastKnownVersions: SyncVersionsSnapshot | null = null;
  private isCheckingVersion = false;
  private lastVersionCheckAt = 0;
  private readonly tabId = `tab_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  public ensureStarted(): void {
    if (this.isStarted || typeof window === 'undefined') return;
    this.isStarted = true;

    this.initCrossTabChannel();
    this.initLifecycleListeners();
    this.connectSSE();
    this.startVersionHeartbeat();
  }

  private initCrossTabChannel(): void {
    try {
      if ('BroadcastChannel' in window) {
        this.broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        this.broadcastChannel.onmessage = (ev: MessageEvent) => {
          const msg = ev.data;
          if (!msg || msg.sender === this.tabId || !msg.eventType) return;
          this.dispatchEvent(msg.eventType as SyncDomainEvent, msg.payload);
        };
      }
    } catch {
      this.broadcastChannel = null;
    }

    // Fallback for browsers / WebViews without BroadcastChannel (e.g. older iOS / Zalo)
    window.addEventListener('storage', (ev: StorageEvent) => {
      if (ev.key !== STORAGE_PING_KEY || !ev.newValue) return;
      try {
        const msg = JSON.parse(ev.newValue);
        if (!msg || msg.sender === this.tabId || !msg.eventType) return;
        this.dispatchEvent(msg.eventType as SyncDomainEvent, msg.payload);
      } catch {}
    });
  }

  private initLifecycleListeners(): void {
    const handleResume = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        return;
      }
      // On mobile (iOS/Android/Zalo), backgrounding often kills SSE silently.
      // Reconnect if needed and immediately check server versions.
      if (!this.eventSource || this.eventSource.readyState === EventSource.CLOSED) {
        this.connectSSE();
      }
      void this.checkServerVersion(true);
    };

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        handleResume();
      }
    });
    window.addEventListener('focus', handleResume);
    window.addEventListener('online', handleResume);
    window.addEventListener('pageshow', (ev: PageTransitionEvent) => {
      if (ev.persisted) {
        this.connectSSE();
      }
      handleResume();
    });
  }

  private setConnected(next: boolean): void {
    if (this.isConnected === next) return;
    this.isConnected = next;
    this.connectionListeners.forEach((cb) => {
      try {
        cb(next);
      } catch {}
    });
  }

  private connectSSE(): void {
    if (typeof window === 'undefined' || !('EventSource' in window)) return;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.eventSource) {
      try {
        this.eventSource.close();
      } catch {}
      this.eventSource = null;
    }

    try {
      const es = new EventSource('/api/submissions/stream');
      this.eventSource = es;

      es.onopen = () => {
        const wasReconnect = this.reconnectAttempt > 0;
        this.reconnectAttempt = 0;
        this.setConnected(true);
        // Reconcile any missed updates immediately after reconnect
        if (wasReconnect) {
          void this.checkServerVersion(true);
        }
      };

      es.addEventListener('sync_versions', (ev: MessageEvent) => {
        try {
          const parsed = JSON.parse(ev.data);
          if (parsed && typeof parsed === 'object') {
            this.reconcileVersions(parsed as SyncVersionsSnapshot);
          }
        } catch {}
      });

      for (const evtName of ALL_SSE_EVENTS) {
        es.addEventListener(evtName, (ev: MessageEvent) => {
          let payload: any = null;
          try {
            payload = ev.data ? JSON.parse(ev.data) : null;
          } catch {
            payload = ev.data;
          }
          this.setConnected(true);
          this.dispatchEvent(evtName, payload);
        });
      }

      es.onerror = () => {
        this.setConnected(false);
        // Close and schedule controlled exponential backoff reconnect
        try {
          es.close();
        } catch {}
        if (this.eventSource === es) {
          this.eventSource = null;
        }
        this.scheduleReconnect();
      };
    } catch {
      this.setConnected(false);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    this.reconnectAttempt += 1;
    const delayMs = Math.min(10000, 1500 * Math.pow(1.6, Math.min(this.reconnectAttempt - 1, 5)));
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connectSSE();
    }, delayMs);
  }

  private startVersionHeartbeat(): void {
    if (this.pollTimer) return;
    // Lightweight version check: every 3.5s when visible, 15s when hidden.
    // Acts as an immediate cross-instance / mobile-proxy safety net.
    this.pollTimer = setInterval(() => {
      const isHidden = typeof document !== 'undefined' && document.visibilityState === 'hidden';
      const minInterval = isHidden ? 15000 : 3500;
      if (Date.now() - this.lastVersionCheckAt < minInterval - 200) {
        return;
      }
      void this.checkServerVersion(false);
    }, 3500);

    // Initial baseline fetch shortly after boot
    setTimeout(() => {
      void this.checkServerVersion(false);
    }, 1200);
  }

  public async checkServerVersion(force = false): Promise<SyncVersionsSnapshot | null> {
    if (typeof window === 'undefined') return null;
    if (this.isCheckingVersion) return this.lastKnownVersions;
    const now = Date.now();
    if (!force && now - this.lastVersionCheckAt < 1800) {
      return this.lastKnownVersions;
    }
    this.isCheckingVersion = true;
    this.lastVersionCheckAt = now;

    try {
      const res = await fetch(`/api/sync/version?_t=${now}${force ? '&force=1' : ''}`, {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) return this.lastKnownVersions;
      const payload = await res.json();
      if (payload?.success && payload.versions) {
        this.reconcileVersions(payload.versions as SyncVersionsSnapshot);
        return payload.versions as SyncVersionsSnapshot;
      }
    } catch {
      // Ignore transient network errors
    } finally {
      this.isCheckingVersion = false;
    }
    return this.lastKnownVersions;
  }

  private reconcileVersions(next: SyncVersionsSnapshot): void {
    const prev = this.lastKnownVersions;
    this.lastKnownVersions = { ...next };

    if (!prev) {
      return;
    }

    if (next.datauser > prev.datauser) {
      this.dispatchEvent('datauser_updated', { version: next.datauser, source: 'version_sync' });
    }
    if (next.uploadedExams > prev.uploadedExams) {
      this.dispatchEvent('uploaded_exams_updated', { changedAt: next.uploadedExams, source: 'version_sync' });
    }
    if (next.submissions > prev.submissions) {
      this.dispatchEvent('submission_added', { changedAt: next.submissions, source: 'version_sync', refreshListOnly: true });
    }
    if (next.assignments > prev.assignments) {
      this.dispatchEvent('assignment_updated', { changedAt: next.assignments, source: 'version_sync' });
    }
    if (next.customExams > prev.customExams) {
      this.dispatchEvent('custom_exams_updated', { changedAt: next.customExams, source: 'version_sync', refreshListOnly: true });
    }
    if (next.mistakes > prev.mistakes) {
      this.dispatchEvent('mistakes_updated', { changedAt: next.mistakes, source: 'version_sync' });
    }
    if (next.visitorStats > prev.visitorStats) {
      this.dispatchEvent('visitor_stats_updated', { changedAt: next.visitorStats, source: 'version_sync', refreshOnly: true });
    }
  }

  private dispatchEvent(eventType: SyncDomainEvent, payload: any): void {
    const set = this.listeners.get(eventType);
    if (!set || set.size === 0) return;
    set.forEach((cb) => {
      try {
        cb(payload);
      } catch {}
    });
  }

  public subscribe(eventType: SyncDomainEvent, callback: EventCallback): () => void {
    this.ensureStarted();
    let set = this.listeners.get(eventType);
    if (!set) {
      set = new Set<EventCallback>();
      this.listeners.set(eventType, set);
    }
    set.add(callback);
    return () => {
      set?.delete(callback);
    };
  }

  public onConnectionChange(callback: ConnectionCallback): () => void {
    this.ensureStarted();
    this.connectionListeners.add(callback);
    try {
      callback(this.isConnected);
    } catch {}
    return () => {
      this.connectionListeners.delete(callback);
    };
  }

  public getIsConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Notify all open tabs on this device immediately (0ms) after a local mutation.
   */
  public notifyLocalChange(eventType: SyncDomainEvent, payload?: any): void {
    if (typeof window === 'undefined') return;
    const msg = {
      sender: this.tabId,
      eventType,
      payload: payload ?? { changedAt: Date.now(), source: 'local_tab' },
      ts: Date.now(),
    };
    try {
      this.broadcastChannel?.postMessage(msg);
    } catch {}
    try {
      localStorage.setItem(STORAGE_PING_KEY, JSON.stringify(msg));
    } catch {}
  }

  /**
   * Request the server to force an immediate two-way Cloud SQL + peer sync across all domains.
   */
  public async forceSyncNow(): Promise<boolean> {
    try {
      const res = await fetch('/api/sync/now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.versions) {
          this.reconcileVersions(data.versions);
        }
        return true;
      }
    } catch {}
    return false;
  }
}

export const realtimeSyncService = new RealtimeSyncHub();

export function subscribeRealtimeEvent(
  eventType: SyncDomainEvent,
  callback: EventCallback
): () => void {
  return realtimeSyncService.subscribe(eventType, callback);
}

export function onRealtimeConnectionChange(callback: ConnectionCallback): () => void {
  return realtimeSyncService.onConnectionChange(callback);
}

export function notifyLocalDomainChange(eventType: SyncDomainEvent, payload?: any): void {
  realtimeSyncService.notifyLocalChange(eventType, payload);
}

export function triggerImmediateSyncCheck(): Promise<SyncVersionsSnapshot | null> {
  return realtimeSyncService.checkServerVersion(true);
}
