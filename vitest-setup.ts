import { vi } from 'vitest';

// Mock Svelte 5 runes globally for testing
global.$state = vi.fn((initialValue) => {
	if (Array.isArray(initialValue)) {
		return initialValue;
	}
	if (typeof initialValue === 'object' && initialValue !== null) {
		return { ...initialValue };
	}
	return initialValue;
});

global.$state.snapshot = vi.fn((value) => value);

// Mock SvelteKit modules
vi.mock('$app/navigation', () => ({
	replaceState: vi.fn()
}));

vi.mock('$app/paths', () => ({
	resolve: vi.fn((path: string) => path)
}));
