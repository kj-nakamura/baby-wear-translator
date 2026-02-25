package domain_test

import (
	"slices"
	"testing"

	"github.com/kenji/baby-wear-translator/backend/internal/domain"
)

func TestRecommend(t *testing.T) {
	tests := []struct {
		name        string
		ageInMonths int
		temperature float64
		wantItems   []string // 順序は問わず含まれるべきアイテム
		wantAbsent  []string // 含まれてはいけないアイテム
	}{
		// =================================================================
		// 低月齢（0〜3ヶ月）
		// =================================================================
		{
			name:        "低月齢 / 極寒（0℃）: インナー2枚+カバーオール",
			ageInMonths: 2,
			temperature: 0,
			wantItems:   []string{"短肌着", "コンビ肌着", "カバーオール"},
			wantAbsent:  []string{"ロンパース", "ボディースーツ"},
		},
		{
			name:        "低月齢 / 寒い（14℃）: カバーオールが適切",
			ageInMonths: 1,
			temperature: 14,
			wantItems:   []string{"短肌着", "コンビ肌着", "カバーオール"},
			wantAbsent:  []string{"ロンパース"},
		},
		{
			name:        "低月齢 / 肌寒い（15℃）: ロンパースに切り替わる境界",
			ageInMonths: 3,
			temperature: 15,
			wantItems:   []string{"短肌着", "コンビ肌着", "ロンパース"},
			wantAbsent:  []string{"カバーオール"},
		},
		{
			name:        "低月齢 / 涼しい（19℃）: ロンパース着用",
			ageInMonths: 0,
			temperature: 19,
			wantItems:   []string{"短肌着", "コンビ肌着", "ロンパース"},
			wantAbsent:  []string{"カバーオール"},
		},
		{
			name:        "低月齢 / 快適（20℃）: インナーのみ",
			ageInMonths: 2,
			temperature: 20,
			wantItems:   []string{"短肌着", "コンビ肌着"},
			wantAbsent:  []string{"カバーオール", "ロンパース"},
		},
		{
			name:        "低月齢 / 暑い（25℃）: 短肌着1枚",
			ageInMonths: 3,
			temperature: 25,
			wantItems:   []string{"短肌着"},
			wantAbsent:  []string{"コンビ肌着", "カバーオール", "ロンパース"},
		},
		{
			name:        "低月齢 / 猛暑（35℃）: 短肌着1枚のみ",
			ageInMonths: 1,
			temperature: 35,
			wantItems:   []string{"短肌着"},
			wantAbsent:  []string{"コンビ肌着", "カバーオール", "ロンパース", "ボディースーツ"},
		},

		// =================================================================
		// 高月齢（4ヶ月以上）
		// =================================================================
		{
			name:        "高月齢 / 極寒（-5℃）: ボディースーツ+カバーオール",
			ageInMonths: 6,
			temperature: -5,
			wantItems:   []string{"ボディースーツ", "カバーオール"},
			wantAbsent:  []string{"短肌着", "コンビ肌着", "ロンパース"},
		},
		{
			name:        "高月齢 / 寒い（10℃）: カバーオール",
			ageInMonths: 8,
			temperature: 10,
			wantItems:   []string{"ボディースーツ", "カバーオール"},
			wantAbsent:  []string{"ロンパース"},
		},
		{
			name:        "高月齢 / 肌寒い（15℃）: ロンパース",
			ageInMonths: 4,
			temperature: 15,
			wantItems:   []string{"ボディースーツ", "ロンパース"},
			wantAbsent:  []string{"カバーオール"},
		},
		{
			name:        "高月齢 / 快適（22℃）: ボディースーツのみ（境界ちょうど）",
			ageInMonths: 10,
			temperature: 22,
			wantItems:   []string{"ボディースーツ"},
			wantAbsent:  []string{"カバーオール", "ロンパース"},
		},
		{
			name:        "高月齢 / 暑い（30℃）: ボディースーツのみ",
			ageInMonths: 12,
			temperature: 30,
			wantItems:   []string{"ボディースーツ"},
			wantAbsent:  []string{"カバーオール", "ロンパース", "短肌着"},
		},

		// =================================================================
		// 月齢境界（3ヶ月 vs 4ヶ月）
		// =================================================================
		{
			name:        "月齢境界: 3ヶ月はインナー系（寒い）",
			ageInMonths: 3,
			temperature: 10,
			wantItems:   []string{"短肌着", "コンビ肌着"},
			wantAbsent:  []string{"ボディースーツ"},
		},
		{
			name:        "月齢境界: 4ヶ月はボディースーツ系（寒い）",
			ageInMonths: 4,
			temperature: 10,
			wantItems:   []string{"ボディースーツ"},
			wantAbsent:  []string{"短肌着", "コンビ肌着"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := domain.Recommend(tt.ageInMonths, tt.temperature)

			for _, item := range tt.wantItems {
				if !slices.Contains(got, item) {
					t.Errorf("Recommend(%d, %.1f) = %v, want to contain %q",
						tt.ageInMonths, tt.temperature, got, item)
				}
			}

			for _, item := range tt.wantAbsent {
				if slices.Contains(got, item) {
					t.Errorf("Recommend(%d, %.1f) = %v, should NOT contain %q",
						tt.ageInMonths, tt.temperature, got, item)
				}
			}
		})
	}
}

// TestRecommend_NeverReturnsNil はnilではなく空スライスを返すことを確認します。
func TestRecommend_NeverReturnsNil(t *testing.T) {
	// 極端な値でもpanicしないことも確認
	result := domain.Recommend(0, 100)
	if result == nil {
		t.Error("Recommend should never return nil")
	}
}

func BenchmarkRecommend(b *testing.B) {
	for i := 0; i < b.N; i++ {
		domain.Recommend(4, 15.5)
	}
}

func FuzzRecommend(f *testing.F) {
	f.Add(0, 20.0)
	f.Add(6, 5.0)
	f.Add(12, 30.0)
	f.Fuzz(func(t *testing.T, age int, temp float64) {
		// Should not panic for any input
		domain.Recommend(age, temp)
	})
}
