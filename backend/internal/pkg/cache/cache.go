package cache

import (
	"context"
	"log"
	"sync"
	"time"

	"github.com/redis/go-redis/v9"
)

type memoryItem struct {
	value      string
	expiration time.Time
}

type Cache struct {
	redisClient *redis.Client
	isRedisUp   bool
	mu          sync.RWMutex
	memoryStore map[string]memoryItem
}

func NewCache(redisAddr, redisPassword string) *Cache {
	c := &Cache{
		memoryStore: make(map[string]memoryItem),
	}

	if redisAddr != "" {
		client := redis.NewClient(&redis.Options{
			Addr:     redisAddr,
			Password: redisPassword,
			DB:       0,
		})

		ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
		defer cancel()

		if err := client.Ping(ctx).Err(); err != nil {
			log.Printf("[Cache] Redis not available at %s (%v). Using fast in-memory fallback cache.", redisAddr, err)
			c.isRedisUp = false
		} else {
			log.Printf("[Cache] Successfully connected to Redis at %s", redisAddr)
			c.redisClient = client
			c.isRedisUp = true
		}
	} else {
		log.Println("[Cache] Redis address empty, running in memory-cache mode.")
	}

	// Periodic cleanup for expired memory cache items
	go c.startMemoryCleanup()

	return c
}

func (c *Cache) Set(ctx context.Context, key string, value string, ttl time.Duration) error {
	if c.isRedisUp && c.redisClient != nil {
		err := c.redisClient.Set(ctx, key, value, ttl).Err()
		if err == nil {
			return nil
		}
	}

	c.mu.Lock()
	defer c.mu.Unlock()
	c.memoryStore[key] = memoryItem{
		value:      value,
		expiration: time.Now().Add(ttl),
	}
	return nil
}

func (c *Cache) Get(ctx context.Context, key string) (string, bool) {
	if c.isRedisUp && c.redisClient != nil {
		val, err := c.redisClient.Get(ctx, key).Result()
		if err == nil {
			return val, true
		}
	}

	c.mu.RLock()
	defer c.mu.RUnlock()
	item, found := c.memoryStore[key]
	if !found {
		return "", false
	}
	if time.Now().After(item.expiration) {
		return "", false
	}
	return item.value, true
}

func (c *Cache) Del(ctx context.Context, key string) error {
	if c.isRedisUp && c.redisClient != nil {
		_ = c.redisClient.Del(ctx, key).Err()
	}

	c.mu.Lock()
	defer c.mu.Unlock()
	delete(c.memoryStore, key)
	return nil
}

func (c *Cache) Incr(ctx context.Context, key string, ttl time.Duration) (int64, error) {
	if c.isRedisUp && c.redisClient != nil {
		val, err := c.redisClient.Incr(ctx, key).Result()
		if err == nil {
			c.redisClient.Expire(ctx, key, ttl)
			return val, nil
		}
	}

	c.mu.Lock()
	defer c.mu.Unlock()
	item, found := c.memoryStore[key]
	var current int64 = 0
	if found && time.Now().Before(item.expiration) {
		// parse int
		_ = parseInt(item.value, &current)
	}
	current++
	c.memoryStore[key] = memoryItem{
		value:      intToString(current),
		expiration: time.Now().Add(ttl),
	}
	return current, nil
}

func (c *Cache) startMemoryCleanup() {
	ticker := time.NewTicker(2 * time.Minute)
	for range ticker.C {
		c.mu.Lock()
		now := time.Now()
		for k, v := range c.memoryStore {
			if now.After(v.expiration) {
				delete(c.memoryStore, k)
			}
		}
		c.mu.Unlock()
	}
}

func parseInt(s string, out *int64) bool {
	var res int64
	for i := 0; i < len(s); i++ {
		if s[i] < '0' || s[i] > '9' {
			return false
		}
		res = res*10 + int64(s[i]-'0')
	}
	*out = res
	return true
}

func intToString(n int64) string {
	if n == 0 {
		return "0"
	}
	var b [32]byte
	i := len(b)
	for n > 0 {
		i--
		b[i] = byte(n%10 + '0')
		n /= 10
	}
	return string(b[i:])
}
