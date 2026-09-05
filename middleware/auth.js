const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    const token = authHeader && authHeader.split(' ')[1];

    if(!token) {
        return res.status(403).json({message: 'Akses ditolak, token tidak tersedia'});
    }

    jwt.verify(token, 'RAHASIA_KITA', (err, user) => {
        if(err) {
            return res.status(401).json({message: 'Token tidak valid atau sudah kadaluwarsa'});
        }

        req.user = user;
        next();
    });
};

module.exports = verifyToken;