const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const mongoose = require('mongoose');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas');

  const Level = mongoose.models.Level || mongoose.model('Level', new mongoose.Schema({}, { strict: false }));
  const Student = mongoose.models.Student || mongoose.model('Student', new mongoose.Schema({}, { strict: false }));
  const Homework = mongoose.models.Homework || mongoose.model('Homework', new mongoose.Schema({}, { strict: false }));
  const HomeworkAttempt = mongoose.models.HomeworkAttempt || mongoose.model('HomeworkAttempt', new mongoose.Schema({}, { strict: false }));
  const Lesson = mongoose.models.Lesson || mongoose.model('Lesson', new mongoose.Schema({}, { strict: false }));
  const Topic = mongoose.models.Topic || mongoose.model('Topic', new mongoose.Schema({}, { strict: false }));

  const l1 = await Level.findOne({ order: 1 });
  const l2 = await Level.findOne({ order: 2 });
  console.log('Level 1:', l1?._id?.toString(), 'Level 2:', l2?._id?.toString());

  // 1. Update existing L1 homeworks
  await Homework.updateMany(
    { homeworkNumber: { $lte: 8 } },
    { $set: { levelId: l1._id, levelOrder: 1 } }
  );

  // 2. Update existing L2 homeworks (9 and 10)
  await Homework.updateMany(
    { homeworkNumber: { $gte: 9 } },
    { $set: { levelId: l2._id, levelOrder: 2 } }
  );

  // 3. Upsert Homework 11 and 12
  const hw11Id = new mongoose.Types.ObjectId('67a900000000000000000011');
  const hw12Id = new mongoose.Types.ObjectId('67a900000000000000000012');

  const topicL2 = await Topic.findOne({ levelId: l2._id });
  const lesson8 = await Lesson.findOne({ lessonNumber: 8 });
  const lesson9 = await Lesson.findOne({ lessonNumber: 9 });

  await Homework.findOneAndUpdate(
    { _id: hw11Id },
    {
      _id: hw11Id,
      homeworkNumber: 11,
      order: 11,
      title: 'Homework 11: Big Friend Subtraction (-9 to -1 Rules)',
      description: 'Apply base-10 borrowing formulas (-9 = -10 + 1, -8 = -10 + 2, down to -1) across tens and units columns.',
      levelOrder: 2,
      levelId: l2._id,
      topicId: topicL2?._id || l2._id,
      lessonId: lesson8?._id || l2._id,
      recommendedTime: 15,
      dueDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
      status: 'pending',
      questionIds: []
    },
    { upsert: true, new: true }
  );

  await Homework.findOneAndUpdate(
    { _id: hw12Id },
    {
      _id: hw12Id,
      homeworkNumber: 12,
      order: 12,
      title: 'Homework 12: 2-Digit 3-Row Column Synchronization',
      description: 'Coordinate tens and units movements across 3 continuous rows of two-digit numbers.',
      levelOrder: 2,
      levelId: l2._id,
      topicId: topicL2?._id || l2._id,
      lessonId: lesson9?._id || l2._id,
      recommendedTime: 16,
      dueDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),
      status: 'pending',
      questionIds: []
    },
    { upsert: true, new: true }
  );

  // 4. Update Neeha Nazer's student attempts and profile
  const student = await Student.findOne({ email: 'neehanaz226@gmail.com' });
  if (student) {
    console.log('Found student Neeha Nazer:', student._id.toString());

    // Evaluate all Level 1 homeworks for this student
    const l1Homeworks = await Homework.find({ levelOrder: 1 });
    console.log('Found L1 homeworks count:', l1Homeworks.length);
    for (const hw of l1Homeworks) {
      await HomeworkAttempt.findOneAndUpdate(
        { studentId: student._id, homeworkId: hw._id },
        {
          studentId: student._id,
          homeworkId: hw._id,
          answers: [],
          attemptNumber: 1,
          score: 10,
          totalQuestions: 10,
          accuracy: 100,
          timeTaken: 300,
          submittedAt: new Date('2026-10-04T10:00:00.000Z'),
          status: 'evaluated',
        },
        { upsert: true, new: true }
      );
    }

    // Evaluate Level 2 Homework 9 for this student (first Level 2 homework)
    const hw9 = await Homework.findOne({ homeworkNumber: 9 });
    if (hw9) {
      await HomeworkAttempt.findOneAndUpdate(
        { studentId: student._id, homeworkId: hw9._id },
        {
          studentId: student._id,
          homeworkId: hw9._id,
          answers: [],
          attemptNumber: 1,
          score: 9,
          totalQuestions: 10,
          accuracy: 90,
          timeTaken: 360,
          submittedAt: new Date('2026-10-08T15:00:00.000Z'),
          status: 'evaluated',
        },
        { upsert: true, new: true }
      );
    }

    // Ensure student record has completedLevels: [1], currentLevel: 2
    await Student.findByIdAndUpdate(student._id, {
      $addToSet: { completedLevels: 1 },
      $set: {
        currentLevel: 2,
        selectedLevel: 'Level 2: Two-Digit Operations & Big Friend Subtraction',
        completedWorksheets: 9,
      }
    });
  }

  // Verify all homeworks now
  const allHw = await Homework.find().sort({ order: 1, homeworkNumber: 1 }).lean();
  console.log('Total Homeworks in DB now:', allHw.length);
  for (const h of allHw) {
    console.log(`HW ${h.homeworkNumber}: ${h.title} | levelOrder: ${h.levelOrder} | levelId: ${h.levelId}`);
  }

  // Verify student attempts now
  const attempts = await HomeworkAttempt.find({ studentId: student._id }).lean();
  console.log(`Total Homework Attempts for ${student.email}:`, attempts.length);

  await mongoose.disconnect();
  console.log('Seeding and database update completed successfully!');
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
