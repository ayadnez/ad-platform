const router = require('express').Router();
const {register,login , upload,updateAd} = require('../controllers/user.controller');
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/' });
const authUser = require('./auth')


router.post('/register',register);
router.post('/login',login);
router.post('/upload',uploadMiddleware.single('file'),upload)
router.put('/ads/:id',uploadMiddleware.single('file'),updateAd)

router.get('/hello',function(req,res){
    res.json({message:"hello from digital domi"})
})

module.exports = router;