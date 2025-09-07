// MongoDB initialization script
db = db.getSiblingDB('ammg');

// Create collections
db.createCollection('users');
db.createCollection('meetings');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "createdAt": -1 });

db.meetings.createIndex({ "createdBy": 1, "createdAt": -1 });
db.meetings.createIndex({ "meetingDate": -1 });
db.meetings.createIndex({ "status": 1 });
db.meetings.createIndex({ "tags": 1 });
db.meetings.createIndex({ "participants.email": 1 });

// Create a default admin user (password: admin123)
db.users.insertOne({
  name: "Admin User",
  email: "admin@ammg.com",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8K8K8K8K", // bcrypt hash for "admin123"
  role: "admin",
  isEmailVerified: true,
  preferences: {
    theme: "light",
    notifications: {
      email: true,
      meetingReminders: true
    }
  },
  createdAt: new Date(),
  updatedAt: new Date()
});

print('Database initialized successfully!');
