import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()

const dropOldIndex = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            dbName: 'sangam'
        })
        console.log("Connected to sangam database")
        
        // Drop the old mobileNumber index
        const collection = mongoose.connection.db.collection("users")
        const indexes = await collection.indexes()
        console.log("Current indexes:", indexes.map(idx => ({ name: idx.name, key: idx.key })))
        
        // Drop old mobileNumber_1 index if exists
        const mobileNumberIndex = indexes.find(idx => idx.name === "mobileNumber_1")
        if (mobileNumberIndex) {
            await collection.dropIndex("mobileNumber_1")
            console.log("✅ Successfully dropped mobileNumber_1 index")
        } else {
            console.log("ℹ️  mobileNumber_1 index not found")
        }
        
        // Drop old mobileN_1 index if exists
        const mobileNIndex = indexes.find(idx => idx.name === "mobileN_1")
        if (mobileNIndex) {
            await collection.dropIndex("mobileN_1")
            console.log("✅ Successfully dropped mobileN_1 index")
        }
        
        // Verify the new mobile index exists
        const mobileIndex = indexes.find(idx => idx.name === "mobile_1")
        if (mobileIndex) {
            console.log("✅ mobile_1 index exists (correct)")
        } else {
            console.log("ℹ️  mobile_1 index will be created automatically on next user creation")
        }
        
        await mongoose.connection.close()
        console.log("✅ Done! Old indexes removed from sangam database.")
        process.exit(0)
    } catch (error) {
        console.error("Error:", error)
        await mongoose.connection.close()
        process.exit(1)
    }
}

dropOldIndex()

