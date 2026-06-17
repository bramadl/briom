export function seededRandom(seed: string) {
	let hash = 0;
	for (let i = 0; i < seed.length; i++) {
		const char = seed.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash;
	}
	const x = Math.sin(hash) * 10000;
	return x - Math.floor(x);
}

export function shuffleWithSeed<T>(arr: T[], seed: string): T[] {
	const result = [...arr];
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(seededRandom(`${seed}-${i}`) * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}
	return result;
}
