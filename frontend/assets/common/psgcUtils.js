import {
    regions as psgcRegions,
    provinces as psgcProvinces,
    municipalities as psgcMunicipalities,
    barangays as psgcBarangays,
} from 'psgc';

const REGIONS = psgcRegions.all();
const PROVINCES = psgcProvinces.all();
const MUNICIPALITIES = psgcMunicipalities.all();
const BARANGAYS = psgcBarangays.all();

export const normalizePsgcCityName = (value = '') => {
    return String(value)
        .toLowerCase()
        .replace(/[.,]/g, '')
        .replace(/\b(city|municipality)\s+of\b/g, '')
        .replace(/\b(city|municipality)\b/g, '')
        .replace(/\s+/g, ' ')
        .trim();
};

export const getPsgcRegions = () => REGIONS;

export const findPsgcRegionByNameOrDesignation = (value = '') => {
    return REGIONS.find(
        (region) => region.name === value || region.designation === value
    );
};

export const getPsgcProvincesByRegion = (regionDesignation = '') => {
    if (!regionDesignation) return [];
    return PROVINCES.filter((province) => province.region === regionDesignation);
};

export const getPsgcMunicipalitiesByProvince = (provinceName = '') => {
    if (!provinceName) return [];
    return MUNICIPALITIES.filter((city) => city.province === provinceName);
};

export const getPsgcBarangaysByCity = ({ province = '', cityMunicipality = '' }) => {
    if (!cityMunicipality) return [];

    const municipality = MUNICIPALITIES.find(
        (city) => city.province === province && city.name === cityMunicipality
    ) || MUNICIPALITIES.find(
        (city) => normalizePsgcCityName(city.name) === normalizePsgcCityName(cityMunicipality)
    );

    const nestedBarangayNames = Array.isArray(municipality?.barangays)
        ? municipality.barangays
            .map((barangay) => (typeof barangay === 'string' ? barangay : barangay?.name))
            .filter(Boolean)
        : [];

    const selectedCityNormalized = normalizePsgcCityName(cityMunicipality);
    const globalBarangayNames = BARANGAYS
        .filter((barangay) => normalizePsgcCityName(barangay.citymun) === selectedCityNormalized)
        .map((barangay) => barangay.name)
        .filter(Boolean);

    // PSGC package models Manila barangays under district labels with 1339 prefix.
    const manilaDistrictBarangays =
        province === 'Metro Manila' && selectedCityNormalized === 'manila'
            ? BARANGAYS
                .filter((barangay) => String(barangay.code).startsWith('1339'))
                .map((barangay) => barangay.name)
                .filter(Boolean)
            : [];

    return Array.from(new Set([
        ...nestedBarangayNames,
        ...globalBarangayNames,
        ...manilaDistrictBarangays,
    ]))
        .sort((a, b) => a.localeCompare(b))
        .map((name) => ({ name }));
};
