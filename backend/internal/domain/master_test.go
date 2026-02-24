package domain_test

import (
	"testing"

	"github.com/kenji/baby-wear-translator/backend/internal/domain"
)

var expectedShops = []string{"nishimatsuya", "uniqlo", "akachan_honpo"}

// TestShopSpecificNames_AllUniversalNamesHaveAllShops は、
// すべての汎用名について全ショップの固有名が定義されていることを確認します。
func TestShopSpecificNames_AllUniversalNamesHaveAllShops(t *testing.T) {
	for uname, shopMap := range domain.ShopSpecificNames {
		for _, shopID := range expectedShops {
			if _, ok := shopMap[shopID]; !ok {
				t.Errorf("ShopSpecificNames[%q] は shopID=%q のエントリが存在しません", uname, shopID)
			}
		}
	}
}

// TestShopSpecificNames_NoEmptyName は、すべての固有名が空文字でないことを確認します。
func TestShopSpecificNames_NoEmptyName(t *testing.T) {
	for uname, shopMap := range domain.ShopSpecificNames {
		for shopID, specificName := range shopMap {
			if specificName == "" {
				t.Errorf("ShopSpecificNames[%q][%q] が空文字です", uname, shopID)
			}
		}
	}
}

// TestShopSpecificNames_RecommendedItemsAreMapped は、
// Recommend 関数が返す可能性のある全 universal_name について
// ShopSpecificNames にマッピングが存在することを確認します。
func TestShopSpecificNames_RecommendedItemsAreMapped(t *testing.T) {
	// Recommend が返しうるすべての universal_name を収集する
	// （月齢 0〜12 × 代表的な気温帯を網羅）
	temps := []float64{-10, 5, 15, 20, 22, 30}
	ages := []int{0, 1, 2, 3, 4, 6, 12}

	seen := map[string]bool{}
	for _, age := range ages {
		for _, temp := range temps {
			for _, item := range domain.Recommend(age, temp) {
				seen[item] = true
			}
		}
	}

	for uname := range seen {
		if _, ok := domain.ShopSpecificNames[uname]; !ok {
			t.Errorf("Recommend が返す %q に対応する ShopSpecificNames エントリが存在しません", uname)
		}
	}
}
