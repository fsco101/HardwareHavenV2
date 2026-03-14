import { Dimensions, Platform, PixelRatio, useWindowDimensions as useRNWindowDimensions } from 'react-native';

// ─── Base design dimensions (standard mobile: 375 x 812) ───
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// ─── Breakpoints ───
export const BREAKPOINTS = {
    mobile: 0,
    tablet: 768,
    desktop: 1024,
    wide: 1440,
};

// ─── Get current window dimensions (updates on resize) ───
const getWindowDimensions = () => Dimensions.get('window');

// ─── React hook for live responsive dimensions ───
export const useResponsive = () => {
    const { width, height } = useRNWindowDimensions();
    const scaleX = width / BASE_WIDTH;
    const scaleY = height / BASE_HEIGHT;
    const widthScaleFactor = clamp(scaleX, 0.9, 1.15);
    const heightScaleFactor = clamp(scaleY, 0.9, 1.1);

    const deviceType = width >= BREAKPOINTS.wide
        ? 'wide'
        : width >= BREAKPOINTS.desktop
        ? 'desktop'
        : width >= BREAKPOINTS.tablet
        ? 'tablet'
        : 'mobile';

    const wp = (percentage) => {
        return Math.round((percentage / 100) * width);
    };

    const hp = (percentage) => {
        return Math.round((percentage / 100) * height);
    };

    const ws = (size) => {
        const newSize = size * widthScaleFactor;
        if (Platform.OS === 'web') return Math.round(newSize);
        return Math.round(PixelRatio.roundToNearestPixel(newSize));
    };

    const hs = (size) => {
        const newSize = size * heightScaleFactor;
        if (Platform.OS === 'web') return Math.round(newSize);
        return Math.round(PixelRatio.roundToNearestPixel(newSize));
    };

    const ms = (size, factor = 0.5) => {
        return Math.round(size + (size * (widthScaleFactor - 1)) * factor);
    };

    const fs = (size) => {
        const capped = clamp(Math.min(scaleX, scaleY), 0.95, 1.12);
        const newSize = size * capped;
        if (Platform.OS === 'web') return Math.round(newSize);
        return Math.round(PixelRatio.roundToNearestPixel(newSize));
    };

    const rv = (values) => {
        if (values[deviceType] !== undefined) return values[deviceType];
        if (deviceType === 'wide' && values.desktop !== undefined) return values.desktop;
        if ((deviceType === 'wide' || deviceType === 'desktop') && values.tablet !== undefined) return values.tablet;
        return values.mobile;
    };

    const columns = rv({ mobile: 2, tablet: 3, desktop: 4, wide: 6 });

    const cardWidth = (margin = 10) => (width - margin * (columns + 1)) / columns;

    const iconSize = (base) => ms(base, 0.3);

    const spacing = {
        xs: ms(4),
        sm: ms(8),
        md: ms(16),
        lg: ms(24),
        xl: ms(32),
        xxl: ms(48),
    };

    return {
        width,
        height,
        scaleX,
        scaleY,
        deviceType,
        isWeb: Platform.OS === 'web',
        wp,
        hp,
        ws,
        hs,
        ms,
        fs,
        rv,
        columns,
        cardWidth,
        iconSize,
        spacing,
    };
};

// ─── Static scale helpers (for non-hook contexts) ───
export const widthScale = (size) => {
    const { width } = getWindowDimensions();
    const scale = width / BASE_WIDTH;
    const newSize = size * clamp(scale, 0.9, 1.15);
    if (Platform.OS === 'web') {
        return Math.round(newSize);
    }
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

export const heightScale = (size) => {
    const { height } = getWindowDimensions();
    const scale = height / BASE_HEIGHT;
    const newSize = size * clamp(scale, 0.9, 1.1);
    if (Platform.OS === 'web') {
        return Math.round(newSize);
    }
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

export const moderateScale = (size, factor = 0.5) => {
    return Math.round(size + (widthScale(size) - size) * factor);
};

// ─── Font scaling (capped for large screens) ───
export const fontScale = (size) => {
    const { width, height } = getWindowDimensions();
    const scale = width / BASE_WIDTH;
    const scaleH = height / BASE_HEIGHT;
    const capped = clamp(Math.min(scale, scaleH), 0.95, 1.12);
    const newSize = size * capped;
    if (Platform.OS === 'web') {
        return Math.round(newSize);
    }
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// ─── Get current device type based on width ───
export const getDeviceType = () => {
    const { width } = getWindowDimensions();
    if (width >= BREAKPOINTS.wide) return 'wide';
    if (width >= BREAKPOINTS.desktop) return 'desktop';
    if (width >= BREAKPOINTS.tablet) return 'tablet';
    return 'mobile';
};

// ─── Check if current platform is web ───
export const isWeb = Platform.OS === 'web';

// ─── Responsive value: pick a value based on device type ───
// Usage: responsiveValue({ mobile: 2, tablet: 3, desktop: 4 })
export const responsiveValue = (values) => {
    const device = getDeviceType();
    if (values[device] !== undefined) return values[device];
    // Fallback chain: desktop → tablet → mobile
    if (device === 'wide' && values.desktop !== undefined) return values.desktop;
    if ((device === 'wide' || device === 'desktop') && values.tablet !== undefined)
        return values.tablet;
    return values.mobile;
};

// ─── Grid columns helper ───
// Returns the number of columns suited for the screen width
export const getGridColumns = () => {
    return responsiveValue({ mobile: 2, tablet: 3, desktop: 4, wide: 6 });
};

// ─── Container max-width for web (centered layout) ───
export const getContainerStyle = () => {
    if (!isWeb) return { flex: 1 };
    const { width } = getWindowDimensions();
    if (width >= BREAKPOINTS.wide) {
        return { flex: 1, maxWidth: 1200, alignSelf: 'center', width: '100%' };
    }
    if (width >= BREAKPOINTS.desktop) {
        return { flex: 1, maxWidth: 1024, alignSelf: 'center', width: '100%' };
    }
    return { flex: 1 };
};

// ─── Responsive card width (for product grids, etc.) ───
export const getCardWidth = (margin = 10) => {
    const { width } = getWindowDimensions();
    const columns = getGridColumns();
    const calculated = (width - margin * (columns + 1)) / columns;
    return Math.min(calculated, 220);
};

// ─── Platform-specific value ───
export const platformValue = ({ web, native }) => {
    return Platform.OS === 'web' ? web : native;
};

// ─── Width percentage ───
export const wp = (percentage) => {
    const { width } = getWindowDimensions();
    return Math.round((percentage / 100) * width);
};

// ─── Height percentage ───
export const hp = (percentage) => {
    const { height } = getWindowDimensions();
    return Math.round((percentage / 100) * height);
};
