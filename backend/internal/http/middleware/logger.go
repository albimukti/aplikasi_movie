package middleware

import (
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

func StructuredLogger() fiber.Handler {
	return func(c *fiber.Ctx) error {
		start := time.Now()
		reqID := c.Get("X-Request-ID")
		if reqID == "" {
			reqID = uuid.New().String()
			c.Set("X-Request-ID", reqID)
		}

		err := c.Next()

		latency := time.Since(start)
		status := c.Response().StatusCode()
		method := c.Method()
		path := c.Path()
		ip := c.IP()

		log.Printf(`{"req_id":"%s","ip":"%s","method":"%s","path":"%s","status":%d,"latency":"%v"}`,
			reqID, ip, method, path, status, latency)

		return err
	}
}
