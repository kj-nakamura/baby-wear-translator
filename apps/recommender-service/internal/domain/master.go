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

// Category はアイテムのカテゴリー情報です
type Category struct {
	Label string
	Emoji string
	Color string
}

// ItemCategories は汎用名からカテゴリー情報へのマップです
var ItemCategories = map[string]Category{
	"短肌着":     {Label: "インナー", Emoji: "👶", Color: "#FFF3E0"},
	"コンビ肌着":   {Label: "インナー", Emoji: "👶", Color: "#FFF3E0"},
	"ボディースーツ": {Label: "ミドル", Emoji: "🧸", Color: "#E3F2FD"},
	"カバーオール":  {Label: "アウター", Emoji: "🧥", Color: "#EDE7F6"},
	"ロンパース":   {Label: "ミドル", Emoji: "🧸", Color: "#E3F2FD"},
}
