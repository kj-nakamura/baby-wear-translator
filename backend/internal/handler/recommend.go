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

// itemResponse は JSON レスポンス用の拡張 Item 型です。
// 自動生成の Item 型に other_shop_names を追加しています。
type itemResponse struct {
	UniversalName    string            `json:"universal_name"`
	ShopSpecificName string            `json:"shop_specific_name"`
	OtherShopNames   map[string]string `json:"other_shop_names"`
}

// recommendationResponse は JSON レスポンス用の拡張レスポンス型です。
type recommendationResponse struct {
	AgeInMonths int            `json:"age_in_months"`
	Items       []itemResponse `json:"items"`
}

// GetRecommendation は GET /recommend エンドポイントを処理します
func (h *RecommendHandler) GetRecommendation(c *gin.Context, params GetRecommendationParams) {
	// 1. 生年月日の利用
	birthDate := params.BirthDate.Time

	// 2. targetDate の決定
	targetDate := time.Now()
	if params.TargetDate != nil {
		targetDate = params.TargetDate.Time
	}

	// 3. バリデーション: 生年月日は targetDate（デフォルトは今日）より前でなければならない
	// タイムゾーンのズレを避けるため、YYYY-MM-DD 文字列として比較する
	const dateFmt = "2006-01-02"
	targetStr := targetDate.Format(dateFmt)
	birthStr := birthDate.Format(dateFmt)
	if birthStr > targetStr {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "birth_date must not be after target_date",
		})
		return
	}

	// 4. 月齢の計算
	ageInMonths := domain.CalculateAgeInMonths(birthDate, targetDate)

	// 4. 推奨アイテムの取得 (universal_name のリスト)
	universalNames := domain.Recommend(ageInMonths, float64(params.CurrentTemp))

	// 5. ショップ固有の名前へのマッピング
	selectedShop := ""
	if params.TargetShop != nil {
		selectedShop = string(*params.TargetShop)
	}

	items := make([]itemResponse, 0, len(universalNames))
	for _, uname := range universalNames {
		// 選択ショップの固有名
		specificName := uname
		if shopMap, ok := domain.ShopSpecificNames[uname]; ok {
			if sName, ok := shopMap[selectedShop]; ok {
				specificName = sName
			}
		}

		// 選択ショップ以外の固有名を収集
		otherShopNames := map[string]string{}
		if shopMap, ok := domain.ShopSpecificNames[uname]; ok {
			for shopID, name := range shopMap {
				if shopID != selectedShop {
					otherShopNames[shopID] = name
				}
			}
		}

		items = append(items, itemResponse{
			UniversalName:    uname,
			ShopSpecificName: specificName,
			OtherShopNames:   otherShopNames,
		})
	}

	// 6. レスポンスの返却
	resp := recommendationResponse{
		AgeInMonths: ageInMonths,
		Items:       items,
	}

	c.JSON(http.StatusOK, resp)
}
