const router = require('express').Router();
const {register,login , upload,updateAd,getAllAds} = require('../controllers/user.controller');
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/' });
const {authUser} = require('./auth')

// public routes
router.post('/register',register);
router.post('/login',login);

// authenticated  user routes
router.post('/upload',authUser,uploadMiddleware.single('file'),upload)
router.put('/ads/:id',authUser,uploadMiddleware.single('file'),updateAd)
router.get('/ads',authUser,getAllAds)

router.get('/hello',function(req,res){
    res.json({message:"hello from digital domi"})
})

module.exports = router;