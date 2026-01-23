import { createClient } from 'redis';
import chalk from 'chalk';

let client = null;

const normalizeRedisUrl = (url) => {
  if (!url) {
    return 'redis://localhost:6379';
  }
  url = url.trim();
  return url;
};


/**
 * Initialize Redis connection
 * @returns {Promise<RedisClient>} Redis client instance
 */
export const initRedis = async () => {
  try {
    if (client && client.isOpen) {
      return client;
    }

    const rawRedisUrl = process.env.REDIS_URL || '';
    const redisUrl = normalizeRedisUrl(rawRedisUrl);
    
    const redisPassword = process.env.REDIS_PASSWORD 
    
    // Mask password in logs
    const maskedUrl = redisUrl.replace(/:[^:@]*@/, ':****@');
    console.log(chalk.blue(`🔄 Attempting to connect to Redis: ${maskedUrl}`));

    // Create client configuration
    const clientConfig = {
      url: redisUrl,
      password: redisPassword || undefined, 
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.log(chalk.red('❌ Redis reconnection failed after 10 attempts'));
            return new Error('Redis reconnection limit reached');
          }
          return Math.min(retries * 100, 3000);
        },
        connectTimeout: 10000, // 10 seconds
      },
    };

    client = createClient(clientConfig);

    client.on('error', (err) => {
      console.log(chalk.yellow('⚠️  Redis Client Error:'), err.message);
      // Don't throw - let the app continue without Redis
    });

    client.on('connect', () => {
      console.log(chalk.blue('🔄 Connecting to Redis...'));
    });

    client.on('ready', () => {
      console.log(chalk.green('✅ Redis connected successfully'));
    });

    client.on('end', () => {
      console.log(chalk.yellow('🔌 Redis connection closed'));
    });

    client.on('reconnecting', () => {
      console.log(chalk.blue('🔄 Redis reconnecting...'));
    });

    await Promise.race([
      client.connect(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Redis connection timeout')), 10000)
      )
    ]);

    return client;
  } catch (err) {
    console.log(chalk.red('❌ Redis connection failed:'), err.message);
    
    // helpful error messages
    if (err.message.includes('Invalid protocol') || err.message.includes('ECONNREFUSED')) {
      console.log(chalk.yellow('💡 Tip: Make sure Redis is running and REDIS_URL is correct'));
      console.log(chalk.yellow('   For localhost: redis://localhost:6379'));
      console.log(chalk.yellow('   Or remove REDIS_URL from .env to use default localhost'));
    }
    
    console.log(chalk.yellow('⚠️  Continuing without Redis cache...'));
    
    // Clean up failed client
    if (client) {
      try {
        if (client.isOpen) {
          await client.quit();
        }
      } catch (cleanupErr) {
        // cleanup errors
      }
      client = null;
    }
    
    return null;
  }
};


/**
 * Close Redis connection
 */
export const closeRedis = async () => {
  if (client && client.isOpen) {
    await client.quit();
    client = null;
  }
};
