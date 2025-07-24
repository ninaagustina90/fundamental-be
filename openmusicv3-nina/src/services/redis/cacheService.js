const redis = require('redis');

class CacheService {
  constructor() {
    this._client = redis.createClient({
      url: `redis://${process.env.REDIS_SERVER}`,
    });

    this._client.on('error', (error) => {
      throw error;
    });

    this._client.connect().catch((err) => {
      console.error('Redis connection error:', err);
    });
  }

  set(key, value, expirationInSecond = 3600) {
    return this._client.set(key, value, {
      EX: expirationInSecond,
    });
  }

  async get(key) {
    const result = await this._client.get(key);
    if (result === null) {
      throw new Error('Cache tidak ditemukan');
    }
    return result.toString();
  }

  delete(key) {
    return this._client.del(key);
  }
}

module.exports = CacheService;
