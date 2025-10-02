// Load environment variables from .env file
require('dotenv').config();

// Import the Cloudinary library
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with your credentials from .env
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// The settings for our new, correct preset
const presetSettings = {
    name: "studyverse_preset",
    unsigned: false, // This means it's a "Signed" preset
    resource_type: "auto" // This is the setting we need
};

// API call to create the preset
cloudinary.api.create_upload_preset(presetSettings)
    .then(result => {
        console.log("✅ SUCCESS! Preset 'studyverse_preset' created or updated.");
        console.log("You can now delete the createPreset.js file.");
    })
    .catch(error => {
        console.error("❌ ERROR: Failed to create preset.");
        console.error(error.error.message);
    });