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

// recommendResponse はテスト用のレスポンス型です。
type recommendResponse struct {
	AgeInMonths int `json:"age_in_months"`
	Items       []struct {
		UniversalName    string            `json:"universal_name"`
		ShopSpecificName string            `json:"shop_specific_name"`
		OtherShopNames   map[string]string `json:"other_shop_names"`
	} `json:"items"`
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

func TestGetRecommendation_OK_BasicResponse(t *testing.T) {
	r := setupRouter()
	w := doRequest(t, r, "/recommend?birth_date=2025-10-01&target_shop=nishimatsuya")

	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d; body = %s", w.Code, http.StatusOK, w.Body.String())
	}

	var resp recommendResponse
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("json.Unmarshal: %v; body = %s", err, w.Body.String())
	}

	if resp.AgeInMonths < 0 {
		t.Errorf("age_in_months = %d, must be >= 0", resp.AgeInMonths)
	}
	if len(resp.Items) == 0 {
		t.Error("items should not be empty for this input")
	}
}

func TestGetRecommendation_OK_ShopSpecificName(t *testing.T) {
	r := setupRouter()

	tests := []struct {
		name       string
		shop       string
		wantName   string // カバーオールの固有名
		birthDate  string
		targetItem string // universal_name
	}{
		{
			name:       "西松屋: カバーオール → プレオール",
			shop:       "nishimatsuya",
			wantName:   "プレオール",
			birthDate:  "2025-10-01",
			targetItem: "カバーオール",
		},
		{
			name:       "ユニクロ: カバーオール → フライスカバーオール",
			shop:       "uniqlo",
			wantName:   "フライスカバーオール",
			birthDate:  "2025-10-01",
			targetItem: "カバーオール",
		},
		{
			name:       "アカチャンホンポ: カバーオール → ドレスオール",
			shop:       "akachan_honpo",
			wantName:   "ドレスオール",
			birthDate:  "2025-10-01",
			targetItem: "カバーオール",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			url := "/recommend?birth_date=" + tt.birthDate + "&target_shop=" + tt.shop
			w := doRequest(t, r, url)

			if w.Code != http.StatusOK {
				t.Fatalf("status = %d, want %d", w.Code, http.StatusOK)
			}

			var resp recommendResponse
			if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
				t.Fatalf("json.Unmarshal: %v", err)
			}

			// targetItem がレスポンスに含まれている場合のみ、名前を検証する
			for _, item := range resp.Items {
				if item.UniversalName == tt.targetItem {
					if item.ShopSpecificName != tt.wantName {
						t.Errorf("shop=%s, universal=%s: shop_specific_name = %q, want %q",
							tt.shop, tt.targetItem, item.ShopSpecificName, tt.wantName)
					}
					return
				}
			}
			// targetItem がレスポンスに含まれない場合はスキップ（月齢/気温依存）
			t.Logf("targetItem %q はこの月齢/気温では推薦されませんでした", tt.targetItem)
		})
	}
}

func TestGetRecommendation_OK_OtherShopNames(t *testing.T) {
	r := setupRouter()
	w := doRequest(t, r, "/recommend?birth_date=2025-10-01&target_shop=nishimatsuya")

	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusOK)
	}

	var resp recommendResponse
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("json.Unmarshal: %v", err)
	}

	for _, item := range resp.Items {
		// other_shop_names は選択ショップ（nishimatsuya）を含んではいけない
		if _, ok := item.OtherShopNames["nishimatsuya"]; ok {
			t.Errorf("universal=%s: other_shop_names に選択ショップ nishimatsuya が含まれています", item.UniversalName)
		}
	}
}

func TestGetRecommendation_OK_NoTargetShop(t *testing.T) {
	r := setupRouter()
	// target_shop を省略してもエラーにならない
	w := doRequest(t, r, "/recommend?birth_date=2025-10-01")

	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d; body = %s", w.Code, http.StatusOK, w.Body.String())
	}
}

// =============================================================================
// バリデーション（400 Bad Request）テスト
// =============================================================================

func TestGetRecommendation_BadRequest_BirthDateAfterTargetDate(t *testing.T) {
	r := setupRouter()

	// 1. target_date が指定されていない場合（デフォルト＝今日）、今日より未来の birth_date はエラー
	w1 := doRequest(t, r, "/recommend?birth_date=2099-12-31&target_shop=nishimatsuya")
	if w1.Code != http.StatusBadRequest {
		t.Errorf("status = %d, want %d (future birth_date should be rejected when target_date is not set)", w1.Code, http.StatusBadRequest)
	}

	// 2. target_date が指定されている場合、それより未来の birth_date はエラー
	w2 := doRequest(t, r, "/recommend?birth_date=2025-10-15&target_date=2025-10-01&target_shop=nishimatsuya")
	if w2.Code != http.StatusBadRequest {
		t.Errorf("status = %d, want %d (birth_date after target_date should be rejected)", w2.Code, http.StatusBadRequest)
	}

	var body map[string]string
	if err := json.Unmarshal(w2.Body.Bytes(), &body); err != nil {
		t.Fatalf("json.Unmarshal: %v", err)
	}
	if body["error"] == "" {
		t.Error("error field should not be empty in 400 response")
	}
}

func TestGetRecommendation_BadRequest_MissingBirthDate(t *testing.T) {
	r := setupRouter()
	w := doRequest(t, r, "/recommend")

	if w.Code != http.StatusBadRequest {
		t.Errorf("status = %d, want %d (missing birth_date should be rejected)", w.Code, http.StatusBadRequest)
	}
}

func TestGetRecommendation_BadRequest_InvalidDateFormat(t *testing.T) {
	r := setupRouter()
	w := doRequest(t, r, "/recommend?birth_date=20251001")

	// フォーマット不正は 400 を返す
	if w.Code != http.StatusBadRequest {
		t.Errorf("status = %d, want %d (invalid date format should be rejected)", w.Code, http.StatusBadRequest)
	}
}
