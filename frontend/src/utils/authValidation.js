/**
 * Password strength validation
 */
export const checkPasswordStrength = (password) => {
  const strength = {
    score: 0,
    level: 'weak',
    feedback: [],
  };

  if (!password) return strength;

  // Length check
  if (password.length >= 8) strength.score += 1;
  else strength.feedback.push('At least 8 characters');

  if (password.length >= 12) strength.score += 1;

  // Character variety checks
  if (/[a-z]/.test(password)) strength.score += 1;
  if (/[A-Z]/.test(password)) strength.score += 1;
  if (/[0-9]/.test(password)) strength.score += 1;
  if (/[^A-Za-z0-9]/.test(password)) strength.score += 1;

  // Determine level
  if (strength.score <= 1) {
    strength.level = 'weak';
  } else if (strength.score <= 3) {
    strength.level = 'fair';
  } else if (strength.score <= 4) {
    strength.level = 'good';
  } else {
    strength.level = 'strong';
  }

  return strength;
};

/**
 * Email validation
 */
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Form validation for login
 */
export const validateLoginForm = (form) => {
  const errors = {};

  if (!form.email.trim()) {
    errors.email = 'Email is required';
  } else if (!validateEmail(form.email)) {
    errors.email = 'Please enter a valid email';
  }

  if (!form.password) {
    errors.password = 'Password is required';
  } else if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  return errors;
};

/**
 * Form validation for signup
 */
export const validateSignupForm = (form) => {
  const errors = {};

  if (!form.name.trim()) {
    errors.name = 'Full name is required';
  } else if (form.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }

  if (!form.email.trim()) {
    errors.email = 'Email is required';
  } else if (!validateEmail(form.email)) {
    errors.email = 'Please enter a valid email';
  }

  if (!form.password) {
    errors.password = 'Password is required';
  } else if (form.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
};

/**
 * Form validation for reset password
 */
export const validateResetPasswordForm = (form) => {
  const errors = {};

  if (!form.password) {
    errors.password = 'New password is required';
  } else if (form.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
};

export default {
  checkPasswordStrength,
  validateEmail,
  validateLoginForm,
  validateSignupForm,
  validateResetPasswordForm,
};
