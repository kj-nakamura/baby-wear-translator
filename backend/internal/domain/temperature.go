package domain

import "time"

// 月ごとの平均気温（東京周辺の目安、単位: ℃）
// TODO: 将来的にエリア設定等を入れればより正確になりますが、今のところ共通の目安とします。
var monthlyAverageTemp = map[time.Month]float64{
	time.January:   5.0,
	time.February:  6.0,
	time.March:     9.0,
	time.April:     14.0,
	time.May:       18.0,
	time.June:      21.0,
	time.July:      25.0,
	time.August:    26.0,
	time.September: 23.0,
	time.October:   18.0,
	time.November:  12.0,
	time.December:  8.0,
}

// EstimateTemperature は日付に対応するおおよその気温を推測します。
func EstimateTemperature(date time.Time) float64 {
	month := date.Month()
	if temp, ok := monthlyAverageTemp[month]; ok {
		return temp
	}
	return 15.0 // フォールバック
}
