package main

import (
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/kenji/baby-wear-translator/backend/internal/handler"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	// CORS設定
	config := cors.DefaultConfig()
	allowedOrigin := os.Getenv("ALLOWED_ORIGINS")
	if allowedOrigin == "" || allowedOrigin == "*" {
		config.AllowAllOrigins = true
	} else {
		config.AllowOrigins = []string{allowedOrigin}
	}
	config.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"}
	config.AllowCredentials = true
	r.Use(cors.New(config))

	// ハンドラーの初期化
	h := handler.NewRecommendHandler()

	// oapi-codegen で生成された RegisterHandlers を使用してルートを登録
	handler.RegisterHandlers(r, h)

	return r
}

func main() {
	r := SetupRouter()

	// Get port from environment variable for Cloud Run
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// サーバーの起動
	log.Printf("Server starting on :%s...", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to run server: ", err)
	}
}
