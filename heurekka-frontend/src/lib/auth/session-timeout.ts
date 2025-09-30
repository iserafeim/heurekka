/**
 * Session Timeout Manager
 * Implements automatic logout after inactivity
 * Provides warnings before session expiration
 */

'use client';

type SessionTimeoutCallback = () => void;
type SessionWarningCallback = (remainingSeconds: number) => void;

interface SessionTimeoutConfig {
  timeoutMs: number; // Total session timeout (default: 30 minutes)
  warningMs: number; // Warning before timeout (default: 2 minutes)
  onTimeout: SessionTimeoutCallback;
  onWarning?: SessionWarningCallback;
}

const DEFAULT_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const DEFAULT_WARNING = 2 * 60 * 1000; // 2 minutes before timeout

class SessionTimeoutManager {
  private timeoutId: NodeJS.Timeout | null = null;
  private warningId: NodeJS.Timeout | null = null;
  private lastActivity: number = Date.now();
  private config: SessionTimeoutConfig | null = null;
  private isActive: boolean = false;
  private activityEvents: string[] = [
    'mousedown',
    'mousemove',
    'keypress',
    'scroll',
    'touchstart',
    'click',
  ];

  /**
   * Initialize session timeout monitoring
   * @param config - Configuration options
   */
  initialize(config: Partial<SessionTimeoutConfig> & { onTimeout: SessionTimeoutCallback }): void {
    // Prevent multiple initializations
    if (this.isActive) {
      console.warn('Session timeout already initialized');
      return;
    }

    this.config = {
      timeoutMs: config.timeoutMs || DEFAULT_TIMEOUT,
      warningMs: config.warningMs || DEFAULT_WARNING,
      onTimeout: config.onTimeout,
      onWarning: config.onWarning,
    };

    this.lastActivity = Date.now();
    this.isActive = true;

    // Start monitoring
    this.startMonitoring();

    // Listen for user activity
    this.attachActivityListeners();

    if (process.env.NODE_ENV === 'development') {
      console.log('Session timeout initialized:', {
        timeout: `${this.config.timeoutMs / 1000}s`,
        warning: `${this.config.warningMs / 1000}s`,
      });
    }
  }

  /**
   * Reset activity timer
   * Call this when user performs an action
   */
  resetActivity(): void {
    if (!this.isActive || !this.config) return;

    this.lastActivity = Date.now();

    // Clear existing timers
    this.clearTimers();

    // Restart monitoring
    this.startMonitoring();
  }

  /**
   * Start monitoring for timeout
   */
  private startMonitoring(): void {
    if (!this.config) return;

    const { timeoutMs, warningMs, onTimeout, onWarning } = this.config;

    // Set warning timer
    if (onWarning && warningMs > 0) {
      const warningDelay = timeoutMs - warningMs;
      this.warningId = setTimeout(() => {
        const remainingSeconds = Math.floor(warningMs / 1000);
        onWarning(remainingSeconds);

        // Log warning in development
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Session timeout warning: ${remainingSeconds}s remaining`);
        }
      }, warningDelay);
    }

    // Set timeout timer
    this.timeoutId = setTimeout(() => {
      this.handleTimeout();
    }, timeoutMs);
  }

  /**
   * Handle session timeout
   */
  private handleTimeout(): void {
    if (!this.config) return;

    if (process.env.NODE_ENV === 'development') {
      console.log('Session timed out due to inactivity');
    }

    // Clean up
    this.destroy();

    // Call timeout callback
    this.config.onTimeout();
  }

  /**
   * Attach activity listeners
   */
  private attachActivityListeners(): void {
    if (typeof window === 'undefined') return;

    this.activityEvents.forEach((event) => {
      window.addEventListener(event, this.handleActivity, { passive: true });
    });
  }

  /**
   * Detach activity listeners
   */
  private detachActivityListeners(): void {
    if (typeof window === 'undefined') return;

    this.activityEvents.forEach((event) => {
      window.removeEventListener(event, this.handleActivity);
    });
  }

  /**
   * Handle user activity
   */
  private handleActivity = (): void => {
    this.resetActivity();
  };

  /**
   * Clear all timers
   */
  private clearTimers(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    if (this.warningId) {
      clearTimeout(this.warningId);
      this.warningId = null;
    }
  }

  /**
   * Get remaining time until timeout
   * @returns Remaining milliseconds or null if not active
   */
  getRemainingTime(): number | null {
    if (!this.isActive || !this.config) return null;

    const elapsed = Date.now() - this.lastActivity;
    const remaining = this.config.timeoutMs - elapsed;

    return Math.max(0, remaining);
  }

  /**
   * Check if session is close to timeout
   * @returns true if within warning period
   */
  isWarningPeriod(): boolean {
    if (!this.isActive || !this.config) return false;

    const remaining = this.getRemainingTime();
    if (remaining === null) return false;

    return remaining <= this.config.warningMs;
  }

  /**
   * Pause session timeout monitoring
   * Useful for modals or when user is actively doing something
   */
  pause(): void {
    if (!this.isActive) return;

    this.clearTimers();

    if (process.env.NODE_ENV === 'development') {
      console.log('Session timeout paused');
    }
  }

  /**
   * Resume session timeout monitoring
   */
  resume(): void {
    if (!this.isActive || !this.config) return;

    this.startMonitoring();

    if (process.env.NODE_ENV === 'development') {
      console.log('Session timeout resumed');
    }
  }

  /**
   * Destroy session timeout manager
   * Call this on logout or component unmount
   */
  destroy(): void {
    this.clearTimers();
    this.detachActivityListeners();
    this.isActive = false;
    this.config = null;

    if (process.env.NODE_ENV === 'development') {
      console.log('Session timeout destroyed');
    }
  }

  /**
   * Check if session timeout is active
   */
  isActiveSession(): boolean {
    return this.isActive;
  }
}

// Export singleton instance
export const sessionTimeout = new SessionTimeoutManager();

// Hook for React components
export function useSessionTimeout(
  onTimeout: SessionTimeoutCallback,
  onWarning?: SessionWarningCallback,
  options?: {
    timeoutMs?: number;
    warningMs?: number;
  }
): void {
  if (typeof window === 'undefined') return;

  // Initialize on mount
  React.useEffect(() => {
    sessionTimeout.initialize({
      onTimeout,
      onWarning,
      timeoutMs: options?.timeoutMs,
      warningMs: options?.warningMs,
    });

    // Cleanup on unmount
    return () => {
      sessionTimeout.destroy();
    };
  }, [onTimeout, onWarning, options?.timeoutMs, options?.warningMs]);
}

// For server-side compatibility
const React = typeof window !== 'undefined' ? require('react') : { useEffect: () => {} };