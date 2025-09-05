---
title: Landlord Dashboard - Screen States
description: Complete screen state specifications for landlord dashboard feature
feature: landlord-dashboard
last-updated: 2025-01-05
version: 1.0.0
related-files: 
  - ./user-journey.md
  - ./interactions.md
  - ./implementation.md
  - ../../design-system/components/cards.md
status: approved
---

# Landlord Dashboard - Screen States

## Overview
Comprehensive documentation of all screen states for the landlord dashboard feature, including lead inbox, detail views, analytics panels, and response interfaces.

## Table of Contents
1. [Dashboard Main View](#dashboard-main-view)
2. [Lead Inbox States](#lead-inbox-states)
3. [Lead Detail Panel](#lead-detail-panel)
4. [Analytics Dashboard](#analytics-dashboard)
5. [Response Interface](#response-interface)
6. [Settings & Configuration](#settings-configuration)
7. [Mobile Views](#mobile-views)

## Dashboard Main View

### State: Default Dashboard
**Layout Structure**:
- Container: 1440px max-width
- Grid: 12-column with 24px gutters
- Sidebar: 280px fixed width
- Main content: Flexible with 32px padding
- Header height: 80px sticky

**Visual Specifications**:
```css
/* Dashboard Container */
.dashboard-container {
  display: grid;
  grid-template-columns: 280px 1fr;
  grid-template-rows: 80px 1fr;
  min-height: 100vh;
  background: #FAFBFF;
}

.dashboard-header {
  grid-column: 1 / -1;
  background: white;
  border-bottom: 1px solid #E5E7EB;
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
}

.dashboard-sidebar {
  background: white;
  border-right: 1px solid #E5E7EB;
  padding: 24px 16px;
  overflow-y: auto;
  height: calc(100vh - 80px);
}

.dashboard-main {
  padding: 32px;
  overflow-y: auto;
  height: calc(100vh - 80px);
}

/* Metrics Summary Bar */
.metrics-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.metric-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.metric-value {
  font-size: 32px;
  font-weight: 700;
  color: #1A1A1A;
  line-height: 1;
}

.metric-label {
  font-size: 14px;
  color: #6B7280;
  margin-top: 8px;
}

.metric-change {
  display: inline-flex;
  align-items: center;
  font-size: 14px;
  margin-top: 12px;
  padding: 4px 8px;
  border-radius: 16px;
  background: #F0FDF4;
  color: #16A34A;
}

.metric-change.negative {
  background: #FEF2F2;
  color: #DC2626;
}
```

### State: Loading Dashboard
```css
/* Skeleton Loading State */
.dashboard-skeleton {
  animation: shimmer 2s infinite;
  background: linear-gradient(
    90deg,
    #F3F4F6 0%,
    #E5E7EB 50%,
    #F3F4F6 100%
  );
  background-size: 200% 100%;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.metric-skeleton {
  height: 120px;
  border-radius: 12px;
  margin-bottom: 24px;
}

.lead-skeleton {
  height: 140px;
  border-radius: 12px;
  margin-bottom: 16px;
}

/* Loading Overlay */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #E5E7EB;
  border-top-color: #6366F1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

## Lead Inbox States

### State: Lead List View
```css
/* Lead Inbox Container */
.lead-inbox {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.inbox-header {
  padding: 20px 24px;
  border-bottom: 1px solid #F3F4F6;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.inbox-title {
  font-size: 20px;
  font-weight: 600;
  color: #1A1A1A;
}

.inbox-filters {
  display: flex;
  gap: 12px;
}

.filter-chip {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  border: 1px solid #E5E7EB;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-chip.active {
  background: #6366F1;
  color: white;
  border-color: #6366F1;
}

/* Lead Cards */
.lead-list {
  max-height: 600px;
  overflow-y: auto;
}

.lead-card {
  padding: 20px 24px;
  border-bottom: 1px solid #F3F4F6;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.lead-card:hover {
  background: #F9FAFB;
}

.lead-card.unread {
  background: #F0F1FF;
  border-left: 4px solid #6366F1;
}

.lead-card.selected {
  background: #E0E7FF;
  border-left: 4px solid #6366F1;
}

/* Lead Card Content */
.lead-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.lead-tenant {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tenant-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #6B7280;
}

.tenant-info {
  flex: 1;
}

.tenant-name {
  font-size: 16px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 4px;
}

.tenant-occupation {
  font-size: 14px;
  color: #6B7280;
}

.lead-timestamp {
  font-size: 13px;
  color: #9CA3AF;
}

/* Lead Metadata */
.lead-details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 12px;
}

.lead-detail-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #4B5563;
}

.detail-icon {
  width: 16px;
  height: 16px;
  opacity: 0.6;
}

/* Lead Priority Badge */
.priority-badge {
  position: absolute;
  top: 20px;
  right: 24px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.priority-badge.high {
  background: #DBEAFE;
  color: #1E40AF;
}

.priority-badge.medium {
  background: #FEF3C7;
  color: #92400E;
}

.priority-badge.low {
  background: #F3F4F6;
  color: #6B7280;
}

/* Lead Actions */
.lead-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.lead-action-btn {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid #E5E7EB;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.lead-action-btn:hover {
  background: #F9FAFB;
  border-color: #D1D5DB;
}

.lead-action-btn.primary {
  background: #6366F1;
  color: white;
  border-color: #6366F1;
}

.lead-action-btn.primary:hover {
  background: #5558E3;
}

/* Unread Indicator */
.unread-dot {
  position: absolute;
  top: 24px;
  left: 8px;
  width: 8px;
  height: 8px;
  background: #6366F1;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.2); }
}
```

### State: Empty Inbox
```css
.empty-inbox {
  padding: 80px 40px;
  text-align: center;
}

.empty-icon {
  width: 120px;
  height: 120px;
  margin: 0 auto 24px;
  opacity: 0.3;
}

.empty-title {
  font-size: 24px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 12px;
}

.empty-description {
  font-size: 16px;
  color: #6B7280;
  max-width: 400px;
  margin: 0 auto 32px;
  line-height: 1.6;
}

.empty-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}
```

## Lead Detail Panel

### State: Expanded Lead Details
```css
/* Detail Panel Container */
.lead-detail-panel {
  position: fixed;
  right: 0;
  top: 80px;
  width: 480px;
  height: calc(100vh - 80px);
  background: white;
  border-left: 1px solid #E5E7EB;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.08);
  overflow-y: auto;
  z-index: 50;
  transform: translateX(100%);
  transition: transform 0.3s ease;
}

.lead-detail-panel.open {
  transform: translateX(0);
}

/* Panel Header */
.panel-header {
  padding: 24px;
  border-bottom: 1px solid #F3F4F6;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
}

.panel-close {
  position: absolute;
  top: 24px;
  right: 24px;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid #E5E7EB;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Tenant Profile Section */
.tenant-profile {
  padding: 24px;
  background: #F9FAFB;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.profile-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: white;
  border: 2px solid #E5E7EB;
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-size: 20px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 4px;
}

.profile-title {
  font-size: 14px;
  color: #6B7280;
  margin-bottom: 8px;
}

.verification-indicators {
  display: flex;
  gap: 8px;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  background: #E0E7FF;
  color: #6366F1;
}

/* Profile Details Grid */
.profile-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 20px;
}

.detail-block {
  background: white;
  padding: 12px;
  border-radius: 8px;
}

.detail-label {
  font-size: 12px;
  color: #9CA3AF;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.detail-value {
  font-size: 16px;
  font-weight: 600;
  color: #1A1A1A;
}

/* Property Info Section */
.property-info {
  padding: 24px;
  border-bottom: 1px solid #F3F4F6;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 16px;
}

.property-card-mini {
  background: #F9FAFB;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  gap: 16px;
}

.property-thumb {
  width: 80px;
  height: 80px;
  border-radius: 6px;
  object-fit: cover;
}

.property-info {
  flex: 1;
}

.property-title {
  font-size: 14px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 4px;
}

.property-price {
  font-size: 18px;
  font-weight: 700;
  color: #6366F1;
  margin-bottom: 8px;
}

.compatibility-score {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: #D1FAE5;
  color: #065F46;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
}

/* Conversation Thread */
.conversation-section {
  padding: 24px;
}

.message-thread {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 16px;
}

.message {
  margin-bottom: 16px;
}

.message.tenant {
  text-align: left;
}

.message.landlord {
  text-align: right;
}

.message-bubble {
  display: inline-block;
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
}

.message.tenant .message-bubble {
  background: #F3F4F6;
  color: #1A1A1A;
  border-bottom-left-radius: 4px;
}

.message.landlord .message-bubble {
  background: #6366F1;
  color: white;
  border-bottom-right-radius: 4px;
}

.message-time {
  font-size: 11px;
  color: #9CA3AF;
  margin-top: 4px;
}

/* Quick Response Section */
.quick-response {
  padding: 16px;
  background: #F9FAFB;
  border-top: 1px solid #E5E7EB;
}

.response-templates {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  overflow-x: auto;
}

.template-chip {
  padding: 6px 12px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  font-size: 13px;
  white-space: nowrap;
  cursor: pointer;
}

.template-chip:hover {
  background: #F3F4F6;
  border-color: #D1D5DB;
}

.response-input {
  width: 100%;
  min-height: 80px;
  padding: 12px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
}

.response-actions {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}

.send-button {
  flex: 1;
  padding: 10px;
  background: #6366F1;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.send-button:hover {
  background: #5558E3;
}
```

## Analytics Dashboard

### State: Performance Metrics View
```css
/* Analytics Container */
.analytics-dashboard {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
}

/* Chart Cards */
.chart-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.chart-card.full-width {
  grid-column: span 12;
}

.chart-card.two-thirds {
  grid-column: span 8;
}

.chart-card.one-third {
  grid-column: span 4;
}

.chart-card.half {
  grid-column: span 6;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-title {
  font-size: 18px;
  font-weight: 600;
  color: #1A1A1A;
}

.chart-period {
  display: flex;
  gap: 8px;
}

.period-btn {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 13px;
  border: 1px solid #E5E7EB;
  background: white;
  cursor: pointer;
}

.period-btn.active {
  background: #6366F1;
  color: white;
  border-color: #6366F1;
}

/* Response Time Chart */
.response-time-chart {
  height: 300px;
  position: relative;
}

.chart-canvas {
  width: 100%;
  height: 100%;
}

/* Lead Quality Distribution */
.quality-distribution {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 24px;
  align-items: center;
}

.donut-chart {
  width: 200px;
  height: 200px;
  position: relative;
}

.chart-legend {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.legend-label {
  font-size: 14px;
  color: #4B5563;
}

.legend-value {
  margin-left: auto;
  font-weight: 600;
  color: #1A1A1A;
}

/* Conversion Funnel */
.funnel-stages {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.funnel-stage {
  position: relative;
  background: #F3F4F6;
  border-radius: 6px;
  padding: 12px 16px;
}

.funnel-fill {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  background: linear-gradient(90deg, #6366F1 0%, #8B5CF6 100%);
  border-radius: 6px;
  transition: width 0.5s ease;
}

.funnel-content {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1;
}

.stage-name {
  font-size: 14px;
  font-weight: 500;
  color: #1A1A1A;
}

.stage-count {
  font-size: 16px;
  font-weight: 700;
  color: #1A1A1A;
}

/* Property Performance Table */
.performance-table {
  width: 100%;
  border-collapse: collapse;
}

.performance-table th {
  text-align: left;
  padding: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: #6B7280;
  border-bottom: 1px solid #E5E7EB;
}

.performance-table td {
  padding: 12px;
  font-size: 14px;
  color: #1A1A1A;
  border-bottom: 1px solid #F3F4F6;
}

.property-name {
  font-weight: 500;
}

.metric-cell {
  text-align: center;
}

.trend-up {
  color: #10B981;
}

.trend-down {
  color: #EF4444;
}
```

## Response Interface

### State: Quick Response Modal
```css
/* Response Modal */
.response-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #1A1A1A;
}

.modal-close {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background: #F3F4F6;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Response Options */
.response-options {
  padding: 24px;
  border-bottom: 1px solid #F3F4F6;
}

.option-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.option-card {
  padding: 16px;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.option-card:hover {
  border-color: #6366F1;
  background: #F0F1FF;
}

.option-card.selected {
  border-color: #6366F1;
  background: #E0E7FF;
}

.option-icon {
  width: 32px;
  height: 32px;
  margin: 0 auto 8px;
}

.option-label {
  font-size: 14px;
  font-weight: 500;
  color: #1A1A1A;
}

/* Message Composer */
.message-composer {
  padding: 24px;
  flex: 1;
  overflow-y: auto;
}

.template-selector {
  margin-bottom: 16px;
}

.template-dropdown {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 14px;
}

.message-textarea {
  width: 100%;
  min-height: 200px;
  padding: 12px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
}

.character-count {
  margin-top: 8px;
  text-align: right;
  font-size: 12px;
  color: #9CA3AF;
}

/* Modal Footer */
.modal-footer {
  padding: 24px;
  border-top: 1px solid #E5E7EB;
  display: flex;
  gap: 12px;
}

.btn-cancel {
  padding: 10px 20px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  background: white;
  font-weight: 500;
  cursor: pointer;
}

.btn-send {
  flex: 1;
  padding: 10px 20px;
  background: #6366F1;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-send:hover {
  background: #5558E3;
}

.btn-send:disabled {
  background: #9CA3AF;
  cursor: not-allowed;
}
```

## Settings & Configuration

### State: Dashboard Settings
```css
/* Settings Panel */
.settings-panel {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.settings-nav {
  display: flex;
  border-bottom: 2px solid #E5E7EB;
}

.settings-tab {
  padding: 16px 24px;
  font-size: 14px;
  font-weight: 500;
  color: #6B7280;
  background: none;
  border: none;
  cursor: pointer;
  position: relative;
}

.settings-tab.active {
  color: #6366F1;
}

.settings-tab.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: #6366F1;
}

/* Settings Content */
.settings-content {
  padding: 32px;
}

.settings-section {
  margin-bottom: 32px;
}

.settings-section:last-child {
  margin-bottom: 0;
}

.section-header {
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 4px;
}

.section-description {
  font-size: 14px;
  color: #6B7280;
}

/* Notification Settings */
.notification-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.notification-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #F9FAFB;
  border-radius: 8px;
}

.notification-info {
  flex: 1;
}

.notification-label {
  font-size: 14px;
  font-weight: 500;
  color: #1A1A1A;
  margin-bottom: 4px;
}

.notification-help {
  font-size: 13px;
  color: #6B7280;
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  width: 48px;
  height: 24px;
  background: #E5E7EB;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.toggle-switch.active {
  background: #6366F1;
}

.toggle-knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: transform 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle-switch.active .toggle-knob {
  transform: translateX(24px);
}

/* Response Templates */
.template-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.template-item {
  padding: 16px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  position: relative;
}

.template-name {
  font-size: 14px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 8px;
}

.template-preview {
  font-size: 13px;
  color: #6B7280;
  line-height: 1.5;
}

.template-actions {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  gap: 8px;
}

.template-action {
  width: 28px;
  height: 28px;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-template-btn {
  width: 100%;
  padding: 12px;
  border: 2px dashed #E5E7EB;
  border-radius: 8px;
  background: none;
  color: #6B7280;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-template-btn:hover {
  border-color: #6366F1;
  color: #6366F1;
  background: #F0F1FF;
}
```

## Mobile Views

### State: Mobile Dashboard
```css
/* Mobile Layout (320-767px) */
@media (max-width: 767px) {
  .dashboard-container {
    grid-template-columns: 1fr;
    grid-template-rows: 60px 1fr 60px;
  }
  
  .dashboard-header {
    padding: 0 16px;
    height: 60px;
  }
  
  .dashboard-sidebar {
    display: none;
  }
  
  .dashboard-main {
    padding: 16px;
    height: calc(100vh - 120px);
  }
  
  /* Mobile Navigation */
  .mobile-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: white;
    border-top: 1px solid #E5E7EB;
    display: flex;
    justify-content: space-around;
    align-items: center;
    z-index: 100;
  }
  
  .nav-item {
    flex: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #9CA3AF;
    position: relative;
  }
  
  .nav-item.active {
    color: #6366F1;
  }
  
  .nav-icon {
    width: 24px;
    height: 24px;
    margin-bottom: 4px;
  }
  
  .nav-label {
    font-size: 11px;
    font-weight: 500;
  }
  
  .nav-badge {
    position: absolute;
    top: 8px;
    right: calc(50% - 16px);
    width: 18px;
    height: 18px;
    background: #EF4444;
    color: white;
    border-radius: 50%;
    font-size: 10px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  /* Mobile Lead Cards */
  .lead-card {
    padding: 16px;
  }
  
  .lead-details {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .lead-actions {
    position: fixed;
    bottom: 70px;
    left: 16px;
    right: 16px;
    background: white;
    padding: 12px;
    border-radius: 12px;
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
    display: none;
  }
  
  .lead-card.selected .lead-actions {
    display: flex;
  }
  
  /* Mobile Detail Panel */
  .lead-detail-panel {
    width: 100%;
    top: 0;
    height: 100vh;
  }
  
  /* Mobile Metrics */
  .metrics-bar {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  
  .metric-card {
    padding: 16px;
  }
  
  .metric-value {
    font-size: 24px;
  }
  
  /* Mobile Analytics */
  .chart-card {
    grid-column: span 12 !important;
  }
  
  .chart-period {
    flex-wrap: wrap;
  }
  
  /* Mobile Response Modal */
  .modal-content {
    width: 100%;
    height: 100vh;
    max-width: none;
    max-height: none;
    border-radius: 0;
  }
  
  .option-grid {
    grid-template-columns: 1fr;
  }
  
  /* Mobile Settings */
  .settings-nav {
    overflow-x: auto;
  }
  
  .settings-content {
    padding: 20px 16px;
  }
}

/* Tablet Adaptations (768-1023px) */
@media (min-width: 768px) and (max-width: 1023px) {
  .dashboard-container {
    grid-template-columns: 200px 1fr;
  }
  
  .dashboard-sidebar {
    width: 200px;
  }
  
  .metrics-bar {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .lead-detail-panel {
    width: 400px;
  }
  
  .chart-card.half,
  .chart-card.one-third {
    grid-column: span 6;
  }
  
  .chart-card.two-thirds {
    grid-column: span 12;
  }
}
```

## Related Documentation
- [User Journey](./user-journey.md)
- [Interaction Patterns](./interactions.md)
- [Implementation Guide](./implementation.md)
- [Component Library](../../design-system/components/)