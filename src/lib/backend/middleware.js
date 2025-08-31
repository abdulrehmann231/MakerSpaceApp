import { parseCookies } from './encrypt.js';
import { verifyAccessToken, verifyRefreshToken } from './jwt.js';
import { getUser, getRefreshToken } from './db.js';

/**
 * Middleware to extract and verify user from JWT token
 * @param {Object} headers - Request headers containing cookies
 * @param {string} collectionName - Database collection name
 * @returns {Object|null} User object or null if authentication failed
 */
export const extractUser = async (headers, collectionName) => {
  try {
    // Handle both Next.js Headers object and plain object
    const cookieHeader = headers.get ? headers.get('cookie') : headers.cookie;
    const ckies = cookieHeader && parseCookies(cookieHeader);
    
    if (!ckies || !ckies.auth) {
      return null;
    }
    
    // Verify access JWT token
    const decodedToken = verifyAccessToken(ckies.auth);
    if (!decodedToken) {
      // Access token expired, try refresh token
      if (ckies.refresh) {
        return await refreshUserSession(ckies.refresh, collectionName);
      }
      return null;
    }
    
    // Get user from database using email from JWT
    const user = await getUser(decodedToken.email, collectionName);
    if (!user) {
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Error extracting user from JWT:', error);
    return null;
  }
};

/**
 * Refresh user session using refresh token
 * @param {string} refreshToken - Refresh token from cookie
 * @param {string} collectionName - Database collection name
 * @returns {Object|null} User object or null if refresh failed
 */
export const refreshUserSession = async (refreshToken, collectionName) => {
  try {
    // Verify refresh token
    const decodedRefreshToken = verifyRefreshToken(refreshToken);
    if (!decodedRefreshToken) {
      return null;
    }
    
    // Get stored refresh token from database
    const storedRefreshToken = await getRefreshToken(decodedRefreshToken.email, collectionName);
    if (!storedRefreshToken || storedRefreshToken !== refreshToken) {
      return null;
    }
    
    // Get user from database
    const user = await getUser(decodedRefreshToken.email, collectionName);
    if (!user) {
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Error refreshing user session:', error);
    return null;
  }
};

/**
 * Middleware to require authentication
 * @param {Function} handler - Route handler function
 * @param {string} collectionName - Database collection name
 * @returns {Function} Wrapped handler with authentication
 */
export const withAuth = (handler, collectionName = 'users') => {
  return async (request) => {
    const user = await extractUser(request.headers, collectionName);
    
    if (!user) {
      return new Response(
        JSON.stringify({ code: 'UNAUTHORIZED', msg: 'Authentication required' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Add user to request context
    request.user = user;
    return handler(request);
  };
};
