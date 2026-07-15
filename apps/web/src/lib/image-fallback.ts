// Smart image fallback ─────────────────────────────────────────────
// When an item (vendor product, service, order line, …) has no photo of
// its own, we show a local web-image whose subject matches the item's
// NAME/category — so nothing ever renders as a blank placeholder, and the
// picture still "makes sense" for what's being sold.
//
// All images are files that already live in /public/web (downloaded from
// Unsplash), so there is no external request and no broken-image risk.

const W = (id: string) => `/web/photo-${id}.jpg`;

// Ordered most-specific → most-generic. First matching rule wins.
const RULES: [RegExp, string][] = [
  [/laptop|note\s?book|mac\s?book|think\s?pad|elite\s?book|pro\s?book|latitude|ideapad|chrome\s?book|zen\s?book|vivo\s?book|spectre|envy|inspiron|\bxps\b|swift|aspire|legion|rog|nitro|omen|victus|surface/i, W("1496181133206-80ce9b88a853")],
  [/desk\s?top|\bpc\b|tower|optiplex|prodesk|think\s?centre|work\s?station|all-?in-?one|mini\s?pc|\bcpu\b/i, W("1587202372775-e229f172b9d7")],
  [/phone|smart\s?phone|i\s?phone|android|tecno|infinix|\bitel\b|redmi|samsung|galaxy|oppo|\bvivo\b|huawei|mobile/i, W("1512941937669-90a1b58e7e9c")],
  [/tablet|i\s?pad/i, W("1512941937669-90a1b58e7e9c")],
  [/\bram\b|memory|ddr\d|\bdimm\b|sodimm/i, W("1618410320928-25228d811631")],
  [/\bssd\b|\bhdd\b|hard\s?drive|storage|nvme|flash\s?disk|usb\s?drive|memory\s?card|\bsd\s?card\b|external\s?drive|\bdisk\b/i, W("1625842268584-8f3296236761")],
  [/mouse|key\s?board|accessor|cable|adapter|\bhub\b|web\s?cam|head\s?set|head\s?phone|ear\s?bud|ear\s?phone|speaker|\bdock\b|stylus/i, W("1527864550417-7fd91fc51a46")],
  [/charger|power\s?bank|\bpower\b|battery|\bups\b|inverter|solar|adaptor/i, W("1609091839311-d5365f9ff1c5")],
  [/router|net\s?work|wi-?fi|switch|\blan\b|modem|access\s?point|ethernet/i, W("1601737487795-dab272f52420")],
  [/cctv|camera|security|surveillance|\bdvr\b|\bnvr\b/i, W("1601737487795-dab272f52420")],
  [/monitor|screen|display|projector|\btv\b/i, W("1587202372775-e229f172b9d7")],
  [/printer|scanner|toner|\bink\b|photo\s?copy/i, W("1527864550417-7fd91fc51a46")],
  [/web\s?site|web\s?dev|e-?commerce|landing\s?page|\bweb\b/i, W("1547658719-da2b51169166")],
  [/software|system|\bapp\b|\bpos\b|\berp\b|\bcrm\b|\blms\b|data\s?base|automation/i, W("1551288049-bebda4e38f71")],
  [/repair|\bfix\b|maintenance|servicing|install|upgrade|it\s?support|\bsupport\b/i, W("1581092160562-40aa08e78837")],
  [/course|class|training|learn|tutorial|lesson|academy|skill|certificate/i, W("1516321318423-f06f85e504b3")],
  [/design|graphic|\blogo\b|brand|poster|flyer|banner|\bprint\b/i, W("1547658719-da2b51169166")],
];

// Generic tech fallback for anything we can't classify.
const DEFAULT = W("1556910103-1c02745aae4d");

/** A local web-image whose subject best matches the given name/category. */
export function fallbackImage(name = "", category = ""): string {
  const hay = `${name} ${category}`;
  for (const [re, path] of RULES) if (re.test(hay)) return path;
  return DEFAULT;
}
