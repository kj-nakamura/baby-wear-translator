package domain_test

import (
	"testing"
	"time"

	"github.com/kenji/baby-wear-translator/backend/internal/domain"
)

// parseDate は YYYY-MM-DD 文字列を time.Time に変換するヘルパーです。
func parseDate(t *testing.T, s string) time.Time {
	t.Helper()
	tm, err := time.Parse("2006-01-02", s)
	if err != nil {
		t.Fatalf("parseDate(%q): %v", s, err)
	}
	return tm
}

func TestCalculateAgeInMonths(t *testing.T) {
	tests := []struct {
		name      string
		birthDate string
		today     string
		want      int
	}{
		// --- 基本ケース ---
		{
			name:      "生後ちょうど0日",
			birthDate: "2025-10-01",
			today:     "2025-10-01",
			want:      0,
		},
		{
			name:      "生後29日（まだ1ヶ月未満）",
			birthDate: "2025-10-01",
			today:     "2025-10-30",
			want:      0,
		},
		{
			name:      "生後ちょうど1ヶ月",
			birthDate: "2025-10-01",
			today:     "2025-11-01",
			want:      1,
		},
		{
			name:      "生後4ヶ月と10日",
			birthDate: "2025-10-01",
			today:     "2026-02-11",
			want:      4,
		},
		{
			name:      "生後ちょうど12ヶ月（1歳の誕生日）",
			birthDate: "2025-01-01",
			today:     "2026-01-01",
			want:      12,
		},

		// --- 月をまたぐ境界値 ---
		{
			name:      "誕生日の前日（まだ前月扱い）",
			birthDate: "2025-10-15",
			today:     "2025-11-14",
			want:      0,
		},
		{
			name:      "誕生日当日（1ヶ月になる日）",
			birthDate: "2025-10-15",
			today:     "2025-11-15",
			want:      1,
		},

		// --- 月末・月初の境界 ---
		{
			name:      "月末生まれ: 1/31生まれ → 2/28",
			birthDate: "2025-01-31",
			today:     "2025-02-28",
			want:      0,
		},
		{
			name:      "月末生まれ: 1/31生まれ → 3/01",
			birthDate: "2025-01-31",
			today:     "2025-03-01",
			want:      1,
		},

		// --- 年をまたぐ ---
		{
			name:      "12月生まれ → 翌年1月",
			birthDate: "2024-12-01",
			today:     "2025-01-01",
			want:      1,
		},
		{
			name:      "12月生まれ → 翌年2月（生後2ヶ月）",
			birthDate: "2024-12-15",
			today:     "2025-02-15",
			want:      2,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			birth := parseDate(t, tt.birthDate)
			today := parseDate(t, tt.today)
			got := domain.CalculateAgeInMonths(birth, today)
			if got != tt.want {
				t.Errorf("CalculateAgeInMonths(%s, %s) = %d, want %d",
					tt.birthDate, tt.today, got, tt.want)
			}
		})
	}
}

// TestCalculateAgeInMonths_NeverNegative は月齢が決して負にならないことを確認します。
func TestCalculateAgeInMonths_NeverNegative(t *testing.T) {
	// 未来の生年月日（バリデーションはハンドラー層で弾くが、ドメイン関数は0を返す仕様）
	birth := parseDate(t, "2099-12-31")
	today := parseDate(t, "2025-01-01")
	got := domain.CalculateAgeInMonths(birth, today)
	if got < 0 {
		t.Errorf("CalculateAgeInMonths returned negative value: %d", got)
	}
}

func BenchmarkCalculateAgeInMonths(b *testing.B) {
	birth := time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC)
	today := time.Date(2025, 2, 24, 0, 0, 0, 0, time.UTC)
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		domain.CalculateAgeInMonths(birth, today)
	}
}

func FuzzCalculateAgeInMonths(f *testing.F) {
	f.Add(int64(1704067200), int64(1740355200)) // 2024-01-01, 2025-02-24
	f.Fuzz(func(t *testing.T, birthUnix, todayUnix int64) {
		birth := time.Unix(birthUnix, 0)
		today := time.Unix(todayUnix, 0)

		// Should not panic
		age := domain.CalculateAgeInMonths(birth, today)

		// Basic sanity check: if today is before birth, age must be 0
		if today.Before(birth) && age != 0 {
			t.Errorf("expected age 0 for today before birth, got %d", age)
		}
	})
}
