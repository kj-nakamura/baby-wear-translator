package main

import (
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/kenji/baby-wear-translator/backend/internal/handler"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	// CORS設定: Next.js (localhost:3000) からのリクエストを許可
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000"}
	config.AllowMethods = []string{"GET", "POST", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type"}
	r.Use(cors.New(config))

	// ハンドラーの初期化
	h := handler.NewRecommendHandler()

	// oapi-codegen で生成された RegisterHandlers を使用してルートを登録
	handler.RegisterHandlers(r, h)

	return r
}

func main() {
	r := SetupRouter()

	// 8080ポートで起動
	log.Println("Server starting on :8080...")
	if err := r.Run(":8080"); err != nil {
		log.Fatal("Failed to run server: ", err)
	}
}
