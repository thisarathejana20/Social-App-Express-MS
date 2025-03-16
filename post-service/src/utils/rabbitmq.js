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

const publishEvent = async (routingKey, message) => {
  if (!channel) {
    await connectToRabbitMQ();
  }
  channel.publish(
    EXCHANGE_NAME,
    routingKey,
    Buffer.from(JSON.stringify(message))
  );
};

module.exports = { connectToRabbitMQ, publishEvent };
