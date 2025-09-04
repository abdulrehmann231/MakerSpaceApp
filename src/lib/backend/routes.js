import { generateString, hashPassword, parseCookies } from './encrypt.js';
import { generateTokens, verifyAccessToken, verifyRefreshToken } from './jwt.js';
import { getUser, register, getUserData, setUserData, putBooking, getBookings, getAllBookings, deleteBooking, getAvailability, getSetting, changePassword, saveRefreshToken, getRefreshToken, deleteRefreshToken } from './db.js';

const response = (content = {}, statusCode = '200') => ({
    "isBase64Encoded": false,
    "statusCode": statusCode,
    "body": JSON.stringify(content),
    "headers": {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://app.makerspacedelft.nl",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Expose-Headers": "Set-Cookie"
    }
});

export const postClient = async (collectionName, { body, headers }) => {
    const { email, password, newpassword, createaccount, update, userdata } = body;
    const user = await getUser(email, collectionName);
    const pHash = newpassword && hashPassword(email, newpassword);

    if (update) {
        const ckies = headers.cookie && parseCookies(headers.cookie);
        if (ckies && ckies.auth) {
            // Verify JWT token
            const decodedToken = verifyAccessToken(ckies.auth);
            if (!decodedToken) {
                return response({ msg: 'Authentication failed', code: 'UNAUTHORIZED' });
            }
            
            // Get user from database using email from JWT
            const user = await getUser(decodedToken.email, collectionName);
            if (user && user.key == email) {
                const res = await setUserData(email, collectionName, userdata);
                const respons = response({
                    msg: `Successfully set user data`,
                    code: "UPDATE"
                }, '200');
                return respons;
            }
            return response({ msg: 'Incorrect Username' + user?.key + '/' + email, code: 'WRONGUSER' });
        }
        return response({ msg: 'Authentication required', code: 'UNAUTHORIZED' });
    } else if (!createaccount && user && hashPassword(email, password, user.salt).hash === user.hash) {
        // Login successful
        const { accessToken, refreshToken } = generateTokens(user);
        
        // Save refresh token to database
        await saveRefreshToken(email, refreshToken, collectionName);
        
        const res = newpassword ? await changePassword(email, newpassword, collectionName, pHash) : null;
        const respons = response({
            msg: `Successfully ${res ? "Changed Password" : "Logged in"}`,
            code: res ? "PWCHANGE" : "LOGIN"
        }, '200');
        respons.multiValueHeaders = {
            'Set-Cookie': [
                `auth=${accessToken}; Secure; HttpOnly; SameSite=Lax`,
                `refresh=${refreshToken}; Secure; HttpOnly; SameSite=Lax`
            ]
        };
        return respons;
    } else if (createaccount) {
        // Registration
        const res = !user && await register(body, collectionName, pHash);
        if (!user) {
            // Get the newly created user to generate JWT tokens
            const newUser = await getUser(email, collectionName);
            const { accessToken, refreshToken } = generateTokens(newUser);
            
            // Save refresh token to database
            await saveRefreshToken(email, refreshToken, collectionName);
            
            const respons = response({ msg: 'Successfully Registered', code: 'REG' }, '302');
            respons.multiValueHeaders = {
                'Set-Cookie': [
                    `auth=${accessToken}; Secure; HttpOnly; SameSite=Lax`,
                    `refresh=${refreshToken}; Secure; HttpOnly; SameSite=Lax`
                ]
            };
            return respons;
        } else return response({ msg: 'Email already exists', code: 'FOUND' });
    } else return response({ msg: 'Incorrect Password', code: 'WRONGPW' });
};

export const getClient = async (collectionName, { headers }) => {
    return requireAuth(headers, collectionName, async (user) => {
        return response({
            msg: { ...user, hash: null, salt: null, token: null },
            code: 'FOUND'
        });
    });
};

const requireAuth = async (headers, collectionName, f) => {
    const ckies = headers.cookie && parseCookies(headers.cookie);
    
    if (ckies && ckies.auth) {
        // Verify JWT token
        const decodedToken = verifyAccessToken(ckies.auth);
        if (!decodedToken) {
            // Access token expired, try refresh token
            if (ckies.refresh) {
                const user = await refreshUserSession(ckies.refresh, collectionName);
                if (user) {
                    return await f(user);
                }
            }
            return authFailed();
        }
        
        // Get user from database using email from JWT
        const user = await getUser(decodedToken.email, collectionName);
        if (!user) {
            return authFailed();
        }
        
        return await f(user);
    }
    return authFailed();
};

// Helper function to refresh user session
const refreshUserSession = async (refreshToken, collectionName) => {
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

const authFailed = () => { return response({}, '401'); };

const dayToDate = 24 * 3600000;

const dateEquals = (d, od, recur = false) => (
    d.getDate() === od.getDate() && d.getMonth() === od.getMonth() && (recur || d.getYear() === od.getYear())
);

export const createBooking = async (userCollection, timeCollection, { body, headers }) => {
    // Convert and validate the required fields
    const date = body.date;
    const start = parseInt(body.start);
    const end = parseInt(body.end);
    const npeople = parseInt(body.npeople) || 1;
    
    // Check if all required fields are present and valid
    if (date && typeof start === 'number' && !isNaN(start) && typeof end === 'number' && !isNaN(end)) {
        const ckies = headers.cookie && parseCookies(headers.cookie);
        
        if (!ckies || !ckies.auth) {
            return authFailed();
        }
        
        // Verify JWT token
        const decodedToken = verifyAccessToken(ckies.auth);
        if (!decodedToken) {
            // Access token expired, try refresh token
            if (ckies.refresh) {
                const user = await refreshUserSession(ckies.refresh, userCollection);
                if (user) {
                    const bookingId = (new Date()).valueOf() - (new Date(2020, 1, 1)).valueOf();
                    const record = { 
                        date, 
                        start, 
                        end, 
                        id: bookingId, 
                        user: user.key, 
                        npeople,
                        description: body.description || ''
                    };
                    const res = await putBooking(timeCollection, record);
                    return response({ msg: "Successfully Booked", code: "BOOKED" }, "200");
                }
            }
            return authFailed();
        }
        
        // Get user from database using email from JWT
        const user = await getUser(decodedToken.email, userCollection);
        const bookingId = (new Date()).valueOf() - (new Date(2020, 1, 1)).valueOf();
        if (user) {
            const record = { 
                date, 
                start, 
                end, 
                id: bookingId, 
                user: user.key, 
                npeople,
                description: body.description || ''
            };
            const res = await putBooking(timeCollection, record);
            return response({ msg: "Successfully Booked", code: "BOOKED" }, "200");
        } else return authFailed();
    } else {
        // Provide more specific error messages based on what's missing
        let errorMsg = "Invalid booking details. Please check your date and time selection.";
        
        if (!date) {
            errorMsg = "Please select a valid date for your booking.";
        } else if (typeof start !== 'number' || isNaN(start)) {
            errorMsg = "Please select a valid start time for your booking.";
        } else if (typeof end !== 'number' || isNaN(end)) {
            errorMsg = "Please select a valid end time for your booking.";
        } else if (start >= end) {
            errorMsg = "End time must be after start time.";
        } else if (start < 0 || start > 23 || end < 1 || end > 24) {
            errorMsg = "Please select valid times between 0:00 and 24:00.";
        }
        
        return response({ 
            msg: errorMsg, 
            code: "BFORMAT" 
        }, "400");
    }
};

export const seeBookings = async (userCollection, timeCollection, configCollection, { queryStringParameters: { from, to, see }, headers }) => {
    return requireAuth(headers, userCollection, async (user) => {
        if (see) {
            
            const config = await getSetting("availability", configCollection);
            const bookings = await getAvailability(from, to, timeCollection);
            var available = [];
            const fromDay = new Date(from);
            const days = Math.round(((new Date(to)).valueOf() - (fromDay).valueOf()) / dayToDate);
            var ind, curDate;
            for (var i = 0; i <= days; i++) {
                curDate = new Date(fromDay.valueOf() + i * dayToDate);
                const isHoliday = config.holidays.map(h => dateEquals(new Date(h), curDate)).reduce((red, cur) => !(!red && !cur), false);
                const isRecurHoliday = config.recurHolidays.map(h => dateEquals(new Date(h), curDate, true)).reduce((red, cur) => !(!red && !cur), false);
                if (isHoliday || isRecurHoliday) {
                    available.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
                } else {
                    ind = (fromDay.getDay() + i) % 7;
                    available.push(config.spotsAvailable[ind].slice());
                }
            } for (var book of bookings.Items) {
                var daysSince = Math.round(((new Date(book.date)).valueOf() - (fromDay).valueOf()) / dayToDate);
                for (var b = book.start; b < book.end; b++)
                    available[daysSince][b] -= (available[daysSince][b] === 0 ? 0 : (book.npeople || 1));
            }
            return response({ msg: available, code: "FOUND" }, "200");
        } else if (from && to) {
            const fromDate = (new Date(from)).valueOf() - (new Date(2020, 1, 1)).valueOf();
            const toDate = (new Date(to)).valueOf() - (new Date(2020, 1, 1)).valueOf();
            const bookings = await getBookings(fromDate, toDate, user.key, timeCollection);
            if (bookings.Count) return response({ msg: bookings.Items, code: "FOUND" });
            else return response({ msg: "No bookings Found", code: "BFORMAT" }, "200");
        } else return response({ "msg": "No settings selected, send see, to or from in the query", "code": "ERROR" }, "400");
    });
};

export const cancelBooking = async (userCollection, timeCollection, { body: { id }, headers }) => {
    const ckies = headers.cookie && parseCookies(headers.cookie);
    
    if (!ckies || !ckies.auth) {
        return authFailed();
    }
    
    // Verify JWT token
    const decodedToken = verifyAccessToken(ckies.auth);
    if (!decodedToken) {
        // Access token expired, try refresh token
        if (ckies.refresh) {
            const user = await refreshUserSession(ckies.refresh, userCollection);
            if (user) {
                const deleted = await deleteBooking(id, timeCollection);
                return response({ code: "DELETE", msg: deleted });
            }
        }
        return authFailed();
    }
    
    // Get user from database using email from JWT
    const user = await getUser(decodedToken.email, userCollection);
    if (user) {
        const deleted = await deleteBooking(id, timeCollection);
        return response({ code: "DELETE", msg: deleted });
    } else return authFailed();
};
