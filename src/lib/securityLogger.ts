import { supabase } from "@/integrations/supabase/client";

// Security event types
export type SecurityEventType = 
  | 'LOGIN_ATTEMPT'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'RATE_LIMIT_EXCEEDED'
  | 'FILE_UPLOAD_BLOCKED'
  | 'INVALID_INPUT_DETECTED'
  | 'UNAUTHORIZED_ACCESS_ATTEMPT'
  | 'SUSPICIOUS_ACTIVITY';

interface SecurityEvent {
  event_type: SecurityEventType;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  details: Record<string, any>;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp?: string;
}

class SecurityLogger {
  private events: SecurityEvent[] = [];
  private maxEvents = 100; // Store max 100 events in memory
  
  // Log a security event
  async logEvent(event: Omit<SecurityEvent, 'timestamp'>): Promise<void> {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date().toISOString(),
      ip_address: await this.getClientIP(),
      user_agent: navigator.userAgent,
    };
    
    // Add to memory store
    this.events.unshift(securityEvent);
    if (this.events.length > this.maxEvents) {
      this.events.pop();
    }
    
    // Log to console in development
    if (import.meta.env.DEV) {
      console.warn('Security Event:', securityEvent);
    }
    
    // In a production environment, you would send this to your security monitoring service
    // For now, we'll store critical events locally
    if (event.severity === 'CRITICAL' || event.severity === 'HIGH') {
      this.storeCriticalEvent(securityEvent);
    }
  }
  
  // Store critical events in localStorage for review
  private storeCriticalEvent(event: SecurityEvent): void {
    try {
      const criticalEvents = JSON.parse(localStorage.getItem('security_events') || '[]');
      criticalEvents.unshift(event);
      
      // Keep only last 50 critical events
      if (criticalEvents.length > 50) {
        criticalEvents.splice(50);
      }
      
      localStorage.setItem('security_events', JSON.stringify(criticalEvents));
    } catch (error) {
      console.error('Failed to store security event:', error);
    }
  }
  
  // Get client IP (limited in browser environment)
  private async getClientIP(): Promise<string> {
    try {
      // This is a simple way to get IP, in production you might use a service
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || 'unknown';
    } catch {
      return 'unknown';
    }
  }
  
  // Get recent events
  getEvents(limit = 20): SecurityEvent[] {
    return this.events.slice(0, limit);
  }
  
  // Get critical events from storage
  getCriticalEvents(): SecurityEvent[] {
    try {
      return JSON.parse(localStorage.getItem('security_events') || '[]');
    } catch {
      return [];
    }
  }
  
  // Clear all events
  clearEvents(): void {
    this.events = [];
    localStorage.removeItem('security_events');
  }
}

// Export singleton instance
export const securityLogger = new SecurityLogger();

// Helper functions for common security events
export const logRateLimitExceeded = (action: string, userId?: string) => {
  securityLogger.logEvent({
    event_type: 'RATE_LIMIT_EXCEEDED',
    user_id: userId,
    severity: 'MEDIUM',
    details: { action, timestamp: Date.now() }
  });
};

export const logFileUploadBlocked = (reason: string, fileName: string, userId?: string) => {
  securityLogger.logEvent({
    event_type: 'FILE_UPLOAD_BLOCKED',
    user_id: userId,
    severity: 'MEDIUM',
    details: { reason, fileName, timestamp: Date.now() }
  });
};

export const logInvalidInput = (inputType: string, value: string, userId?: string) => {
  securityLogger.logEvent({
    event_type: 'INVALID_INPUT_DETECTED',
    user_id: userId,
    severity: 'LOW',
    details: { inputType, valueLength: value.length, timestamp: Date.now() }
  });
};

export const logUnauthorizedAccess = (resource: string, userId?: string) => {
  securityLogger.logEvent({
    event_type: 'UNAUTHORIZED_ACCESS_ATTEMPT',
    user_id: userId,
    severity: 'HIGH',
    details: { resource, timestamp: Date.now() }
  });
};

export const logSuspiciousActivity = (activity: string, details: Record<string, any>, userId?: string) => {
  securityLogger.logEvent({
    event_type: 'SUSPICIOUS_ACTIVITY',
    user_id: userId,
    severity: 'HIGH',
    details: { activity, ...details, timestamp: Date.now() }
  });
};
