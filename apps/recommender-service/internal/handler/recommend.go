package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/kenji/baby-wear-translator/backend/internal/domain"
	openapi_types "github.com/oapi-codegen/runtime/types"
)

// RecommendHandler は ServerInterface を実装する構造体です
type RecommendHandler struct{}

func NewRecommendHandler() *RecommendHandler {
	return &RecommendHandler{}
}

// GetMilestones は GET /milestones エンドポイントを処理します
func (h *RecommendHandler) GetMilestones(c *gin.Context, params GetMilestonesParams) {
	birthDate := params.BirthDate.Time
	selectedShop := ""
	if params.TargetShop != nil {
		selectedShop = string(*params.TargetShop)
	}

	milestones := make([]Milestone, 0, 25)

	// 0ヶ月から24ヶ月までの各ポイントでコーディネートを算出
	for m := 0; m <= 24; m++ {
		// その月齢になる日付を計算
		targetDate := birthDate.AddDate(0, m, 0)

		// 推測気温の計算
		estimatedTemp := domain.EstimateTemperature(targetDate)

		// 推奨アイテムの取得 (universal_name のリスト)
		universalNames := domain.Recommend(m, estimatedTemp)

		// アイテムの構築
		items := make([]Item, 0, len(universalNames))
		for _, uname := range universalNames {
			// 選択ショップの固有名
			specificName := uname
			if shopMap, ok := domain.ShopSpecificNames[uname]; ok {
				if sName, ok := shopMap[selectedShop]; ok {
					specificName = sName
				}
			}

			items = append(items, Item{
				UniversalName:    uname,
				ShopSpecificName: specificName,
			})
		}

		milestones = append(milestones, Milestone{
			AgeInMonths: m,
			TargetDate:  openapi_types.Date{Time: targetDate},
			Size:        domain.EstimateSize(m),
			Items:       items,
		})
	}

	// レスポンスの返却
	resp := MilestoneResponse{
		Milestones: milestones,
	}

	c.JSON(http.StatusOK, resp)
}
