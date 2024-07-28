const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const refreshToken = async(req, res) => {
    const token = req.cookies.refreshToken;

    if(!token) return res.status(401).json({message:'no token provided'});

    try {
        const decodedToken = jwt.verify(token,process.env.REFRESH_KEY);
        const user = await User.findById(decodedToken.id);

        if(!user){
            return res.status(401).json({message :"invalid refresh token"})
        }

        const payload = {
            id : user.id,
            role : user.role
        }

        const accessToken = jwt.sign(payload,process.env.JWT_SECRETKEY,{expiresIn:"6h"})

        res.json({accessToken});
    } catch(error) {
        res.status(403).json({message : "token is not valid"})
    }
}

module.exports = refreshToken;