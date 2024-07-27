const router = require('express').Router();

const getAdds = require('../controllers/admin.controller')


router.get('/',getAdds);


module.exports = router;