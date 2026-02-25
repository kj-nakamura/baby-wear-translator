package domain

// EstimateSize は月齢に基づいて大まかな服のサイズを推測します。
// （※あくまで一般的な目安であり、赤ちゃんにより個人差があります）
func EstimateSize(ageInMonths int) string {
	if ageInMonths < 3 {
		return "50-60cm"
	}
	if ageInMonths < 6 {
		return "60-70cm"
	}
	if ageInMonths < 12 {
		return "70-80cm"
	}
	if ageInMonths < 18 {
		return "80cm"
	}
	if ageInMonths < 24 {
		return "90cm"
	}
	return "90cm+"
}
