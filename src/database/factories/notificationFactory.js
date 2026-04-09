const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');

/**
 * Generates a fake notification object.
 * @param {Object} options - Custom overrides and required fields.
 * @param {mongoose.Types.ObjectId} options.senderId - Sender's user ID.
 * @param {mongoose.Types.ObjectId} options.recipientId - Recipient's user ID.
 */
const generateNotification = ({ senderId, recipientId, ...overrides } = {}) => {
  if (!senderId || !recipientId) {
    throw new Error('Both senderId and recipientId are required');
  }

  const deliveryStatus = faker.helpers.arrayElement(['pending', 'sent', 'failed']);
  const isRead = faker.datatype.boolean();
  const isSeen = faker.datatype.boolean();

  return {
    title: {
      en: faker.lorem.words(5),
      fr: faker.lorem.words(5),
    },
    description: {
      en: faker.lorem.sentences(2),
      fr: faker.lorem.sentences(2),
    },
    notifyUrl: faker.internet.url(),
    uploadsable_type: faker.helpers.arrayElement(['Post', 'Comment', 'File']),
    uploadsable_id: new mongoose.Types.ObjectId(),
    notifyType: 'system'/* faker.helpers.arrayElement(['system', 'platform']) */,
    type: faker.helpers.arrayElement(['info', 'warning', 'update']),
    deliveryStatus,
    deliveredAt: deliveryStatus === 'sent' ? new Date() : null,
    senderId,
    recipientId,
    isRead,
    readAt: isRead ? new Date() : null,
    isSeen,
    seenAt: isSeen ? new Date() : null,
    clickCount: faker.number.int({ min: 0, max: 10 }),
    viewCount: faker.number.int({ min: 0, max: 20 }),
    isDeleted: false,
    ...overrides,
  };
};

module.exports = {
  generateNotification,
};
