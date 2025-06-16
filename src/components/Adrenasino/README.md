# Adrenasino Game - Clean Architecture

This directory contains the Adrenasino game.

## Architecture Overview

The game is organized into several layers:

### 1. Configuration (`config/`)

- **GameConfig.ts**: Centralized configuration for all game settings, assets, and constants

### 2. Entities (`entities/`)

- **Player.ts**: Player entity with movement, animations, and physics

### 3. Services (`services/`)

- **AssetLoader.ts**: Handles loading of all game assets (external and local)
- **TilemapService.ts**: Manages tilemap creation and collision setup
- **UIService.ts**: Handles all UI elements and text creation
- **InteractionService.ts**: Manages player interactions with game objects
- **InventoryService.ts**: Handles inventory system and item management

### 4. Data (`data/`)

- **InventoryData.ts**: Contains inventory item definitions and initial data

### 5. Scenes (`scenes/`)

- **MainScene.ts**: Main game scene that orchestrates all services

## Key Features

### Clean Separation of Concerns

- Each service has a single responsibility
- Configuration is centralized and easily modifiable
- Entities are self-contained with their own logic

### Modular Design

- Services can be easily extended or replaced
- Clear interfaces between components
- Easy to test individual components

### Asset Management

- Centralized asset loading through AssetLoader service
- Support for both external and local assets
- Easy to add new assets or change asset sources

### Player System

- Encapsulated player logic in Player entity
- Clean animation and movement handling
- Physics integration

### Inventory System

- Modular inventory service
- Easy to extend with new item types
- Clean separation from UI logic

## Usage

### Basic Setup

```typescript
import { MainScene } from './game/scenes/MainScene';

// In your Phaser game config
const config = {
  scene: MainScene,
  // ... other config
};
```

### Adding New Services

1. Create a new service class in `services/`
2. Follow the existing pattern with a constructor that takes the scene
3. Add the service to MainScene constructor
4. Initialize in the `initializeGame()` method

### Modifying Configuration

Edit `GameConfig.ts` to change:

- Game dimensions
- Player settings
- Asset paths
- UI styling
- Animation settings

### Adding New Assets

1. Add asset paths to `GameConfig.assets`
2. Update `AssetLoader.ts` to load the new assets
3. Use the assets in your services

## Benefits of This Architecture

1. **Maintainability**: Easy to find and modify specific functionality
2. **Testability**: Each service can be tested independently
3. **Scalability**: Easy to add new features without affecting existing code
4. **Reusability**: Services can be reused across different scenes
5. **Configuration**: All settings are centralized and easily modifiable

## Future Extensions

This architecture makes it easy to add:

- New game entities (NPCs, enemies, etc.)
- Additional services (audio, networking, etc.)
- New UI components
- Different game scenes
- Save/load functionality
- Multiplayer features
