package handler

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/kenji/baby-wear-translator/backend/internal/domain"
)

// RecommendHandler は ServerInterface を実装する構造体です
type RecommendHandler struct{}

func NewRecommendHandler() *RecommendHandler {
	return &RecommendHandler{}
}

// GetRecommendation は GET /recommend エンドポイントを処理します
func (h *RecommendHandler) GetRecommendation(c *gin.Context, params GetRecommendationParams) {
	// 1. 生年月日の利用
	birthDate := params.BirthDate.Time

	// 2. 月齢の計算
	ageInMonths := domain.CalculateAgeInMonths(birthDate, time.Now())

	// 3. 推奨アイテムの取得 (universal_name のリスト)
	universalNames := domain.Recommend(ageInMonths, float64(params.CurrentTemp))

	// 4. ショップ固有の名前へのマッピング
	shopID := ""
	if params.TargetShop != nil {
		shopID = string(*params.TargetShop)
	}

	items := make([]Item, 0, len(universalNames))
	for _, uname := range universalNames {
		specificName := uname // デフォルトは汎用名
		if shopMap, ok := domain.ShopSpecificNames[uname]; ok {
			if sName, ok := shopMap[shopID]; ok {
				specificName = sName
			}
		}

		items = append(items, Item{
			UniversalName:    uname,
			ShopSpecificName: specificName,
		})
	}

	// 5. レスポンスの返却
	resp := RecommendationResponse{
		AgeInMonths: ageInMonths,
		Items:       items,
	}

	c.JSON(http.StatusOK, resp)
}
