const User = require('../models/user.model');

const assignAdminRole = async(req, res) => {
    const {userId} = req.body

    try {
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({message :'user not found'});
        }

        user.role = 'admin';
       await user.save()

       res.status(200).json({message : "admin role assigned successfully"})
    } catch(error) {
        console.error('Error in assignAdminRole controller:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = assignAdminRole;