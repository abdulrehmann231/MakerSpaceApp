import { getCollection } from './mongodb.js';

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

export const updateToken = async (username, collectionName, tokenValue) => {
    try {
        const collection = await getCollection(collectionName);
        const result = await collection.updateOne(
            { key: username },
            { $set: { token: tokenValue } },
            { returnDocument: 'after' }
        );
        return tokenValue;
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
