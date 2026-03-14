# HardwareHavenExpoV2 — Copilot Instructions

## Project Overview
- **App Name:** HardwareHavenExpo — A hardware store e-commerce mobile + web application
- **Frontend:** React Native (Expo SDK 54) with React Navigation, React Native Paper, Redux
- **Backend:** Express.js + MongoDB (Mongoose) REST API
- **Platforms:** Android, iOS, and Web (via react-native-web)

## Architecture & Conventions

### Environment Variables
- **Frontend:** All env vars live in `frontend/.env` (single source of truth). Never create `.env.production`. Access via `@env` or direct import from `assets/common/baseurl.js`.
- **Backend:** Env vars live in `backend/.env`. Variables: `CONNECTION_STRING`, `API_URL`, `SECRET`, `PORT`.
- **Never** hardcode IPs. Use `0.0.0.0` for the backend bind address and configure `baseurl.js` dynamically.

### Network Configuration
- Backend binds to `0.0.0.0` (all interfaces) so any device on the local network can connect.
- `baseurl.js` reads from `frontend/.env` for the `API_URL`.
- The API base URL pattern: `http://<HOST_IP>:<PORT>/api/v1/`

### Authentication
- **Traditional login:** Email/password via backend JWT (`/api/v1/users/login`).
- **Firebase login:** Firebase JS SDK (`firebase` package) for email/password auth in the frontend. After Firebase auth, the app calls `/api/v1/users/firebase-login` to obtain a backend JWT token. Config in `frontend/config/firebase.js`.
- **Auth state:** React Context (`Context/Store/Auth.js`, `AuthGlobal.js`). Actions in `Context/Actions/Auth.actions.js` include `loginUser`, `firebaseLoginUser`, `logoutUser`.
- **JWT persistence:** Stored through `frontend/assets/common/tokenStorage.js`.
	- Native (Android/iOS): `expo-secure-store`
	- Web fallback: `AsyncStorage`
- **Backend endpoints:** `POST /users/login` (traditional), `POST /users/firebase-login` (Firebase), `POST /users/register`.

### Image Uploads & Cloudinary
- **Cloudinary** is used for all image uploads (avatars, product images, gallery images).
- **Frontend config:** `frontend/config/cloudinary.js` — set `cloudName` and `uploadPreset` (unsigned upload preset).
- **Upload helper:** `frontend/assets/common/cloudinaryUpload.js` — exports `uploadToCloudinary(uri, folder)` and `uploadMultipleToCloudinary(uris, folder)`.
- Images are uploaded from the frontend directly to Cloudinary's REST API. The returned `secure_url` is sent to the backend as a string (no multipart form data needed for Cloudinary URLs).
- **Backend** accepts both multipart file uploads (legacy/fallback via Multer) and Cloudinary URL strings in the `image` field.
- **Product gallery:** Multiple images can be uploaded. The `images` field is sent as a JSON stringified array of URLs.
- **Folders:** Avatars go to `hardwarehaven/avatars`, products go to `hardwarehaven/products`.

### Form Validation
- Centralized validation in `frontend/Shared/FormValidation.js`.
- Exports: `validateField(name, value)`, `validateForm(fields)`, `hasErrors(errors)`.
- All forms use per-field error display with the `<Error>` component.
- Errors clear on input change for better UX.
- Validated forms: Login, Register, ProductForm, Categories (add), Checkout (shipping).

### Philippine Address System (ph-locations)
- The `ph-locations` package provides cascading Region → Province → City/Municipality data for Philippine addresses.
- Used in the **Register** screen for user address input.
- **User model** includes: `region`, `province`, `cityMunicipality`, `barangay`, `street`, `zip`, `country`.
- Pickers cascade: selecting a region filters provinces, selecting a province filters cities/municipalities.

### Theme System
- The app uses a **dark hardware-store theme** defined in `frontend/Theme/theme.js`.
- All colors must come from the theme — never use hardcoded strings like `'white'`, `'gainsboro'`, `'orange'`.
- Theme context is provided via `ThemeProvider` wrapping the app in `App.js`.
- Access theme in any component via `useTheme()` hook from `frontend/Theme/theme.js`.

### Color Palette (Dark Hardware Theme)
| Token              | Value     | Usage                              |
|--------------------|-----------|------------------------------------|
| `background`       | `#1a1a2e` | Screen/page backgrounds            |
| `surface`          | `#16213e` | Cards, surfaces, elevated areas    |
| `surfaceLight`     | `#1f3460` | Lighter surface variant            |
| `primary`          | `#ff6600` | Primary accents, CTAs, active tabs |
| `primaryDark`      | `#cc5200` | Pressed/dark variant of primary    |
| `secondary`        | `#00b4d8` | Secondary actions, links           |
| `accent`           | `#ffd60a` | Badges, highlights, prices         |
| `text`             | `#e8e8e8` | Primary text on dark backgrounds   |
| `textSecondary`    | `#a0a0b0` | Muted/secondary text               |
| `textOnPrimary`    | `#ffffff` | Text on primary-colored backgrounds|
| `danger`           | `#e74c3c` | Errors, delete, destructive        |
| `success`          | `#2ecc71` | Success, available, confirm        |
| `warning`          | `#f39c12` | Warnings, shipped status           |
| `border`           | `#2a2a4a` | Borders & dividers                 |
| `inputBg`          | `#1f2b47` | Input field backgrounds            |
| `cardBg`           | `#16213e` | Product cards, order cards         |
| `headerBg`         | `#0f1626` | Header/nav backgrounds             |
| `tabBarBg`         | `#0f1626` | Bottom tab bar background          |
| `overlay`          | `rgba(0,0,0,0.7)` | Modal overlays              |

### Alert System
- Use `frontend/Shared/SweetAlert.js` for user confirmations and feedback (delete, success, error).
- SweetAlert wraps a custom modal with styled buttons following the dark theme.
- Never use raw `Alert.alert()` for important user interactions — prefer SweetAlert.

### Responsive Design
- Import scaling utilities from `assets/common/responsive.js`.
- Use `widthScale`, `fontScale`, `moderateScale` for dimension values.
- Use `responsiveValue()` for breakpoint-based values (mobile/tablet/desktop).
- Use `getGridColumns()` and `getCardWidth()` for product grids.

### Component Patterns
- Shared UI components live in `frontend/Shared/`.
- Styled components use `styled-components/native` in `Shared/StyledComponents/`.
- Product screens in `Screens/Product/`, Admin in `Screens/Admin/`, Auth in `Screens/User/`.
- All navigators in `Navigators/` — DrawerNavigator wraps Main (bottom tabs).

### Coding Style
- Functional components with hooks (no class components).
- State management: Redux for cart, React Context for auth.
- Use `react-native-paper` components (Surface, Text, Searchbar, etc.) — they inherit Paper theme.
- Toast notifications via `react-native-toast-message`.
- Axios for API calls with `baseURL` from `assets/common/baseurl.js`.

### File Naming
- PascalCase for component files: `ProductCard.js`, `SweetAlert.js`
- camelCase for utility files: `baseurl.js`, `responsive.js`, `theme.js`
- Folders use PascalCase: `Screens/`, `Shared/`, `Navigators/`, `Theme/`

### Key Config Files
| File | Purpose |
|------|---------|
| `frontend/config/firebase.js` | Firebase app + auth initialization |
| `frontend/config/cloudinary.js` | Cloudinary cloud name & upload preset |
| `frontend/Shared/FormValidation.js` | Centralized form validation utilities |
| `frontend/assets/common/cloudinaryUpload.js` | Cloudinary upload helpers |
| `frontend/config/api.js` | API base URL configuration |
| `frontend/assets/common/tokenStorage.js` | Secure JWT storage helper (SecureStore/native, AsyncStorage/web) |

## Build & Run
```bash
# Backend
cd backend && npm start

# Frontend (Expo Go)
cd frontend && npm start

# Frontend (Web)
cd frontend && npm run web
```

## Setup Checklist
1. Set Firebase credentials in `frontend/config/firebase.js`
2. Set Cloudinary credentials in `frontend/config/cloudinary.js` (cloud name + unsigned upload preset)
3. Set backend MongoDB connection string in `backend/config/.env`
4. Set `API_HOST` in `frontend/assets/common/baseurl.js` to your machine's LAN IP

---

## Functional Requirements

### FR1 — Product/Service CRUD
- Admin can **create, read, update, and delete** products via `Screens/Admin/ProductForm.js` and `Screens/Admin/Products.js`.
- Image upload supports **file picker** and **camera** capture.
- Images are uploaded to **Cloudinary** (`hardwarehaven/products`). Multiple gallery images per product.
- Backend endpoints: `GET/POST /products`, `GET/PUT/DELETE /products/:id`, `PUT /products/gallery-images/:id`.

### FR2 — User Login / Registration / Profile
- **Traditional login:** Email + password → backend JWT (`/users/login`).
- **Google/Firebase login:** Firebase JS SDK (`firebase/auth`) with `signInWithEmailAndPassword`. After Firebase auth, the frontend calls `POST /users/firebase-login` to obtain a backend JWT.
- **Registration:** `Screens/User/Register.js` — collects name, email, password, phone, Philippine address (ph-locations cascading pickers), and avatar (camera or file upload → Cloudinary).
- **Update profile:** `Screens/User/UserProfile.js` — user can update name, email, phone, image (upload or camera). Backend: `PUT /users/:id`.
- Firebase config: `frontend/config/firebase.js`. Auth actions: `loginUser`, `firebaseLoginUser`, `logoutUser` in `Context/Actions/Auth.actions.js`.

### FR3 — Reviews & Ratings
- Users can **leave a review/rating** on products they have verified purchased (order status completed).
- Users can **update their own reviews/ratings** but cannot edit other users' reviews.
- **Review model** (backend): `user`, `product`, `rating` (1–5), `comment`, `dateCreated`.
- Backend endpoints: `POST /reviews`, `GET /reviews/product/:productId`, `PUT /reviews/:id`, `DELETE /reviews/:id`.
- Frontend: Review form on `SingleProduct.js`, review list display, star rating component.
- Product model's `rating` and `numReviews` are recalculated automatically when reviews are added/updated/deleted.
- **Redux**: Review state managed via Redux (actions, reducers, constants).

### FR4 — Cart Persistence with SQLite
- Cart contents are **saved to SQLite** (`expo-sqlite`) so they survive app restarts.
- On app open, cart items are **loaded from SQLite** into Redux state.
- After successful checkout (order placed), SQLite cart table is **cleared**.
- SQLite helper: `frontend/assets/common/cartDB.js` — exports `initCartDB()`, `saveCartItems(items)`, `loadCartItems()`, `clearCart()`.
- Redux cart actions (`Redux/Actions/cartActions.js`) sync with SQLite on add/remove/clear.

### FR5 — Order Status Updates & Push Notifications
- Admin can **update the status** of an order (Pending → Processing → Shipped).
- Buyer confirms delivery (Shipped → Delivered), then order is locked.
- Backend: `PUT /orders/:id` updates status and **sends a push notification** to the user via Expo Push API.
- **Push token** is saved on the **User model** (`pushTokens: [String]`). Stale/invalid tokens are removed on failed delivery.
- Clicking the notification **deep-links** to the order details screen (`Screens/Orders/OrderDetail.js` or similar).
- Status values used in system: `Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled`.
- Backend helper: `helpers/pushNotifications.js` — sends Expo push notifications.

### FR6 — Search, Category Filter & Price Range
- `Screens/Product/ProductContainer.js` provides a **search bar** for product name search.
- **Category filter:** Users can filter search results by one or more categories (via `CategoryFilter.js`).
- **Price range filter:** Users can filter products by a minimum and maximum price range (slider or inputs).
- Backend supports query params: `GET /products?categories=id1,id2&priceMin=100&priceMax=500&search=keyword`.

### FR7 — Promotional Push Notifications
- Admin can **send push notifications** about product promotions/discounts to all registered users.
- Backend: `POST /promotions` — creates a promotion and sends notifications to target users.
- Targeting modes: `all`, `top_buyers`, `big_spenders`, `specific`.
- Delivery channels: in-app notification (Socket.IO) + Expo push API.
- Users receive the notification and can **tap to view promotion details** (deep-link to the product or a promotions screen).
- Notification history can be stored in a **Notification model** for in-app viewing.

### FR8 — Redux State Management
- **Cart:** Already managed via Redux (`Redux/Actions/cartActions.js`, `Redux/Reducers/cartItems.js`).
- **Orders:** Implemented via `Redux/Actions/orderActions.js` and `Redux/Reducers/orderReducer.js`.
- **Products:** Implemented via `Redux/Actions/productActions.js` and `Redux/Reducers/productReducer.js`.
- **Reviews:** Redux actions/reducers for fetching, creating, updating, deleting reviews.
- Redux store: `Redux/store.js` — combines all reducers. Middleware: `redux-thunk` for async actions.

### FR9 — User Interface (Drawer Navigation)
- App uses a **DrawerNavigator** (`Navigators/DrawerNavigator.js`) wrapping the main bottom tab navigator.
- Drawer content: `Shared/DrawerContent.js` — shows user info, navigation links (Home, Cart, Profile, Admin, Orders).
- Bottom tabs: Home, Cart, Admin, User (via `Navigators/Main.js`).
- Dark hardware-store theme applied globally. All screens follow the theme color palette.
- Responsive layout via `assets/common/responsive.js`.

### FR10 — Backend, JWT on SQLite/SecureStore & Push Tokens
- **Node.js/Express backend** with JWT authentication for protected routes.
- **JWT tokens** stored on the client using **SQLite** or **Expo SecureStore** (`expo-secure-store`) instead of plain AsyncStorage for improved security.
- Helper: `frontend/assets/common/tokenStorage.js` — exports `saveToken(token)`, `getToken()`, `removeToken()`. Uses SecureStore on native, falls back to AsyncStorage on web.
- **Push notification tokens** saved on the **User model** (`pushTokens` array). Backend endpoints to register/update tokens: `POST /users/push-token`, `DELETE /users/push-token`.
- Stale tokens are **automatically removed** when Expo push API returns `DeviceNotRegistered` errors.
- Backend JWT middleware (`helpers/jwt.js`) validates tokens on protected routes.
