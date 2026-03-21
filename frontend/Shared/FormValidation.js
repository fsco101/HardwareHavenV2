// ─── Form Validation Utilities ───
// Centralized validation functions for all forms in the app.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9]{10,13}$/;
const ZIP_REGEX = /^[0-9]{4,10}$/;
const RESET_CODE_REGEX = /^[0-9]{6}$/;

const normalize = (value) => (value == null ? '' : String(value).trim());
const isEmpty = (value) => normalize(value).length === 0;
const firstError = (...errors) => errors.find(Boolean) || '';
const required = (value, message) => (isEmpty(value) ? message : '');
const minLength = (value, min, message) => (value.length < min ? message : '');
const positiveNumber = (value, message) => {
    const n = Number(value);
    return Number.isNaN(n) || n <= 0 ? message : '';
};
const nonNegativeNumber = (value, message) => {
    const n = Number(value);
    return Number.isNaN(n) || n < 0 ? message : '';
};

/**
 * Validates a single field and returns an error message or empty string.
 */
export const validateField = (name, value, allFields = {}) => {
    const v = normalize(value);

    switch (name) {
        case 'email':
            return firstError(
                required(v, 'Email is required'),
                !EMAIL_REGEX.test(v.toLowerCase()) ? 'Please enter a valid email address' : ''
            );

        case 'password':
            return firstError(
                required(v, 'Password is required'),
                minLength(v, 6, 'Password must be at least 6 characters')
            );

        case 'oldPassword':
            return firstError(
                required(v, 'Old password is required'),
                minLength(v, 6, 'Password must be at least 6 characters')
            );

        case 'newPassword':
            return firstError(
                required(v, 'New password is required'),
                minLength(v, 6, 'Password must be at least 6 characters')
            );

        case 'confirmPassword': {
            const requiredError = required(v, 'Please confirm your password');
            if (requiredError) return requiredError;
            const compareWith = normalize(allFields.newPassword ?? allFields.password ?? '');
            if (compareWith && v !== compareWith) return 'Passwords do not match';
            return '';
        }

        case 'resetCode':
        case 'code':
            return firstError(
                required(v, 'Reset code is required'),
                !RESET_CODE_REGEX.test(v) ? 'Reset code must be 6 digits' : ''
            );

        case 'name':
            return firstError(required(v, 'Name is required'), minLength(v, 2, 'Name must be at least 2 characters'));

        case 'phone': {
            const requiredError = required(v, 'Phone number is required');
            if (requiredError) return requiredError;
            const digitsOnly = v.replace(/\D/g, '');
            if (!PHONE_REGEX.test(digitsOnly)) return 'Phone must be 10-13 digits';
            return '';
        }

        case 'brand':
            return required(v, 'Brand is required');

        case 'price':
        case 'discountedPrice':
            return firstError(required(v, 'Price is required'), positiveNumber(v, 'Price must be a positive number'));

        case 'description':
            return firstError(
                required(v, 'Description is required'),
                minLength(v, 5, 'Description must be at least 5 characters')
            );

        case 'countInStock':
            if (isEmpty(v) && v !== '0') return 'Stock count is required';
            return nonNegativeNumber(v, 'Stock must be 0 or greater');

        case 'category':
            return required(v, 'Category is required');

        case 'categoryName':
            return firstError(
                required(v, 'Category name is required'),
                minLength(v, 2, 'Category name must be at least 2 characters')
            );

        case 'street':
            return firstError(required(v, 'Street is required'), minLength(v, 2, 'Street must be at least 2 characters'));

        case 'address':
        case 'shippingAddress1':
            return required(v, 'Address is required');

        case 'city':
            return required(v, 'City is required');

        case 'zip':
            return firstError(required(v, 'Zip code is required'), !ZIP_REGEX.test(v) ? 'Zip code must be 4-10 digits' : '');

        case 'country':
        case 'region':
        case 'province':
        case 'cityMunicipality':
        case 'barangay':
            return required(
                v,
                {
                    country: 'Country is required',
                    region: 'Region is required',
                    province: 'Province is required',
                    cityMunicipality: 'City/Municipality is required',
                    barangay: 'Barangay is required',
                }[name]
            );

        default:
            return '';
    }
};

/**
 * Validates multiple fields at once.
 * @param {Object} fields - { fieldName: fieldValue }
 * @returns {Object} - { fieldName: errorMessage } (only fields with errors)
 */
export const validateForm = (fields = {}) => {
    const errors = {};
    for (const [name, value] of Object.entries(fields)) {
        const error = validateField(name, value, fields);
        if (error) {
            errors[name] = error;
        }
    }
    return errors;
};

/**
 * Returns true if the errors object has any errors.
 */
export const hasErrors = (errors = {}) => {
    return Object.keys(errors).length > 0;
};
