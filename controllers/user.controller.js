const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const Ad = require('../models/ad.model')
const jwt = require('jsonwebtoken');
const Grid = require('gridfs-stream');
const ffmpeg = require('fluent-ffmpeg');
const mongoose = require('mongoose');
const fs = require('fs');

const register = async (req, res) => {
  const { userName, password } = req.body;
  console.log("Incoming request:", req.body); // Log incoming request body for debugging
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ userName });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      userName,
      password: hashedPassword,
      role : 'user'
    });

    await newUser.save();

    res.status(201).json({ message: "User registration successful" });
  } catch (error) {
    console.error("Error while registering user:", error);
    res.status(500).json({ message: "Error while registering user" });
  }
};



const login = async (req, res) => {

  const {userName,password} = req.body;

  try {
   // find the user by username
    const user = await User.findOne({userName}) 
    if (!user){
      res.status(404).json({message:"user not found"});
    }
 // check if the password is correct 
    const passwordMatch = await bcrypt.compare(password,user.password);

    if(!passwordMatch) {
      res.status(401).json({message : "invalid credentials"})
    }
    // generate a jwt token 

    const payload = {
      id : user._id,
      role : user.role
    }
    const accessToken = jwt.sign(payload,process.env.JWT_SECRETKEY,{  expiresIn : "6h",});
    const refreshToken = jwt.sign(payload,process.env.REFRESH_KEY,{expiresIn:'7d'});

    res.cookie('refreshToken',refreshToken,{
      httpOnly:true,
      secure : process.env.NODE_ENV === 'test',
      sameSite :'strict',
      maxAge :7*24*60*60*1000 // 7 days
    });

    res.status(200).json({accessToken});
  }catch(error){
    console.log("error : ",error)
    res.status(500).json({message:"error while logging in"})
  }
}

const logout = async(req, res) => {
  

    //const accessToken = req.headers.authorization?.split(" ")[1] ?? null;

    const { id } = req.user;

    try {
      const user = await User.findById(id);
  
      if (user) {
        await user.save();
      }
  
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'test',
        sameSite: 'Strict'
      });
  
      res.status(200).json({ message: 'Logged out successfully' });

    } catch (error) {

      console.error('Error in logout controller:', error);
      res.status(500).json({ message: 'Server error' });
    }
  
  
}



// Initialize gfs
let gfs;
mongoose.connection.once('open', () => {
  gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'uploads'
  });
});

const upload = async (req, res) => {
  console.log('Received upload request');

  if (!req.file) {
    console.error('No file provided');
    return res.status(400).json({ message: 'No file provided' });
  }

  console.log('File received:', req.file);

  const { title, description, targetGender, location, ageGroup } = req.body;

  if (!title || !description || !targetGender || !location || !ageGroup) {
    console.error('Missing ad information');
    return res.status(400).json({ message: 'Missing ad information' });
  }

  try {
    const tempFilePath = req.file.path;

    // Determine if the file is a video based on MIME type
    const isVideo = req.file.mimetype.startsWith('video');

    const handleFileUpload = async (filePath) => {
      const uploadStream = gfs.openUploadStream(req.file.originalname, {
        contentType: req.file.mimetype
      });

      const readStream = fs.createReadStream(filePath);
      readStream.pipe(uploadStream);

      uploadStream.on('finish', async () => {
        console.log('Upload stream finished for file:', req.file.originalname);

        try {
          const fileMetadata = await gfs.find({ filename: req.file.originalname }).toArray();
          const fileInfo = fileMetadata[0];

          if (!fileInfo || !fileInfo._id) {
            console.error('File upload failed');
            return res.status(500).json({ message: 'File upload failed' });
          }

          const ad = new Ad({
            title,
            description,
            targetGender,
            location,
            ageGroup,
            fileId: fileInfo._id,
            filename: req.file.originalname,
            mimetype: req.file.mimetype
          });

          await ad.save();

          fs.unlink(tempFilePath, (err) => {
            if (err) console.error('Error deleting temporary file:', err);
          });

          if (isVideo) {
            const compressedFilePath = `${tempFilePath}-compressed.mp4`;
            fs.unlink(compressedFilePath, (err) => {
              if (err) console.error('Error deleting compressed file:', err);
            });
          }

          console.log('Temporary files deleted');
          return res.json({ ad });
        } catch (err) {
          console.error('Error saving ad metadata:', err);
          return res.status(500).json({ message: 'Error saving ad metadata', error: err });
        }
      });

      uploadStream.on('error', (err) => {
        console.error('Error while uploading to GridFS:', err);
        return res.status(500).json({ message: 'Error uploading file', error: err });
      });
    };

    if (isVideo) {
      const compressedFilePath = `${tempFilePath}-compressed.mp4`;

      // Compress video using ffmpeg
      ffmpeg(tempFilePath)
        .output(compressedFilePath)
        .videoCodec('libx264')
        .size('50%') // Adjust the size as needed
        .on('end', async () => {
          console.log('Video compression finished');
          await handleFileUpload(compressedFilePath);
        })
        .on('error', (err) => {
          console.error('Error during video compression:', err);
          return res.status(500).json({ message: 'Error during video compression', error: err });
        })
        .run();
    } else {
      await handleFileUpload(tempFilePath);
    }
  } catch (err) {
    console.error('Error in upload controller:', err);
    return res.status(500).json({ message: 'Error uploading file', error: err });
  }
};

const updateAd = async(req, res) => {
  
  try {
    const { title, description, targetGender, location, ageGroup } = req.body;
    const adId = req.params.id;
    const ad = await Ad.findById(adId);

    if (!ad) {
      return res.status(404).json({ message: 'Ad not found' });
    }

    // Update ad attributes
    ad.title = title || ad.title;
    ad.description = description || ad.description;
    ad.targetGender = targetGender || ad.targetGender;
    ad.location = location || ad.location;
    ad.ageGroup = ageGroup || ad.ageGroup;

    if (req.file) {
      await handleFileUpdate(ad, req.file);
    }

    // Save the ad with updated attributes and/or file information
    await ad.save();
    res.status(200).json(ad);

  } catch (err) {
    console.error('Error in updateAd controller:', err);
    return res.status(500).json({ message: 'Error updating ad', error: err });
  }
};

// Handles file upload and update to GridFS
const handleFileUpdate = (ad, file) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Delete old file from GridFS if present
      if (ad.fileId) {
        await gfs.delete(new mongoose.Types.ObjectId(ad.fileId));
      }

      // Create a write stream to GridFS for new file
      const uploadStream = gfs.openUploadStream(file.originalname, {
        contentType: file.mimetype
      });

      const readStream = fs.createReadStream(file.path);
      readStream.pipe(uploadStream);

      uploadStream.on('finish', async () => {
        ad.fileId = uploadStream.id;
        ad.fileName = file.originalname;

        // Delete the temporary file
        fs.unlink(file.path, err => {
          if (err) {
            console.error('Error deleting temporary file:', err);
            return reject({ message: 'Error deleting temporary file', error: err });
          }
          resolve();
        });
      });

      uploadStream.on('error', (err) => {
        console.error('Error while uploading to GridFS:', err);
        reject({ message: 'Error uploading file', error: err });
      });

    } catch (err) {
      reject({ message: 'Error handling file update', error: err });
    }
  });
  
}

const getAllAds = async (req,res) => {
     try {
          const ads = await Ad.find();

          if(!ads.length){
            res.status(404).json({message:"no ads found"})
          }

          res.status(200).json(ads)
     } catch(error) {
      console.log("error while fetching ads",error)
      res.status(500).json({message :"error fetching ads",Error : error})
     }
}



module.exports = {
  register,
  login,
  upload,
  updateAd,
  getAllAds,
  logout
};
