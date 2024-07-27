function authUser(req,res, next) {
    if(req.userName==null){
        res.status(403)
        return res.send("you have to singn in first")
    }

    next();
}

module.exports = authUser;