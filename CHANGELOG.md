# CHANGELOG — HardwareHavenExpoV2

## [2026-03-10] Dark Hardware Store Theme, SweetAlert, Env Config & Full UI/UX Overhaul

### 1. Copilot Instructions
- Created `.github/copilot-instructions.md` with full project documentation, conventions, color palette, and coding style.

### 2. Environment & Network Configuration
- **Backend `config/.env`**: Added `CONNECTION_STRING`, `API_URL`, `SECRET`, `PORT` variables.
- **Backend `app.js`**: Loads dotenv from `config/.env` path, binds to `0.0.0.0` for LAN access, uses `PORT` env var.
- **Frontend `config/.env`**: Added `API_HOST` and `API_PORT` variables.
- **Frontend `baseurl.js`**: Rewritten with configurable `API_HOST`/`API_PORT` constants instead of hardcoded IPs.

### 3. Theme System (New)
- **`Theme/theme.js`**: Dark hardware-store theme with `ThemeProvider`, `useTheme()` hook, and `darkColors` export.
- Color palette: background=#1a1a2e, surface=#16213e, primary=#ff6600, secondary=#00b4d8, accent=#ffd60a, text=#e8e8e8, danger=#e74c3c, success=#2ecc71, warning=#f39c12.

### 4. SweetAlert Component (New)
- **`Shared/SweetAlert.js`**: Custom modal component for confirmations/feedback with themed styling and Ionicons.
- Integrated into: Cart (clear cart), UserProfile (sign out), Confirm (order success), Admin Products (delete), Admin Categories (delete).

### 5. App.js Updated
- Wrapped with `ThemeProvider`, `PaperProvider` uses MD3DarkTheme with custom dark overrides, StatusBar set to light.

### 6. Shared Components Restyled
- **Header.js**: Text-based "Hardware Haven" branding, dark header background.
- **Banner.js**: Dark background, themed dots/borders.
- **CartIcon.js**: Primary badge, white text.
- **DrawerContent.js**: Dark surface, branded header, themed items.
- **Error.js**: Danger bg with opacity, bordered.
- **FormContainer.js**: Dark background, primary title.
- **Input.js**: Dark inputBg, themed border/text, borderRadius 12.
- **OrderCard.js**: Dark cardBg, left border status indicator, accent prices.
- **EasyButton.js**: Fixed import to `styled-components/native`, new color palette.
- **TrafficLight.js**: Updated status colors.

### 7. All Navigators Restyled
- **Main.js**: Dark tab bar (tabBarBg, border), primary active tint.
- **DrawerNavigator.js**: Dark drawer surface.
- **HomeNavigator.js**: Dark header via darkColors.
- **AdminNavigator.js**: Dark header via darkColors.
- **CheckoutNavigator.js**: Dark material top tabs.
- **CartNavigator.js**: Dark header via darkColors.
- **UserNavigator.js**: Dark header/card styles via darkColors.

### 8. All Screens Restyled with Dark Theme
- **ProductContainer.js**: Dark background, themed Searchbar, removed Surface wrapper.
- **ProductCard.js**: Dark card with border, accent price, primary Add button with icon.
- **ProductList.js**: Added navigation to Product Detail on press, dark background.
- **SingleProduct.js**: Full product detail page with image, description card, stock indicator, bottom add-to-cart bar.
- **SearchedProduct.js**: Dark list rows with avatar, navigation to Product Detail.
- **CategoryFilter.js**: Primary active badges, surfaceLight inactive.
- **Cart.js**: Dark cart items, themed swipe-to-delete, bottom bar with Clear/Checkout buttons, SweetAlert for clear cart.
- **Login.js**: Person icon circle, primary Login button, Register link, Error component.
- **Register.js**: Themed image picker, primary Register button, Login link.
- **UserProfile.js**: Avatar circle, info card with icons, SweetAlert for sign out.
- **Checkout.js**: Themed Picker, primary Continue button with icon.
- **Payment.js**: Card icon, themed radio buttons, styled Picker, Continue button.
- **Confirm.js**: Receipt icon, order detail card with icons, SweetAlert for order success, Place Order button.
- **Admin Products.js**: SweetAlert for delete confirmation, themed Searchbar, dark list header.
- **Admin ProductForm.js**: Themed Picker, labels, image picker with primary color.
- **Admin Categories.js**: SweetAlert for delete, dark item cards, themed bottom bar input.
- **Admin Orders.js**: Dark background.
- **Admin ListItem.js**: Dark modal with overlay, themed alternating row colors, accent prices.

---

## [2026-03-10] Setup & Responsive Utility

### 1. Backend — Dependency Installation
- Ran `npm install` inside `backend/`.
- All existing dependencies installed successfully (express, mongoose, cors, bcryptjs, jsonwebtoken, etc.).
- **169 packages** added.

### 2. Frontend — Dependency Installation
- Ran `npm install --legacy-peer-deps` inside `frontend/` (required due to React 19.1 peer-dep conflicts).
- **858 packages** installed from existing `package.json`.

### 3. Frontend — Web Platform Support (New Packages)
Added the three packages required to run an Expo project on the web via `npx expo install`:

| Package               | Version   | Purpose                                           |
|-----------------------|-----------|---------------------------------------------------|
| `react-dom`           | 19.1.0    | React DOM renderer for web                        |
| `react-native-web`    | ^0.21.0   | Maps React Native components to web DOM elements  |
| `@expo/metro-runtime` | ~6.1.2    | Enables Metro bundler's fast-refresh on web       |

The project can now run on **Android**, **iOS**, and **Web**:
```bash
npm start          # Expo Go (mobile)
npm run web        # Web browser
npm run android    # Android emulator / device
npm run ios        # iOS simulator / device
```

### 4. Frontend — `assets/common/responsive.js` (New File)
Created a cross-platform responsive utility at `frontend/assets/common/responsive.js`.

#### Exports

| Export              | Description                                                                              |
|---------------------|------------------------------------------------------------------------------------------|
| `BREAKPOINTS`       | Breakpoint constants — `mobile: 0`, `tablet: 768`, `desktop: 1024`, `wide: 1440`        |
| `widthScale(size)`  | Scales a value proportionally to screen width (base: 375px)                              |
| `heightScale(size)` | Scales a value proportionally to screen height (base: 812px)                             |
| `moderateScale(size, factor?)` | Blends original size with scaled size (default factor 0.5)                   |
| `fontScale(size)`   | Width-based font scaling, capped at 1.5× to prevent oversized text on large screens      |
| `getDeviceType()`   | Returns `'mobile'` / `'tablet'` / `'desktop'` / `'wide'` based on current window width   |
| `isWeb`             | Boolean — `true` when `Platform.OS === 'web'`                                            |
| `responsiveValue(values)` | Pick a value per device type, e.g. `responsiveValue({ mobile: 2, tablet: 3 })`    |
| `getGridColumns()`  | Returns appropriate column count: 2 / 3 / 4 / 5                                         |
| `getContainerStyle()` | Returns a centered max-width container style for web; plain `{ flex: 1 }` on native    |
| `getCardWidth(margin?)` | Calculates card width for a responsive grid                                          |
| `platformValue({ web, native })` | Returns a value based on the current platform                            |

#### Usage Examples

```js
import {
  widthScale as ws,
  fontScale as fs,
  getGridColumns,
  getCardWidth,
  responsiveValue,
  getContainerStyle,
} from '../../assets/common/responsive';

// Scale sizes
const styles = StyleSheet.create({
  container: {
    padding: ws(16),
    ...getContainerStyle(),
  },
  title: {
    fontSize: fs(18),
  },
  card: {
    width: getCardWidth(10),
  },
});

// Responsive column count
const numColumns = getGridColumns();

// Device-specific values
const headerHeight = responsiveValue({ mobile: 60, tablet: 80, desktop: 100 });
```
