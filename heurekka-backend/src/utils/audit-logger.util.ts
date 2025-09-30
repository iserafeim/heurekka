import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Audit Logger for security-critical events
 * Implements comprehensive audit trail for authentication and authorization events
 */

export enum AuditEventType {
  // Authentication events
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  LOGOUT = 'logout',
  SIGNUP = 'signup',
  PASSWORD_RESET_REQUEST = 'password_reset_request',
  PASSWORD_RESET_SUCCESS = 'password_reset_success',
  PASSWORD_CHANGE = 'password_change',
  EMAIL_VERIFICATION = 'email_verification',
  OAUTH_LOGIN = 'oauth_login',

  // Session events
  SESSION_REFRESH = 'session_refresh',
  SESSION_EXPIRED = 'session_expired',
  SESSION_REVOKED = 'session_revoked',

  // Security events
  ACCOUNT_LOCKED = 'account_locked',
  ACCOUNT_UNLOCKED = 'account_unlocked',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  BRUTE_FORCE_ATTEMPT = 'brute_force_attempt',
  CSRF_VIOLATION = 'csrf_violation',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',

  // Profile events
  PROFILE_CREATED = 'profile_created',
  PROFILE_UPDATED = 'profile_updated',
  PROFILE_DELETED = 'profile_deleted',

  // Authorization events
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  PERMISSION_DENIED = 'permission_denied',

  // Data access events
  SENSITIVE_DATA_ACCESS = 'sensitive_data_access',
  ADMIN_ACTION = 'admin_action'
}

export interface AuditLogEntry {
  event_type: AuditEventType;
  user_id: string | null;
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
  success: boolean;
  error_message?: string;
  metadata?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class AuditLogger {
  private supabase: SupabaseClient;
  private tableName = 'audit_logs';

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('⚠️ Audit logger: Supabase configuration missing');
      // Create a dummy client that won't break the application
      this.supabase = createClient('https://dummy.supabase.co', 'dummy-key');
      return;
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('✅ Audit logger initialized');
  }

  /**
   * Log an audit event
   */
  async log(entry: AuditLogEntry): Promise<void> {
    try {
      const logEntry = {
        event_type: entry.event_type,
        user_id: entry.user_id,
        session_id: entry.session_id,
        ip_address: entry.ip_address,
        user_agent: entry.user_agent,
        success: entry.success,
        error_message: entry.error_message,
        metadata: entry.metadata || {},
        severity: entry.severity,
        timestamp: new Date().toISOString()
      };

      const { error } = await this.supabase
        .from(this.tableName)
        .insert(logEntry);

      if (error) {
        console.error('Failed to write audit log:', error);
        // Log to console as fallback
        console.log('AUDIT LOG:', JSON.stringify(logEntry));
      }
    } catch (error) {
      console.error('Audit logging error:', error);
      // Fallback to console logging
      console.log('AUDIT LOG (fallback):', JSON.stringify(entry));
    }
  }

  /**
   * Log successful login
   */
  async logLoginSuccess(
    userId: string,
    sessionId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      event_type: AuditEventType.LOGIN_SUCCESS,
      user_id: userId,
      session_id: sessionId,
      ip_address: ipAddress,
      user_agent: userAgent,
      success: true,
      severity: 'low'
    });
  }

  /**
   * Log failed login attempt
   */
  async logLoginFailure(
    email: string,
    ipAddress?: string,
    userAgent?: string,
    reason?: string
  ): Promise<void> {
    await this.log({
      event_type: AuditEventType.LOGIN_FAILURE,
      user_id: null,
      ip_address: ipAddress,
      user_agent: userAgent,
      success: false,
      error_message: reason,
      metadata: { email },
      severity: 'medium'
    });
  }

  /**
   * Log logout
   */
  async logLogout(userId: string, sessionId?: string): Promise<void> {
    await this.log({
      event_type: AuditEventType.LOGOUT,
      user_id: userId,
      session_id: sessionId,
      success: true,
      severity: 'low'
    });
  }

  /**
   * Log signup
   */
  async logSignup(
    userId: string,
    email: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      event_type: AuditEventType.SIGNUP,
      user_id: userId,
      ip_address: ipAddress,
      user_agent: userAgent,
      success: true,
      metadata: { email },
      severity: 'low'
    });
  }

  /**
   * Log password reset request
   */
  async logPasswordResetRequest(
    email: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      event_type: AuditEventType.PASSWORD_RESET_REQUEST,
      user_id: null,
      ip_address: ipAddress,
      user_agent: userAgent,
      success: true,
      metadata: { email },
      severity: 'medium'
    });
  }

  /**
   * Log account lockout
   */
  async logAccountLocked(
    userId: string,
    reason: string,
    ipAddress?: string
  ): Promise<void> {
    await this.log({
      event_type: AuditEventType.ACCOUNT_LOCKED,
      user_id: userId,
      ip_address: ipAddress,
      success: true,
      error_message: reason,
      severity: 'high'
    });
  }

  /**
   * Log suspicious activity
   */
  async logSuspiciousActivity(
    userId: string | null,
    description: string,
    ipAddress?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      event_type: AuditEventType.SUSPICIOUS_ACTIVITY,
      user_id: userId,
      ip_address: ipAddress,
      success: true,
      error_message: description,
      metadata,
      severity: 'critical'
    });
  }

  /**
   * Log brute force attempt
   */
  async logBruteForceAttempt(
    email: string,
    ipAddress: string,
    attemptCount: number
  ): Promise<void> {
    await this.log({
      event_type: AuditEventType.BRUTE_FORCE_ATTEMPT,
      user_id: null,
      ip_address: ipAddress,
      success: true,
      metadata: { email, attemptCount },
      severity: 'critical'
    });
  }

  /**
   * Log rate limit exceeded
   */
  async logRateLimitExceeded(
    ipAddress: string,
    endpoint: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      event_type: AuditEventType.RATE_LIMIT_EXCEEDED,
      user_id: null,
      ip_address: ipAddress,
      user_agent: userAgent,
      success: true,
      metadata: { endpoint },
      severity: 'high'
    });
  }

  /**
   * Log unauthorized access attempt
   */
  async logUnauthorizedAccess(
    userId: string | null,
    resource: string,
    ipAddress?: string
  ): Promise<void> {
    await this.log({
      event_type: AuditEventType.UNAUTHORIZED_ACCESS,
      user_id: userId,
      ip_address: ipAddress,
      success: false,
      metadata: { resource },
      severity: 'high'
    });
  }

  /**
   * Log CSRF violation
   */
  async logCsrfViolation(
    ipAddress: string,
    endpoint: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      event_type: AuditEventType.CSRF_VIOLATION,
      user_id: null,
      ip_address: ipAddress,
      user_agent: userAgent,
      success: false,
      metadata: { endpoint },
      severity: 'critical'
    });
  }
}

// Export singleton instance
let auditLoggerInstance: AuditLogger | null = null;

export function getAuditLogger(): AuditLogger {
  if (!auditLoggerInstance) {
    auditLoggerInstance = new AuditLogger();
  }
  return auditLoggerInstance;
}

export default AuditLogger;