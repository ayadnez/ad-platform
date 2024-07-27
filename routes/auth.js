const jwt = require('jsonwebtoken');

//  Middleware to authenticate the user using JWT
function authUser(req,res, next) {

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

   // check if auth token is included in headers
    if (token == null) {
        return res.status(401).json({message : "token required"})
    }

    // check if the auth-token is valid 

    jwt.verify(token,process.env.SECRETKEY,async (err,user) => {
        if(err) return res.status(403).json({message:"invalid token"});

        req.user = user;
        next();
    });
    
}

// Middleware to authorize user based on their role
const authorizeRole = (roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };

module.exports = {
    authUser,
    authorizeRole
};