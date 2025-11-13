const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/markethunt')
  .then(async () => {
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const user = await User.findOne({}).lean();
    
    console.log('\n=== USER PACKAGING STRUCTURE ===');
    console.log('Has packagingStructure:', !!user?.packagingStructure);
    console.log('Keys:', Object.keys(user?.packagingStructure || {}));
    console.log('\nFull structure:');
    console.log(JSON.stringify(user?.packagingStructure, null, 2));
    
    console.log('\n=== CROPS ===');
    const Crop = mongoose.model('Crop', new mongoose.Schema({}, { strict: false }));
    const crops = await Crop.find({}).lean();
    console.log('Total crops:', crops.length);
    crops.forEach(crop => {
      console.log(`- ${crop.commodity}: ${crop.variations?.length || 0} variations`);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
