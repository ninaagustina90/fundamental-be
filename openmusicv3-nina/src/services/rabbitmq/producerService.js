const amqp = require('amqplib');

const ProducerService = {
  sendMessage: async (queue, message) => {
    let connection;
    try {
      connection = await amqp.connect(process.env.RABBITMQ_SERVER);
      const channel = await connection.createChannel();

      await channel.assertQueue(queue, {
        durable: true,
      });

      channel.sendToQueue(queue, Buffer.from(message)); // kirim pesan

      // Opsional: tutup connection dengan delay
      setTimeout(() => {
        connection.close();
      }, 1000);
    } catch (error) {
      console.error('❌ Gagal mengirim pesan ke RabbitMQ:', error.message);
    }
  },
};

module.exports = ProducerService;
