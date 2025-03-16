const amqp = require("amqplib");
const logger = require("../utils/logger");

let connection = null;
let channel = null;

const EXCHANGE_NAME = "post-exchange";

const connectToRabbitMQ = async () => {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: false });
    logger.info("Connected to RabbitMQ successfully");
    return channel;
  } catch (error) {
    logger.error("Error connecting to RabbitMQ:", error);
  }
};

const consumeEvent = async (routingKey, callback) => {
  if (!channel) {
    await connectToRabbitMQ();
  }

  const q = await channel.assertQueue("", { exclusive: true });
  await channel.bindQueue(q.queue, EXCHANGE_NAME, routingKey);
  channel.consume(q.queue, (msg) => {
    callback(JSON.parse(msg.content.toString()));
    channel.ack(msg);
  });
  logger.info(`Listening for events on routing key: ${routingKey}`);
};

module.exports = { connectToRabbitMQ, consumeEvent };
