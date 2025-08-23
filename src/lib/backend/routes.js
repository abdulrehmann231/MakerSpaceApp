import { generateString, hashPassword, parseCookies } from './encrypt.js';
import { getUser, updateToken, register } from './db.js';

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
    const { email, password, newpassword, createaccount } = body;
    const user = await getUser(email, collectionName);
    const pHash = newpassword && hashPassword(email, newpassword);

    if (!createaccount && user && hashPassword(email, password, user.salt).hash === user.hash) {
        // Login successful
        const token = await updateToken(email, collectionName, generateString(36));
        const respons = response({
            msg: `Successfully Logged in`,
            code: "LOGIN"
        }, '200');
        respons.multiValueHeaders = {
            'Set-Cookie': [
                `user=${email}`,
                `auth=${token}; Secure; HttpOnly`
            ]
        };
        return respons;
    } else if (createaccount) {
        // Registration
        const res = !user && await register(body, collectionName, pHash);
        const token = await updateToken(email, collectionName, generateString(36));
        if (!user) {
            const respons = response({ msg: 'Successfully Registered', code: 'REG' }, '302');
            respons.multiValueHeaders = {
                'Set-Cookie': [
                    `user=${email};`,
                    `auth=${token}; Secure; HttpOnly`
                ]
            };
            return respons;
        } else return response({ msg: 'Email already exists', code: 'FOUND' });
    } else return response({ msg: 'Incorrect Password', code: 'WRONGPW' });
};
