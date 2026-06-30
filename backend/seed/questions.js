const mongoose = require('mongoose');
const Question = require('../models/Question');
require('dotenv').config({ path: '../.env' });

const questions = [];

// Generate 200+ questions
const categories = ['Foundation', 'Materials', 'Construction', 'Structural', 'Plumbing', 'Concrete', 'Regulations', 'Design', 'Roofing', 'Testing'];

categories.forEach(category => {
  for (let i = 1; i <= 30; i++) {
    questions.push({
      question: \ Question \: What is the standard practice for this scenario?,
      options: ['Option A - Standard Practice', 'Option B - Alternative Method', 'Option C - Recommended Approach', 'Option D - Best Practice'],
      correctAnswer: Math.floor(Math.random() * 4),
      category: category,
      difficulty: ['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)],
      explanation: This is the explanation for \ question \.
    });
  }
});

async function seedDatabase() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/buildmitra';
    await mongoose.connect(uri);
    await Question.deleteMany({});
    await Question.insertMany(questions);
    console.log(✅ \ questions seeded successfully!);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding:', error);
    process.exit(1);
  }
}

seedDatabase();
