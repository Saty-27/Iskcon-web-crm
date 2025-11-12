import { storage } from "./storage";

/**
 * Creates a new admin user with a known password
 */
export async function resetAdmin() {
  try {
    // Create a new admin user with predictable credentials
    const newAdmin = await storage.createUser({
      username: "iskconadmin",
      password: "iskcon123",  // In a real app, this would be hashed
      email: "admin2@iskconjuhu.org",
      name: "ISKCON Admin",
      role: "admin"
    });
    
    console.log(`New admin user created with ID: ${newAdmin.id}`);
    console.log("Username: iskconadmin");
    console.log("Password: iskcon123");
    
    return true;
  } catch (error) {
    console.error("Error creating new admin user:", error);
    return false;
  }
}