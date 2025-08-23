import crypto from 'crypto';

export const parseCookies = (rc) => {
    const list = {};

    rc && rc.split(';').forEach(cookie => {
        const parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
};

const generateString = (length) => (
    crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length)
);

export const hashPassword = (username, password, saltValue = null) => {
    const encoded = Buffer.from(username + ':' + password).toString('base64');
    const salt = saltValue || generateString(16);
    const hasher = crypto.createHmac('sha512', salt);
    hasher.update(encoded);
    return { salt: salt, hash: hasher.digest('hex') };
};

export { generateString };
