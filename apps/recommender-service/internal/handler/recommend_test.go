package handler_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/kenji/baby-wear-translator/backend/internal/handler"
)

// setupRouter はテスト用の Gin ルーターをセットアップして返します。
func setupRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	h := handler.NewRecommendHandler()
	handler.RegisterHandlers(r, h)
	return r
}

// doRequest はテスト用 HTTP リクエストを実行するヘルパーです。
func doRequest(t *testing.T, r *gin.Engine, url string) *httptest.ResponseRecorder {
	t.Helper()
	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		t.Fatalf("http.NewRequest: %v", err)
	}
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w
}

// =============================================================================
// 正常系テスト
// =============================================================================

func TestGetMilestones_OK_BasicResponse(t *testing.T) {
	r := setupRouter()
	w := doRequest(t, r, "/milestones?birth_date=2025-10-01")

	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d; body = %s", w.Code, http.StatusOK, w.Body.String())
	}

	var resp handler.MilestoneResponse
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("json.Unmarshal: %v; body = %s", err, w.Body.String())
	}

	if len(resp.Milestones) != 25 {
		t.Errorf("len(milestones) = %d, want 25", len(resp.Milestones))
	}

	// 0ヶ月目のチェック
	m0 := resp.Milestones[0]
	if m0.AgeInMonths != 0 {
		t.Errorf("milestone[0].age_in_months = %d, want 0", m0.AgeInMonths)
	}
	if len(m0.Items) == 0 {
		t.Error("milestone[0].items should not be empty")
	}

	// カテゴリー情報のチェック
	item0 := m0.Items[0]
	if item0.CategoryLabel == "" || item0.CategoryEmoji == "" || item0.CategoryColor == "" {
		t.Errorf("item category metadata missing: label=%q, emoji=%q, color=%q",
			item0.CategoryLabel, item0.CategoryEmoji, item0.CategoryColor)
	}
}

func TestGetMilestones_OK_AllShopNames(t *testing.T) {
	r := setupRouter()

	tests := []struct {
		name       string
		targetShop string
		wantName   string // カバーオールの固有名
		birthDate  string
		targetItem string // universal_name
	}{
		{
			name:       "西松屋: カバーオール → プレオール",
			targetShop: "nishimatsuya",
			wantName:   "プレオール",
			birthDate:  "2025-10-01",
			targetItem: "カバーオール",
		},
		{
			name:       "ユニクロ: カバーオール → フライスカバーオール",
			targetShop: "uniqlo",
			wantName:   "フライスカバーオール",
			birthDate:  "2025-10-01",
			targetItem: "カバーオール",
		},
		{
			name:       "アカチャンホンポ: カバーオール → ドレスオール",
			targetShop: "akachan_honpo",
			wantName:   "ドレスオール",
			birthDate:  "2025-10-01",
			targetItem: "カバーオール",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			url := "/milestones?birth_date=" + tt.birthDate
			w := doRequest(t, r, url)

			if w.Code != http.StatusOK {
				t.Fatalf("status = %d, want %d", w.Code, http.StatusOK)
			}

			var resp handler.MilestoneResponse
			if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
				t.Fatalf("json.Unmarshal: %v", err)
			}

			// いずれかのマイルストーンで targetItem が含まれている場合、そのショップ名リストの中に期待する名前があるか検証する
			found := false
			for _, m := range resp.Milestones {
				for _, item := range m.Items {
					if item.UniversalName == tt.targetItem {
						found = true
						shopNameFound := false
						for _, sn := range item.ShopNames {
							if sn.ShopKey == tt.targetShop {
								shopNameFound = true
								if sn.ShopName != tt.wantName {
									t.Errorf("shop=%s, universal=%s: shop_name = %q, want %q",
										tt.targetShop, tt.targetItem, sn.ShopName, tt.wantName)
								}
							}
						}
						if !shopNameFound {
							t.Errorf("shop %q not found in shop_names for item %q", tt.targetShop, tt.targetItem)
						}
					}
				}
			}
			if !found {
				t.Logf("targetItem %q はどのマイルストーンでも推薦されませんでした", tt.targetItem)
			}
		})
	}
}

// =============================================================================
// バリデーション（400 Bad Request）テスト
// =============================================================================

func TestGetMilestones_BadRequest_MissingBirthDate(t *testing.T) {
	r := setupRouter()
	w := doRequest(t, r, "/milestones")

	if w.Code != http.StatusBadRequest {
		t.Errorf("status = %d, want %d (missing birth_date should be rejected)", w.Code, http.StatusBadRequest)
	}
}

func TestGetMilestones_BadRequest_InvalidDateFormat(t *testing.T) {
	r := setupRouter()
	w := doRequest(t, r, "/milestones?birth_date=20251001")

	// フォーマット不正は 400 を返す
	if w.Code != http.StatusBadRequest {
		t.Errorf("status = %d, want %d (invalid date format should be rejected)", w.Code, http.StatusBadRequest)
	}
}
