package domain

// Recommend は月齢と気温に基づいて、推奨されるベビー服の universal_name のリストを返します。
func Recommend(ageInMonths int, temperature float64) []string {
	var items []string

	// 低月齢（3ヶ月以下）とそれ以降で基本の組み合わせを分ける
	if ageInMonths <= 3 {
		// 基本のインナー
		if temperature < 25 {
			items = append(items, "短肌着", "コンビ肌着")
		} else {
			items = append(items, "短肌着")
		}

		// 重ね着（ミドル/アウター）
		if temperature < 15 {
			items = append(items, "カバーオール")
		} else if temperature < 20 {
			items = append(items, "ロンパース")
		}
	} else {
		// 4ヶ月以降：動きやすさを考慮してボディースーツがメイン
		items = append(items, "ボディースーツ")

		if temperature < 15 {
			items = append(items, "カバーオール")
		} else if temperature < 22 {
			items = append(items, "ロンパース")
		}
	}

	return items
}
