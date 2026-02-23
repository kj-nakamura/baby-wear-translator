package domain

// ShopSpecificNames は汎用名からショップ固有の名前に変換するためのマップです
// universal_name -> shop_id -> shop_specific_name
var ShopSpecificNames = map[string]map[string]string{
	"短肌着": {
		"nishimatsuya":  "短肌着",
		"uniqlo":        "コットン前開き短肌着",
		"akachan_honpo": "短肌着",
	},
	"コンビ肌着": {
		"nishimatsuya":  "コンビ肌着",
		"uniqlo":        "コットン前開きコンビ肌着",
		"akachan_honpo": "コンビ肌着",
	},
	"ボディースーツ": {
		"nishimatsuya":  "ボディスーツ",
		"uniqlo":        "クルーネックボディスーツ",
		"akachan_honpo": "長袖ボディシャツ",
	},
	"カバーオール": {
		"nishimatsuya":  "プレオール",
		"uniqlo":        "フライスカバーオール",
		"akachan_honpo": "ドレスオール",
	},
	"ロンパース": {
		"nishimatsuya":  "ロンパス",
		"uniqlo":        "ショートオール",
		"akachan_honpo": "ロンパース",
	},
}
