const { faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');
const { skills, availability, names } = require('../seed.config');

faker.seed(1234);

function getRandomFromArray(arr, min, max) {
  const count = faker.number.int({ min, max });
  return faker.helpers.arrayElements(arr, count);
}

async function generateUsers(UserModel) {
  const users = [];
  for (let i = 0; i < faker.number.int({ min: 10, max: 15 }); i++) {
    const name = faker.helpers.arrayElement(names) + ' ' + faker.person.lastName();
    const email = faker.internet.email({ firstName: name.split(' ')[0], lastName: name.split(' ')[1] });
    const password = await bcrypt.hash('password123', 10);
    const skillsOffered = getRandomFromArray(skills, 2, 4);
    const skillsWanted = getRandomFromArray(skills, 2, 4);
    const userAvailability = getRandomFromArray(availability, 1, 3);
    const photo = faker.image.avatar();
    const isPublic = faker.datatype.boolean({ probability: 0.8 });
    users.push({
      name,
      email,
      password,
      skillsOffered,
      skillsWanted,
      availability: userAvailability,
      photo,
      isPublic,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  const inserted = await UserModel.insertMany(users);
  return inserted;
}

function getRandomUserPair(users) {
  let sender, receiver;
  do {
    sender = faker.helpers.arrayElement(users);
    receiver = faker.helpers.arrayElement(users);
  } while (sender._id.equals(receiver._id));
  return { sender, receiver };
}

async function generateSwaps(SwapModel, users) {
  const swaps = [];
  for (let i = 0; i < faker.number.int({ min: 10, max: 15 }); i++) {
    const { sender, receiver } = getRandomUserPair(users);
    const offeredSkill = faker.helpers.arrayElement(sender.skillsOffered);
    const requestedSkill = faker.helpers.arrayElement(receiver.skillsOffered);
    const status = faker.helpers.arrayElement(['pending', 'accepted', 'rejected']);
    swaps.push({
      sender: sender._id,
      receiver: receiver._id,
      offeredSkill,
      requestedSkill,
      status,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  const inserted = await SwapModel.insertMany(swaps);
  return inserted;
}

async function generateFeedback(FeedbackModel, swaps) {
  const acceptedSwaps = swaps.filter(s => s.status === 'accepted');
  const feedbacks = [];
  for (let i = 0; i < faker.number.int({ min: 5, max: Math.min(10, acceptedSwaps.length) }); i++) {
    const swap = faker.helpers.arrayElement(acceptedSwaps);
    feedbacks.push({
      swap: swap._id,
      rating: faker.number.int({ min: 3, max: 5 }),
      comment: faker.lorem.sentence(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  const inserted = await FeedbackModel.insertMany(feedbacks);
  return inserted;
}

async function generateAdminMessage(AdminMessageModel) {
  const msg = await AdminMessageModel.create({
    message: 'Welcome to SkillMate! Start swapping your skills.',
    priority: 'info',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return msg;
}

module.exports = {
  generateUsers,
  generateSwaps,
  generateFeedback,
  generateAdminMessage,
}; 