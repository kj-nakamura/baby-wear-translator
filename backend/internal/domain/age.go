package domain

import (
	"time"
)

// CalculateAgeInMonths は生年月日と現在の日付から月齢を算出します。
func CalculateAgeInMonths(birthDate, currentDate time.Time) int {
	years := currentDate.Year() - birthDate.Year()
	months := int(currentDate.Month()) - int(birthDate.Month())
	days := currentDate.Day() - birthDate.Day()

	totalMonths := years*12 + months

	// 日数が誕生日に達していない場合は1ヶ月マイナスする
	if days < 0 {
		totalMonths--
	}

	if totalMonths < 0 {
		return 0
	}

	return totalMonths
}
