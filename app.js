require('dotenv').config();
const express = require('express')
const cors = require('cors');
const userRoutes = require('./routes/user.route')
const adminRoutes = require('./routes/admin.route')
const Database = require('./config/database')

const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200,
};

const app = express();
app.use(cors(corsOptions));
app.use(express.json());



const PORT = process.env.PORT || 4000;

const db = new Database(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
  
  db.connect().catch((err) =>
    console.error("Error connecting to database:", err)
  );
  
 app.use("/users",userRoutes);
 app.use("/admin",adminRoutes)
 

app.listen(PORT,() => {
    console.log(`server running on port ${PORT}`)
})

module.exports = app;