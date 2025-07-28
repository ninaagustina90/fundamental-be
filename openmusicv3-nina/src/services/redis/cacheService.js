const redis = require('redis');

class CacheService {
  constructor() {
    this._client = redis.createClient({
      socket: {
        host: process.env.REDIS_SERVER,
        port: Number(process.env.REDIS_PORT), 
      },
    });

    this._client.on('connect', () => {
      console.log('✅ Redis connected on', process.env.REDIS_SERVER + ':' + process.env.REDIS_PORT);
    });

    this._client.on('error', (error) => {
      console.error('❌ Redis error:', error.message);
    });

    this._client.connect().catch((err) => {
      console.error('Redis connection error:', err.message);
    });
  }

 
  set(key, value) {
    const EXPIRATION = 1800; 
    return this._client.set(key, value, {
      EX: EXPIRATION,
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
