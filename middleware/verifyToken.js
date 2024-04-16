const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
    const token = req.headers['auth-token'];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        return res.status(403).json({ error: 'Forbidden' });
    }
}

module.exports =  verifyToken;