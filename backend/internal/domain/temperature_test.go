package domain_test

import (
	"testing"
	"time"

	"github.com/kenji/baby-wear-translator/backend/internal/domain"
)

func TestEstimateTemperature(t *testing.T) {
	tests := []struct {
		name     string
		date     time.Time
		wantTemp float64
	}{
		{
			name:     "1月",
			date:     time.Date(2025, time.January, 15, 0, 0, 0, 0, time.UTC),
			wantTemp: 5.0,
		},
		{
			name:     "8月",
			date:     time.Date(2025, time.August, 1, 0, 0, 0, 0, time.UTC),
			wantTemp: 26.0,
		},
		{
			name:     "11月",
			date:     time.Date(2025, time.November, 30, 0, 0, 0, 0, time.UTC),
			wantTemp: 12.0,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := domain.EstimateTemperature(tt.date)
			if got != tt.wantTemp {
				t.Errorf("EstimateTemperature() = %v, want %v", got, tt.wantTemp)
			}
		})
	}
}
