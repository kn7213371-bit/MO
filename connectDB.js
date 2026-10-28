import {MongoClient} from "mongodb";
import { log } from "node:console";
import dns from "node:dns";
process.loadEnvFile();
dns.setServers(["8.8.8.8","1.1.1.1"]);

export const client= new MongoClient(process.env.MONGO_URL);

export async function connectDB() {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
    
}

export async function disconnectFromMongoDB() {
  await client.close();
}