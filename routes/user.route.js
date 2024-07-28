const router = require('express').Router();
const {register,login , upload,updateAd,getAllAds,logout} = require('../controllers/user.controller');
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/' });
const {authUser} = require('../middleware/auth')

// public routes
router.post('/register',register);
router.post('/login',login);

// authenticated  user routes
router.post('/upload',authUser,uploadMiddleware.single('file'),upload)
router.put('/ads/:id',authUser,uploadMiddleware.single('file'),updateAd)
router.get('/ads',authUser,getAllAds)
router.post('/logout',authUser,logout)



router.get('/hello',function(req,res){
    res.json({message:"hello from digital domi"})
})

module.exports = router;