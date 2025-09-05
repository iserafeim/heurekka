---
title: iOS Design Guidelines
description: iOS-specific design adaptations following Human Interface Guidelines
last-updated: 2025-01-04
version: 1.0.0
related-files: 
  - ./README.md
  - ./android.md
  - ./web.md
status: approved
---

# iOS Design Guidelines

## Overview
Heurekka for iOS follows Apple's Human Interface Guidelines while maintaining our brand identity, creating an experience that feels native to iOS users while delivering our unique value proposition.

## iOS Design Principles

### Clarity
- Text is legible at every size
- Icons are precise and lucid
- Adornments are subtle and appropriate
- Negative space is used effectively

### Deference
- Content fills the entire screen
- Translucency and blurring hint at more
- Minimal use of bezels, gradients, and shadows
- Content is paramount

### Depth
- Visual layers and realistic motion
- Transitions provide depth perception
- Touch and discoverability heighten delight

## Navigation Patterns

### Tab Bar Navigation
```swift
// Bottom tab bar with 5 items max
TabView {
    SearchView()
        .tabItem {
            Label("Search", systemImage: "magnifyingglass")
        }
    
    SavedView()
        .tabItem {
            Label("Saved", systemImage: "heart")
        }
    
    AlertsView()
        .tabItem {
            Label("Alerts", systemImage: "bell")
        }
    
    ProfileView()
        .tabItem {
            Label("Profile", systemImage: "person")
        }
}
```

### Navigation Stack
```swift
NavigationStack {
    List(properties) { property in
        NavigationLink(destination: PropertyDetailView(property)) {
            PropertyRow(property)
        }
    }
    .navigationTitle("Properties")
    .navigationBarTitleDisplayMode(.large)
}
```

## Component Specifications

### Buttons
```swift
// Primary Button
Button(action: {}) {
    Text("View Details")
        .font(.headline)
        .foregroundColor(.white)
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color.blue)
        .cornerRadius(10)
}

// Secondary Button
Button(action: {}) {
    Text("Save Search")
        .font(.headline)
        .foregroundColor(.blue)
        .frame(maxWidth: .infinity)
        .padding()
        .overlay(
            RoundedRectangle(cornerRadius: 10)
                .stroke(Color.blue, lineWidth: 2)
        )
}
```

### Form Controls
```swift
// Text Input
TextField("Enter location", text: $location)
    .textFieldStyle(RoundedBorderTextFieldStyle())
    .autocapitalization(.none)

// Toggle Switch
Toggle("Enable notifications", isOn: $notificationsEnabled)
    .toggleStyle(SwitchToggleStyle())

// Picker
Picker("Property Type", selection: $propertyType) {
    Text("House").tag(PropertyType.house)
    Text("Apartment").tag(PropertyType.apartment)
    Text("Condo").tag(PropertyType.condo)
}
.pickerStyle(MenuPickerStyle())
```

## iOS-Specific Features

### Safe Area Management
```swift
.ignoresSafeArea(edges: .top) // For full-screen images
.safeAreaInset(edge: .bottom) { // For custom tab bars
    CustomTabBar()
}
```

### Dynamic Type Support
```swift
Text("Property Details")
    .font(.largeTitle)
    .dynamicTypeSize(...DynamicTypeSize.accessibility5)
```

### Dark Mode
```swift
@Environment(\.colorScheme) var colorScheme

var backgroundColor: Color {
    colorScheme == .dark ? Color.black : Color.white
}
```

## Touch Interactions

### Gesture Recognition
```swift
// Swipe to delete
.swipeActions(edge: .trailing) {
    Button(role: .destructive) {
        deleteProperty()
    } label: {
        Label("Delete", systemImage: "trash")
    }
}

// Pull to refresh
.refreshable {
    await refreshProperties()
}

// Long press
.contextMenu {
    Button("Share", action: share)
    Button("Save", action: save)
    Button("Report", action: report)
}
```

### Haptic Feedback
```swift
// Impact feedback
let impact = UIImpactFeedbackGenerator(style: .medium)
impact.impactOccurred()

// Selection feedback
let selection = UISelectionFeedbackGenerator()
selection.selectionChanged()

// Notification feedback
let notification = UINotificationFeedbackGenerator()
notification.notificationOccurred(.success)
```

## System Integration

### Widgets
```swift
struct PropertyWidget: Widget {
    let kind: String = "PropertyWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            PropertyWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Saved Properties")
        .description("View your saved properties")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
```

### App Clips
```swift
// Lightweight version for quick property viewing
@main
struct PropertyClip: App {
    var body: some Scene {
        WindowGroup {
            PropertyQuickView()
                .onContinueUserActivity(NSUserActivityTypeBrowsingWeb) { activity in
                    handleUniversalLink(activity.webpageURL)
                }
        }
    }
}
```

## Performance Guidelines

### Image Optimization
```swift
AsyncImage(url: property.imageURL) { image in
    image
        .resizable()
        .aspectRatio(contentMode: .fill)
} placeholder: {
    ProgressView()
}
.frame(width: 300, height: 200)
```

### List Performance
```swift
List {
    ForEach(properties) { property in
        PropertyRow(property)
    }
}
.listStyle(PlainListStyle())
.scrollContentBackground(.hidden)
```

## Accessibility

### VoiceOver Support
```swift
Image("property")
    .accessibilityLabel("3 bedroom house in downtown")
    .accessibilityHint("Double tap to view details")
    .accessibilityTraits(.button)
```

### Dynamic Type
```swift
Text("Description")
    .font(.body)
    .minimumScaleFactor(0.5)
    .lineLimit(nil)
```

## Testing Checklist
- [ ] Test on all iPhone sizes
- [ ] Test on iPad
- [ ] Test Dynamic Island interactions
- [ ] Test with Dynamic Type sizes
- [ ] Test in Dark Mode
- [ ] Test with VoiceOver
- [ ] Test offline functionality
- [ ] Test performance on older devices

## Related Documentation
- [Platform Adaptations Overview](./README.md)
- [Design System](../README.md)
- [Component Library](../components/README.md)

## Last Updated
2025-01-04 - iOS platform guidelines