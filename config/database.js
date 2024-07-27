const  mongoose = require('mongoose');
mongoose.set("strictQuery",false)


class Database {
    constructor(uri,options){
        this.uri = uri;
        this.options = options;
    }

    async connect() {
        try {
            await mongoose.connect(this.uri,this.options);
            console.log(`connected to database : ${mongoose.connection.db.databaseName}`);
        } catch (error) {
            throw error ;
        }
    } 
}

module.exports = Database;