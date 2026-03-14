// ─── Form Validation Utilities ───
// Centralized validation functions for all forms in the app.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9]{10,13}$/;
const ZIP_REGEX = /^[0-9]{4,10}$/;
const RESET_CODE_REGEX = /^[0-9]{6}$/;

const normalize = (value) => (value == null ? '' : String(value).trim());
const isEmpty = (value) => normalize(value).length === 0;

/**
 * Validates a single field and returns an error message or empty string.
 */
export const validateField = (name, value, allFields = {}) => {
    const v = normalize(value);

    switch (name) {
        case 'email':
            if (isEmpty(v)) return 'Email is required';
            if (!EMAIL_REGEX.test(v.toLowerCase())) return 'Please enter a valid email address';
            return '';

        case 'password':
            if (isEmpty(v)) return 'Password is required';
            if (v.length < 6) return 'Password must be at least 6 characters';
            return '';

        case 'oldPassword':
            if (isEmpty(v)) return 'Old password is required';
            if (v.length < 6) return 'Password must be at least 6 characters';
            return '';

        case 'newPassword':
            if (isEmpty(v)) return 'New password is required';
            if (v.length < 6) return 'Password must be at least 6 characters';
            return '';

        case 'confirmPassword': {
            if (isEmpty(v)) return 'Please confirm your password';
            const compareWith = normalize(allFields.newPassword ?? allFields.password ?? '');
            if (compareWith && v !== compareWith) return 'Passwords do not match';
            return '';
        }

        case 'resetCode':
        case 'code':
            if (isEmpty(v)) return 'Reset code is required';
            if (!RESET_CODE_REGEX.test(v)) return 'Reset code must be 6 digits';
            return '';

        case 'name':
            if (isEmpty(v)) return 'Name is required';
            if (v.length < 2) return 'Name must be at least 2 characters';
            return '';

        case 'phone': {
            if (isEmpty(v)) return 'Phone number is required';
            const digitsOnly = v.replace(/\D/g, '');
            if (!PHONE_REGEX.test(digitsOnly)) return 'Phone must be 10-13 digits';
            return '';
        }

        case 'brand':
            if (isEmpty(v)) return 'Brand is required';
            return '';

        case 'price':
        case 'discountedPrice':
            if (isEmpty(v)) return 'Price is required';
            if (Number.isNaN(Number(v)) || Number(v) <= 0) return 'Price must be a positive number';
            return '';

        case 'description':
            if (isEmpty(v)) return 'Description is required';
            if (v.length < 5) return 'Description must be at least 5 characters';
            return '';

        case 'countInStock':
            if (isEmpty(v) && v !== '0') return 'Stock count is required';
            if (Number.isNaN(Number(v)) || Number(v) < 0) return 'Stock must be 0 or greater';
            return '';

        case 'category':
            if (isEmpty(v)) return 'Category is required';
            return '';

        case 'categoryName':
            if (isEmpty(v)) return 'Category name is required';
            if (v.length < 2) return 'Category name must be at least 2 characters';
            return '';

        case 'street':
            if (isEmpty(v)) return 'Street is required';
            if (v.length < 2) return 'Street must be at least 2 characters';
            return '';

        case 'address':
        case 'shippingAddress1':
            if (isEmpty(v)) return 'Address is required';
            return '';

        case 'city':
            if (isEmpty(v)) return 'City is required';
            return '';

        case 'zip':
            if (isEmpty(v)) return 'Zip code is required';
            if (!ZIP_REGEX.test(v)) return 'Zip code must be 4-10 digits';
            return '';

        case 'country':
            if (isEmpty(v)) return 'Country is required';
            return '';

        case 'region':
            if (isEmpty(v)) return 'Region is required';
            return '';

        case 'province':
            if (isEmpty(v)) return 'Province is required';
            return '';

        case 'cityMunicipality':
            if (isEmpty(v)) return 'City/Municipality is required';
            return '';

        case 'barangay':
            if (isEmpty(v)) return 'Barangay is required';
            return '';

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
