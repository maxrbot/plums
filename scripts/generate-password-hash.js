#!/usr/bin/env node

/**
 * Password Hash Generator
 * 
 * Use this script to generate bcrypt password hashes for manually creating user accounts.
 * 
 * Prerequisites:
 *   npm install bcryptjs
 * 
 * Usage:
 *   node scripts/generate-password-hash.js "YourPassword123"
 * 
 * Or run interactively:
 *   node scripts/generate-password-hash.js
 */

const bcrypt = require('bcryptjs');
const readline = require('readline');

const SALT_ROUNDS = 12;

async function generateHash(password) {
  if (!password || password.trim().length === 0) {
    console.error('❌ Error: Password cannot be empty');
    process.exit(1);
  }

  if (password.length < 8) {
    console.warn('⚠️  Warning: Password is less than 8 characters. Consider using a stronger password.');
  }

  console.log('\n🔐 Generating password hash...\n');
  
  const hash = bcrypt.hashSync(password, SALT_ROUNDS);
  
  console.log('✅ Password hash generated successfully!\n');
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('\n📋 Use this hash in your MongoDB user document:\n');
  console.log(JSON.stringify({
    email: "user@example.com",
    password: hash,
    subscriptionTier: "enterprise",
    profile: {
      companyName: "Company Name",
      contactName: "User Name",
      email: "user@example.com",
      phone: "",
      address: {}
    },
    preferences: {
      defaultPriceUnit: "lb",
      timezone: "America/Los_Angeles",
      currency: "USD",
      notifications: {
        email: true,
        priceAlerts: true,
        marketUpdates: false
      }
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }, null, 2));
  console.log('\n');
}

// Check if password provided as argument
if (process.argv[2]) {
  generateHash(process.argv[2]);
} else {
  // Interactive mode
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Enter password to hash: ', (password) => {
    rl.close();
    generateHash(password);
  });
}

