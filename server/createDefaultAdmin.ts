import { storage } from "./storage";

/**
 * Creates a default admin user if it doesn't already exist
 */
export async function createDefaultAdmin() {
  try {
    // Check if the new admin user already exists
    const existingAdmin = await storage.getUserByUsername("isk_conjuhuadmin");
    
    if (!existingAdmin) {
      console.log("Creating default admin user...");
      
      // Create the new admin user
      const adminUser = await storage.createUser({
        username: "isk_conjuhuadmin",
        password: "isk_conjuhukrishnaconsiousness", // In a real app, this would be hashed
        email: "admin@iskconjuhu.org",
        name: "ISKCON Juhu Admin",
        role: "admin"
      });
      
      console.log(`Default admin user created with ID: ${adminUser.id}`);
    } else {
      console.log("Default admin user already exists");
    }
  } catch (error) {
    console.error("Error creating default admin user:", error);
  }
}