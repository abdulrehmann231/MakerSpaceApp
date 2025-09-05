import { getCollection } from './mongodb.js';

export const getSetting = async (setting, collectionName) => {
    try {
        const collection = await getCollection(collectionName);
        const config = await collection.findOne({ key: setting });
        return config;
    } catch (err) {
        console.log(err, err.stack);
        return null;
    }
};

export const setSetting = async (setting, value, collectionName) => {
    try {
        console.log("here");
        const collection = await getCollection(collectionName);
        const result = await collection.updateOne(
            { key: setting },
            { $set: { ...value, key: setting } },
            { upsert: true, returnDocument: 'after' }
        );
        return result;
    } catch (err) {
        console.log(err, err.stack);
        return null;
    }
};

export const changePassword = async (email, newpassword, collectionName, { hash, salt }) => {
    try {
        const collection = await getCollection(collectionName);
        const result = await collection.updateOne(
            { key: email },
            { $set: { hash: hash, salt: salt } },
            { returnDocument: 'after' }
        );
        return result;
    } catch (err) {
        console.log(err);
        return null;
    }
};

export const getUser = async (username, collectionName) => {
    try {
        const collection = await getCollection(collectionName);
        const user = await collection.findOne({ key: username });
        return user;
    } catch (err) {
        console.log(err, err.stack);
        return null;
    }
};

// Refresh token management functions
export const saveRefreshToken = async (email, refreshToken, collectionName) => {
    try {
        const collection = await getCollection(collectionName);
        const result = await collection.updateOne(
            { key: email },
            { $set: { refreshToken: refreshToken } },
            { returnDocument: 'after' }
        );
        return result;
    } catch (err) {
        console.log(err);
        return null;
    }
};

export const getRefreshToken = async (email, collectionName) => {
    try {
        const collection = await getCollection(collectionName);
        const user = await collection.findOne({ key: email });
        return user ? user.refreshToken : null;
    } catch (err) {
        console.log(err, err.stack);
        return null;
    }
};

export const deleteRefreshToken = async (email, collectionName) => {
    try {
        const collection = await getCollection(collectionName);
        const result = await collection.updateOne(
            { key: email },
            { $unset: { refreshToken: "" } }
        );
        return result;
    } catch (err) {
        console.log(err);
        return null;
    }
};

export const register = async (userObj, collectionName, pHash) => {
    try {
        const collection = await getCollection(collectionName);
        const user = {
            ...userObj,
            ...pHash,
            key: userObj.email
        };
        const invalids = ['email', 'token', 'password', 'newpassword', 'createaccount'];
        for (var attr of invalids) {
            delete user[attr];
        }
        
        const result = await collection.insertOne(user);
        return result;
    } catch (err) {
        console.log(err);
        return null;
    }
};

export const getUserData = async (username, collectionName) => {
    try {
        const collection = await getCollection(collectionName);
        const user = await collection.findOne({ key: username + ".userData" });
        return user;
    } catch (err) {
        console.log(err, err.stack);
        return null;
    }
};

export const setUserData = async (email, collectionName, userdata) => {
    try {
        const collection = await getCollection(collectionName);
        const result = await collection.updateOne(
            { key: email },
            { $set: { userData: userdata } },
            { returnDocument: 'after' }
        );
        return result;
    } catch (err) {
        console.log(err);
        return null;
    }
};

export const putBooking = async (collectionName, booking) => {
    try {
        const collection = await getCollection(collectionName);
        const result = await collection.insertOne(booking);
        return result;
    } catch (err) {
        console.log(err);
        return null;
    }
};

export const getBookings = async (fromDate, toDate, email, collectionName) => {
    try {
        const collection = await getCollection(collectionName);
        const bookings = await collection.find({
            user: email,
            id: { $gte: fromDate, $lte: toDate }
        }).toArray();
        return { Count: bookings.length, Items: bookings };
    } catch (err) {
        console.log(err, err.stack);
        return { Count: 0, Items: [] };
    }
};

export const getAllBookings = async (collectionName) => {
    try {
        const collection = await getCollection(collectionName);
        const bookings = await collection.find({}).toArray();
        return { Count: bookings.length, Items: bookings };
    } catch (err) {
        console.log(err, err.stack);
        return { Count: 0, Items: [] };
    }
};

export const deleteBooking = async (bookingId, collectionName) => {
    try {
        const collection = await getCollection(collectionName);
        const result = await collection.deleteOne({ id: bookingId });
        return result;
    } catch (err) {
        console.log(err, err.stack);
        return null;
    }
};

export const getAvailability = async (fromDate, toDate, collectionName) => {
    try {
        const collection = await getCollection(collectionName);
        const bookings = await collection.find({
            date: { $gte: fromDate, $lte: toDate }
        }).toArray();
        return { Count: bookings.length, Items: bookings };
    } catch (err) {
        console.log(err, err.stack);
        return { Count: 0, Items: [] };
    }
};
