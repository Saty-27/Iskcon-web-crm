import { db } from "./db";
import { stats, schedules } from "@shared/schema";

export async function initializeStatsAndSchedules() {
  try {
    // Check if stats data exists
    const existingStats = await db.select().from(stats);
    if (existingStats.length === 0) {
      console.log("Initializing stats data...");
      await db.insert(stats).values([
        {
          value: 300,
          suffix: "cr+",
          label: "Meals Distributed",
          isActive: true,
          orderIndex: 1
        },
        {
          value: 55,
          suffix: "years",
          label: "of service to humanity",
          isActive: true,
          orderIndex: 2
        },
        {
          value: 110,
          suffix: "+",
          label: "Kitchens across India",
          isActive: true,
          orderIndex: 3
        }
      ]);
      console.log("Stats data initialized successfully");
    }

    // Check if schedule data exists
    const existingSchedules = await db.select().from(schedules);
    if (existingSchedules.length === 0) {
      console.log("Initializing temple schedule data...");
      await db.insert(schedules).values([
        {
          title: "Mangala Aarti",
          time: "04:30 AM",
          description: "Morning worship with beautiful prayers and devotional songs",
          isActive: true,
          orderIndex: 1
        },
        {
          title: "Tulsi Aarti",
          time: "05:00 AM",
          description: "Sacred worship of Tulsi Devi with melodious chanting",
          isActive: true,
          orderIndex: 2
        },
        {
          title: "Srimad Bhagavatam Class",
          time: "07:30 AM",
          description: "Daily spiritual discourse on ancient Vedic wisdom",
          isActive: true,
          orderIndex: 3
        },
        {
          title: "Guru Puja",
          time: "08:00 AM",
          description: "Reverent worship and offering to spiritual masters",
          isActive: true,
          orderIndex: 4
        },
        {
          title: "Raj Bhog Aarti",
          time: "12:30 PM",
          description: "Midday offering with elaborate prayers and bhajans",
          isActive: true,
          orderIndex: 5
        },
        {
          title: "Sandhya Aarti",
          time: "07:00 PM",
          description: "Evening worship filled with devotional atmosphere",
          isActive: true,
          orderIndex: 6
        },
        {
          title: "Shayan Aarti",
          time: "08:30 PM",
          description: "Final peaceful aarti before the deities rest",
          isActive: true,
          orderIndex: 7
        }
      ]);
      console.log("Temple schedule data initialized successfully");
    }

  } catch (error) {
    console.error("Error initializing stats and schedules:", error);
  }
}