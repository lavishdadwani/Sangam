import mongoose from "mongoose"

const dbConnect = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URL, {
            dbName: 'sangam' // Explicitly specify database name
        })
        console.log(`✅ Database connected to: ${mongoose.connection.db.databaseName}`)
    }catch(err){
        console.error("❌ Database connection error:", err)
        process.exit(1)
    }
}

export default dbConnect