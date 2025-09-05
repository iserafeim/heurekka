---
title: Android Design Guidelines
description: Android-specific design adaptations following Material Design 3
last-updated: 2025-01-04
version: 1.0.0
related-files: 
  - ./README.md
  - ./ios.md
  - ./web.md
status: approved
---

# Android Design Guidelines

## Overview
Heurekka for Android follows Material Design 3 principles while maintaining our brand identity, creating an experience that feels native to Android users with Material You personalization support.

## Material Design Principles

### Material as Metaphor
- Surfaces and edges provide visual cues
- Consistent use of elevation and shadows
- Realistic lighting and movement

### Bold, Graphic, Intentional
- Typography guides focus
- Color emphasizes actions
- Imagery is immersive

### Motion Provides Meaning
- Responses are immediate and appropriate
- Transitions are smooth and coherent
- Animation clarifies relationships

## Navigation Patterns

### Bottom Navigation
```kotlin
@Composable
fun BottomNavigation() {
    NavigationBar {
        NavigationBarItem(
            icon = { Icon(Icons.Filled.Search, contentDescription = "Search") },
            label = { Text("Search") },
            selected = currentRoute == "search",
            onClick = { navController.navigate("search") }
        )
        NavigationBarItem(
            icon = { Icon(Icons.Filled.Favorite, contentDescription = "Saved") },
            label = { Text("Saved") },
            selected = currentRoute == "saved",
            onClick = { navController.navigate("saved") }
        )
        NavigationBarItem(
            icon = { Icon(Icons.Filled.Notifications, contentDescription = "Alerts") },
            label = { Text("Alerts") },
            selected = currentRoute == "alerts",
            onClick = { navController.navigate("alerts") }
        )
        NavigationBarItem(
            icon = { Icon(Icons.Filled.Person, contentDescription = "Profile") },
            label = { Text("Profile") },
            selected = currentRoute == "profile",
            onClick = { navController.navigate("profile") }
        )
    }
}
```

### Navigation Drawer
```kotlin
@Composable
fun NavigationDrawer() {
    ModalNavigationDrawer(
        drawerContent = {
            ModalDrawerSheet {
                Text("Heurekka", modifier = Modifier.padding(16.dp))
                Divider()
                NavigationDrawerItem(
                    label = { Text(text = "Search") },
                    selected = false,
                    onClick = { }
                )
                NavigationDrawerItem(
                    label = { Text(text = "Saved Properties") },
                    selected = false,
                    onClick = { }
                )
            }
        }
    ) {
        // Main content
    }
}
```

## Component Specifications

### Buttons
```kotlin
// Filled Button (Primary)
FilledButton(
    onClick = { },
    modifier = Modifier.fillMaxWidth()
) {
    Text("View Details")
}

// Outlined Button (Secondary)
OutlinedButton(
    onClick = { },
    modifier = Modifier.fillMaxWidth()
) {
    Text("Save Search")
}

// Text Button (Tertiary)
TextButton(onClick = { }) {
    Text("Learn More")
}

// Floating Action Button
FloatingActionButton(
    onClick = { },
    containerColor = MaterialTheme.colorScheme.primary
) {
    Icon(Icons.Default.Add, contentDescription = "Add")
}
```

### Form Controls
```kotlin
// Text Field
OutlinedTextField(
    value = location,
    onValueChange = { location = it },
    label = { Text("Location") },
    leadingIcon = { Icon(Icons.Default.LocationOn, contentDescription = null) },
    modifier = Modifier.fillMaxWidth()
)

// Switch
Switch(
    checked = notificationsEnabled,
    onCheckedChange = { notificationsEnabled = it }
)

// Checkbox
Checkbox(
    checked = checked,
    onCheckedChange = { checked = it }
)

// Dropdown Menu
ExposedDropdownMenuBox(
    expanded = expanded,
    onExpandedChange = { expanded = !expanded }
) {
    TextField(
        value = selectedOption,
        onValueChange = {},
        readOnly = true,
        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded) },
        modifier = Modifier.menuAnchor()
    )
    ExposedDropdownMenu(
        expanded = expanded,
        onDismissRequest = { expanded = false }
    ) {
        options.forEach { option ->
            DropdownMenuItem(
                text = { Text(option) },
                onClick = {
                    selectedOption = option
                    expanded = false
                }
            )
        }
    }
}
```

## Material You (M3) Features

### Dynamic Color
```kotlin
@Composable
fun HeurekkaTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = true,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }
    
    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
```

### Color Roles
```kotlin
val LightColorScheme = lightColorScheme(
    primary = Color(0xFF0066FF),
    onPrimary = Color.White,
    primaryContainer = Color(0xFFE6F0FF),
    onPrimaryContainer = Color(0xFF001433),
    secondary = Color(0xFF9333FF),
    onSecondary = Color.White,
    secondaryContainer = Color(0xFFF3E6FF),
    onSecondaryContainer = Color(0xFF2B0C5B),
    surface = Color.White,
    onSurface = Color(0xFF1C1B1F),
    surfaceVariant = Color(0xFFF5F5F5),
    onSurfaceVariant = Color(0xFF49454F)
)
```

## Motion and Animation

### Transition Animations
```kotlin
// Shared element transition
AnimatedVisibility(
    visible = isVisible,
    enter = fadeIn() + expandVertically(),
    exit = fadeOut() + shrinkVertically()
) {
    PropertyCard(property)
}

// Cross-fade
Crossfade(targetState = screen) { targetScreen ->
    when (targetScreen) {
        Screen.List -> PropertyList()
        Screen.Detail -> PropertyDetail()
    }
}
```

### Motion Specs
```kotlin
object MotionTokens {
    val EasingStandardCurve = CubicBezierEasing(0.4f, 0.0f, 0.2f, 1.0f)
    val EasingDecelerateCurve = CubicBezierEasing(0.0f, 0.0f, 0.2f, 1.0f)
    val EasingAccelerateCurve = CubicBezierEasing(0.4f, 0.0f, 1.0f, 1.0f)
    
    const val DurationShort1 = 75
    const val DurationShort2 = 150
    const val DurationMedium1 = 200
    const val DurationMedium2 = 300
    const val DurationLong1 = 450
    const val DurationLong2 = 600
}
```

## Elevation and Shadows

### Elevation Levels
```kotlin
Card(
    modifier = Modifier.padding(8.dp),
    elevation = CardDefaults.cardElevation(
        defaultElevation = 2.dp,
        pressedElevation = 8.dp,
        hoveredElevation = 4.dp
    )
) {
    // Card content
}
```

### Surface Tones
```kotlin
Surface(
    modifier = Modifier.fillMaxWidth(),
    tonalElevation = 3.dp, // Material You tonal elevation
    shadowElevation = 2.dp
) {
    // Surface content
}
```

## Touch Feedback

### Ripple Effects
```kotlin
Box(
    modifier = Modifier
        .clickable(
            interactionSource = remember { MutableInteractionSource() },
            indication = rememberRipple(bounded = true)
        ) { onClick() }
) {
    // Content
}
```

### Haptic Feedback
```kotlin
val haptics = LocalHapticFeedback.current

Button(
    onClick = {
        haptics.performHapticFeedback(HapticFeedbackType.LongPress)
        // Action
    }
) {
    Text("Press Me")
}
```

## System Integration

### Edge-to-Edge Display
```kotlin
WindowCompat.setDecorFitsSystemWindows(window, false)

Scaffold(
    modifier = Modifier.navigationBarsPadding(),
    topBar = {
        TopAppBar(
            modifier = Modifier.statusBarsPadding()
        )
    }
) { paddingValues ->
    // Content
}
```

### App Widgets
```kotlin
class PropertyWidget : GlanceAppWidget() {
    override suspend fun provideGlance(context: Context, id: GlanceId) {
        provideContent {
            MaterialTheme {
                PropertyWidgetContent()
            }
        }
    }
}
```

### Notifications
```kotlin
fun showPropertyNotification(context: Context, property: Property) {
    val notification = NotificationCompat.Builder(context, CHANNEL_ID)
        .setSmallIcon(R.drawable.ic_notification)
        .setContentTitle("New Property Match")
        .setContentText(property.title)
        .setStyle(NotificationCompat.BigPictureStyle()
            .bigPicture(property.image))
        .setPriority(NotificationCompat.PRIORITY_DEFAULT)
        .build()
    
    NotificationManagerCompat.from(context)
        .notify(property.id, notification)
}
```

## Responsive Design

### Window Size Classes
```kotlin
@Composable
fun AdaptiveLayout() {
    val windowSizeClass = calculateWindowSizeClass()
    
    when (windowSizeClass.widthSizeClass) {
        WindowWidthSizeClass.Compact -> CompactLayout()
        WindowWidthSizeClass.Medium -> MediumLayout()
        WindowWidthSizeClass.Expanded -> ExpandedLayout()
    }
}
```

### Foldable Support
```kotlin
@Composable
fun FoldableAwareLayout() {
    val windowLayoutInfo = rememberWindowLayoutInfo()
    val foldingFeature = windowLayoutInfo.displayFeatures
        .filterIsInstance<FoldingFeature>()
        .firstOrNull()
    
    if (foldingFeature?.state == FoldingFeature.State.HALF_OPENED) {
        DualPaneLayout()
    } else {
        SinglePaneLayout()
    }
}
```

## Performance

### Image Loading
```kotlin
AsyncImage(
    model = ImageRequest.Builder(context)
        .data(property.imageUrl)
        .crossfade(true)
        .build(),
    contentDescription = property.title,
    modifier = Modifier.fillMaxWidth()
)
```

### List Performance
```kotlin
LazyColumn(
    modifier = Modifier.fillMaxSize(),
    contentPadding = PaddingValues(16.dp),
    verticalArrangement = Arrangement.spacedBy(8.dp)
) {
    items(
        items = properties,
        key = { it.id }
    ) { property ->
        PropertyCard(property)
    }
}
```

## Accessibility

### Content Descriptions
```kotlin
Icon(
    imageVector = Icons.Default.Favorite,
    contentDescription = if (isSaved) "Remove from saved" else "Save property",
    modifier = Modifier.semantics {
        role = Role.Button
    }
)
```

### Touch Targets
```kotlin
IconButton(
    onClick = { },
    modifier = Modifier.sizeIn(minWidth = 48.dp, minHeight = 48.dp)
) {
    Icon(Icons.Default.MoreVert, contentDescription = "More options")
}
```

## Testing Checklist
- [ ] Test on various Android versions (API 21+)
- [ ] Test on different screen sizes
- [ ] Test on foldable devices
- [ ] Test with TalkBack enabled
- [ ] Test with different font scales
- [ ] Test in Dark Mode
- [ ] Test Material You theming
- [ ] Test offline functionality
- [ ] Test on low-end devices

## Related Documentation
- [Platform Adaptations Overview](./README.md)
- [Design System](../README.md)
- [Component Library](../components/README.md)

## Last Updated
2025-01-04 - Android platform guidelines