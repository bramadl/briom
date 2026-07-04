/**
 * @description
 * Top 4 ranked models according to OpenRouter's
 * ranking (determined by token processed weekly).
 *
 * @note
 * For the simplest and the most pragmatic way
 * to rank the models. Data are coming from
 * OpenRouter ranking page. This list here will
 * be periodically updated until a more sophisticated
 * ranking algorithm introduced. For MVP, this is
 * sufficient enough.
 */
export const FEATURED_MODEL_IDS = new Set<string>([
	"deepseek/deepseek-v4-flash",
	"xiaomi/mimo-v2.5",
	"minimax/minimax-m3",
	"tencent/hy3-preview",
]);
