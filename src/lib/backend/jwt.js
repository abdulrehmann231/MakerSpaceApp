import jwt from 'jsonwebtoken';

// JWT secret keys - should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'makerspace-jwt-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'makerspace-refresh-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '10m'; // 10 minutes default
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d'; // 7 days default


/**
 * Generate access JWT token for user
 * @param {Object} user - User object with email and other data
 * @returns {string} JWT access token
 */
export const generateAccessToken = (user) => {
  const payload = {
    email: user.key || user.email,
    firstname: user.firstname,
    lastname: user.lastname,
    user: user.user,
    iat: Math.floor(Date.now() / 1000),
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Generate refresh JWT token for user
 * @param {Object} user - User object with email and other data
 * @returns {string} JWT refresh token
 */
export const generateRefreshToken = (user) => {
  const payload = {
    email: user.key || user.email,
    iat: Math.floor(Date.now() / 1000),
  };

  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
};

/**
 * Generate both access and refresh tokens
 * @param {Object} user - User object with email and other data
 * @returns {Object} Object containing access and refresh tokens
 */
export const generateTokens = (user) => {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user)
  };
};

/**
 * Verify access JWT token
 * @param {string} token - JWT access token to verify
 * @returns {Object|null} Decoded token payload or null if invalid
 */
export const verifyAccessToken = (token) => {
  try {
    const result = jwt.verify(token, JWT_SECRET);
    return result;
  } catch (error) {
    console.error('JWT access token verification failed:', error.message);
    console.error('Error details:', error);
    return null;
  }
};

/**
 * Verify refresh JWT token
 * @param {string} token - JWT refresh token to verify
 * @returns {Object|null} Decoded token payload or null if invalid
 */
export const verifyRefreshToken = (token) => {
  try {
    const result = jwt.verify(token, JWT_REFRESH_SECRET);
    return result;
  } catch (error) {
    console.error('JWT refresh token verification failed:', error.message);
    console.error('Error details:', error);
    return null;
  }
};

// Keep backward compatibility
export const verifyToken = verifyAccessToken;

/**
 * Decode JWT token without verification (for debugging)
 * @param {string} token - JWT token to decode
 * @returns {Object|null} Decoded token payload or null if invalid
 */
export const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    console.error('JWT decode failed:', error.message);
    return null;
  }
};

/**
 * Check if token is expired
 * @param {string} token - JWT token to check
 * @returns {boolean} True if token is expired
 */
export const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

/**
 * Get token expiration time
 * @param {string} token - JWT token
 * @returns {Date|null} Expiration date or null if invalid
 */
export const getTokenExpiration = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return null;
    
    return new Date(decoded.exp * 1000);
  } catch (error) {
    return null;
  }
};
