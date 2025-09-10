/**
 * Baseball Lineup Management Business Logic
 *
 * This module contains all the business logic for managing baseball lineups,
 * including roster management, batting orders, defensive positioning,
 * and league rule validation. Uses Svelte 5 runes for reactive state management.
 */

import { replaceState } from '$app/navigation';
import { resolve } from '$app/paths';

// Types for better type safety
export interface PlayerStats {
	positionCounts: Record<string, number>;
	infieldInnings: number;
	benchInnings: number;
}

export interface LineupValidation {
	isValid: boolean;
	errors: string[];
}

export interface SittingAssignment {
	[inning: number]: string[];
}

// Constants
export const POSITIONS = [
	'Pitcher',
	'Catcher',
	'1st Base',
	'2nd Base',
	'3rd Base',
	'Shortstop',
	'Left Field',
	'Center Field',
	'Right Field'
] as const;

export const INNING_COUNT = 6;

// Reactive state using Svelte 5 runes
export const roster = $state<string[]>([]);
export const battingOrder = $state<string[]>([]);
export const generatedLineups = $state<Record<string, string[]>>({});
export const playerCapabilities = $state<Record<string, string[]>>({});

// Utility functions
export function getInfieldPositions(): string[] {
	return ['Pitcher', 'Catcher', '1st Base', '2nd Base', '3rd Base', 'Shortstop'];
}

export function isInfieldPosition(position: string): boolean {
	return getInfieldPositions().includes(position);
}

// Roster Management Functions
export function addPlayer(playerName: string): boolean {
	if (playerName.trim() && !roster.includes(playerName.trim())) {
		roster.push(playerName.trim());
		// Update URL with new state
		updateUrlFromState();
		return true;
	}
	return false;
}

export function removePlayer(player: string): void {
	const index = roster.indexOf(player);
	if (index > -1) {
		roster.splice(index, 1);
		// Also remove from batting order and capabilities
		removeFromBattingOrder(player);
		delete playerCapabilities[player];
		// Update URL with new state
		updateUrlFromState();
	}
}

export function updatePlayerName(oldName: string, newName: string): boolean {
	if (newName.trim() && !roster.includes(newName.trim())) {
		const index = roster.indexOf(oldName);
		if (index > -1) {
			roster[index] = newName.trim();

			// Update batting order
			const battingIndex = battingOrder.indexOf(oldName);
			if (battingIndex > -1) {
				battingOrder[battingIndex] = newName.trim();
			}

			// Update capabilities
			if (playerCapabilities[oldName]) {
				playerCapabilities[newName.trim()] = playerCapabilities[oldName];
				delete playerCapabilities[oldName];
			}

			// Update URL with new state
			updateUrlFromState();
			return true;
		}
	}
	return false;
}

// Batting Order Management
export function removeFromBattingOrder(player: string): void {
	const index = battingOrder.indexOf(player);
	if (index > -1) {
		battingOrder.splice(index, 1);
	}
}

export function randomizeBattingOrder(): void {
	// Create a shuffled copy of the roster
	const shuffled = [...roster].sort(() => Math.random() - 0.5);
	battingOrder.splice(0, battingOrder.length, ...shuffled);
	// Update URL with new state
	updateUrlFromState();
	console.log('Batting order randomized:', $state.snapshot(battingOrder));
}

// Player Capabilities Management
export function togglePlayerCapability(player: string, position: string): void {
	if (!playerCapabilities[player]) {
		playerCapabilities[player] = [];
	}

	const currentCapabilities = playerCapabilities[player];
	const index = currentCapabilities.indexOf(position);

	if (index > -1) {
		// Remove capability
		currentCapabilities.splice(index, 1);
	} else {
		// Add capability
		currentCapabilities.push(position);
	}

	// Update URL with new state
	updateUrlFromState();
}

export function canPlayerPlayPosition(player: string, position: string): boolean {
	return playerCapabilities[player]?.includes(position) || false;
}

export function allPlayersHaveCapabilities(): boolean {
	return roster.every(
		(player) => playerCapabilities[player] && playerCapabilities[player].length > 0
	);
}

// League Rules Validation
export function canPlayerPlayPositionInInning(
	player: string,
	position: string,
	playerStats: Record<string, PlayerStats>
): boolean {
	// Check if player can play this position
	if (!canPlayerPlayPosition(player, position)) {
		return false;
	}

	// Rule 1: Each player is limited to three (3) innings per position
	if (playerStats[player].positionCounts[position] >= 3) {
		return false;
	}

	// Rule 4: Any player who has played catcher for 4+ innings cannot pitch
	if (position === 'Pitcher' && playerStats[player].positionCounts['Catcher'] >= 4) {
		return false;
	}

	// Rule 5: Any pitcher who pitched 2+ innings may not then play catcher
	if (position === 'Catcher' && playerStats[player].positionCounts['Pitcher'] >= 2) {
		return false;
	}

	return true;
}

export function calculatePlayerStats(
	lineups: Record<string, string[]>
): Record<string, PlayerStats> {
	const stats: Record<string, PlayerStats> = {};

	// Initialize stats for all players
	roster.forEach((player) => {
		stats[player] = {
			positionCounts: {},
			infieldInnings: 0,
			benchInnings: 0
		};
		POSITIONS.forEach((position) => {
			stats[player].positionCounts[position] = 0;
		});
	});

	// Count innings for each player
	for (let inning = 0; inning < INNING_COUNT; inning++) {
		const playersOnField: string[] = [];

		// Count field positions
		POSITIONS.forEach((position) => {
			const player = lineups[position]?.[inning];
			if (player) {
				stats[player].positionCounts[position]++;
				playersOnField.push(player);
				if (isInfieldPosition(position)) {
					stats[player].infieldInnings++;
				}
			}
		});

		// Count bench innings
		roster.forEach((player) => {
			if (!playersOnField.includes(player)) {
				stats[player].benchInnings++;
			}
		});
	}

	return stats;
}

export function validateLineup(lineups: Record<string, string[]>): LineupValidation {
	const errors: string[] = [];
	const stats = calculatePlayerStats(lineups);

	// Rule 2: Each player must play a minimum of two (2) innings in the infield
	roster.forEach((player) => {
		if (stats[player].infieldInnings < 2) {
			errors.push(
				`${player} only played ${stats[player].infieldInnings} infield innings (minimum 2 required)`
			);
		}
	});

	// Rule 3: Players must not exceed 1 inning more on the bench than their teammates
	const benchInnings = roster.map((player) => stats[player].benchInnings);
	const maxBench = Math.max(...benchInnings);
	const minBench = Math.min(...benchInnings);
	if (maxBench - minBench > 1) {
		errors.push(
			`Bench time difference too large: max ${maxBench}, min ${minBench} (max difference allowed: 1)`
		);
	}

	return { isValid: errors.length === 0, errors };
}

// Defensive Lineup Generation
export function generateFairSittingAssignment(): SittingAssignment | null {
	const sittingPerInning = roster.length - 9;
	const sittingAssignment: SittingAssignment = {};

	// Initialize sitting assignment for each inning
	for (let inning = 0; inning < INNING_COUNT; inning++) {
		sittingAssignment[inning] = [];
	}

	// Track how many times each player sits
	const sittingCounts: Record<string, number> = {};
	roster.forEach((player) => {
		sittingCounts[player] = 0;
	});

	// Calculate target sitting time
	const totalSittingSlots = sittingPerInning * INNING_COUNT;
	const targetSittingPerPlayer = Math.floor(totalSittingSlots / roster.length);
	const maxSittingPerPlayer = targetSittingPerPlayer + 1; // Allow 1 extra sitting

	// Distribute sitting time fairly
	for (let inning = 0; inning < INNING_COUNT; inning++) {
		// Prioritize players who need to sit more to reach target
		const playersByPriority = [...roster].sort((a, b) => {
			const aCount = sittingCounts[a];
			const bCount = sittingCounts[b];

			// First priority: players who haven't reached target yet
			if (aCount < targetSittingPerPlayer && bCount >= targetSittingPerPlayer) return -1;
			if (aCount >= targetSittingPerPlayer && bCount < targetSittingPerPlayer) return 1;

			// Second priority: among players at same level, prefer those with fewer sittings
			return aCount - bCount;
		});

		// Filter to only players who can still sit (haven't exceeded max)
		const eligibleToSit = playersByPriority.filter(
			(player) => sittingCounts[player] < maxSittingPerPlayer
		);

		// If we don't have enough eligible players, this assignment won't work
		if (eligibleToSit.length < sittingPerInning) {
			return null;
		}

		// Select who sits this inning, prioritizing fairness
		const sittingThisInning: string[] = [];

		// First, try to fill with players who need to reach target
		const needToReachTarget = eligibleToSit.filter(
			(player) => sittingCounts[player] < targetSittingPerPlayer
		);

		// Add as many as we can from those who need to reach target
		const fromTarget = Math.min(needToReachTarget.length, sittingPerInning);
		for (let i = 0; i < fromTarget; i++) {
			sittingThisInning.push(needToReachTarget[i]);
		}

		// Fill remaining slots with other eligible players
		const remaining = sittingPerInning - sittingThisInning.length;
		if (remaining > 0) {
			const otherEligible = eligibleToSit.filter((player) => !sittingThisInning.includes(player));
			for (let i = 0; i < remaining && i < otherEligible.length; i++) {
				sittingThisInning.push(otherEligible[i]);
			}
		}

		sittingAssignment[inning] = sittingThisInning;

		// Update sitting counts
		sittingThisInning.forEach((player) => {
			sittingCounts[player]++;
		});
	}

	// Validate that bench time is fair (max 1 inning difference)
	const sittingCountsArray = Object.values(sittingCounts);
	const maxSitting = Math.max(...sittingCountsArray);
	const minSitting = Math.min(...sittingCountsArray);

	if (maxSitting - minSitting > 1) {
		return null; // Not fair enough
	}

	return sittingAssignment;
}

export function generateLineupsWithSittingAssignment(
	sittingAssignment: SittingAssignment
): Record<string, string[]> | null {
	const lineups: Record<string, string[]> = {};
	const playerStats: Record<string, PlayerStats> = {};

	// Initialize each position with empty array for 6 innings
	POSITIONS.forEach((position) => {
		lineups[position] = [];
	});

	// Initialize player stats
	roster.forEach((player) => {
		playerStats[player] = {
			positionCounts: {},
			infieldInnings: 0,
			benchInnings: 0
		};
		POSITIONS.forEach((position) => {
			playerStats[player].positionCounts[position] = 0;
		});
	});

	// Generate 6 lineups
	for (let inning = 0; inning < INNING_COUNT; inning++) {
		// Get players who are NOT sitting this inning
		const sittingThisInning = sittingAssignment[inning];
		const availablePlayers = roster.filter((player) => !sittingThisInning.includes(player));

		// Assign each position
		for (const position of POSITIONS) {
			// Find players who can play this position and respect league rules
			const eligiblePlayers = availablePlayers.filter((player) =>
				canPlayerPlayPositionInInning(player, position, playerStats)
			);

			if (eligiblePlayers.length > 0) {
				// Randomly select a player
				const randomIndex = Math.floor(Math.random() * eligiblePlayers.length);
				const selectedPlayer = eligiblePlayers[randomIndex];

				// Add to lineup
				lineups[position].push(selectedPlayer);

				// Update stats
				playerStats[selectedPlayer].positionCounts[position]++;
				if (isInfieldPosition(position)) {
					playerStats[selectedPlayer].infieldInnings++;
				}

				// Remove from available players for this inning
				const playerIndex = availablePlayers.indexOf(selectedPlayer);
				availablePlayers.splice(playerIndex, 1);
			} else {
				// No eligible players, this lineup generation failed
				return null;
			}
		}

		// Update bench innings for sitting players
		sittingThisInning.forEach((player) => {
			playerStats[player].benchInnings++;
		});
	}

	// Add sitting players to lineups
	for (let inning = 0; inning < INNING_COUNT; inning++) {
		const sittingThisInning = sittingAssignment[inning];
		sittingThisInning.forEach((sittingPlayer, index) => {
			const sittingKey = `Sitting ${index + 1}`;
			if (!lineups[sittingKey]) {
				lineups[sittingKey] = [];
			}
			lineups[sittingKey].push(sittingPlayer);
		});

		// Fill any remaining sitting slots with empty strings
		const sittingSlots = roster.length - 9;
		for (let i = sittingThisInning.length; i < sittingSlots; i++) {
			const sittingKey = `Sitting ${i + 1}`;
			if (!lineups[sittingKey]) {
				lineups[sittingKey] = [];
			}
			lineups[sittingKey].push('');
		}
	}

	return lineups;
}

export function generateSimpleLineups(): void {
	const lineups: Record<string, string[]> = {};

	// Initialize each position with empty array for 6 innings
	POSITIONS.forEach((position) => {
		lineups[position] = [];
	});

	// Generate 6 lineups (original simple logic)
	for (let inning = 0; inning < INNING_COUNT; inning++) {
		const availablePlayers = [...roster];

		// Assign each position
		POSITIONS.forEach((position) => {
			const eligiblePlayers = availablePlayers.filter((player) =>
				canPlayerPlayPosition(player, position)
			);

			if (eligiblePlayers.length > 0) {
				const randomIndex = Math.floor(Math.random() * eligiblePlayers.length);
				const selectedPlayer = eligiblePlayers[randomIndex];
				lineups[position].push(selectedPlayer);
				const playerIndex = availablePlayers.indexOf(selectedPlayer);
				availablePlayers.splice(playerIndex, 1);
			} else {
				lineups[position].push('');
			}
		});

		// Add sitting players as individual rows
		availablePlayers.forEach((sittingPlayer, index) => {
			const sittingKey = `Sitting ${index + 1}`;
			if (!lineups[sittingKey]) {
				lineups[sittingKey] = [];
			}
			lineups[sittingKey].push(sittingPlayer);
		});

		// Fill any remaining sitting slots with empty strings
		const sittingSlots = roster.length - 9;
		for (let i = availablePlayers.length; i < sittingSlots; i++) {
			const sittingKey = `Sitting ${i + 1}`;
			if (!lineups[sittingKey]) {
				lineups[sittingKey] = [];
			}
			lineups[sittingKey].push('');
		}
	}

	// Update the reactive state
	Object.assign(generatedLineups, lineups);
}

export function generateDefensiveLineups(): void {
	const maxAttempts = 1000;
	let attempts = 0;
	let bestLineups: Record<string, string[]> = {};
	let bestScore = -1;

	while (attempts < maxAttempts) {
		attempts++;

		// Step 1: Determine who sits each inning (fair bench time distribution)
		const sittingAssignment = generateFairSittingAssignment();
		if (!sittingAssignment) {
			continue; // Try again if we can't create fair sitting assignment
		}

		// Step 2: Generate lineups with predetermined sitting players
		const lineups = generateLineupsWithSittingAssignment(sittingAssignment);
		if (!lineups) {
			continue; // Try again if we can't create valid lineups
		}

		// Step 3: Validate the complete lineup
		const validation = validateLineup(lineups);
		if (validation.isValid) {
			// Perfect lineup found
			Object.assign(generatedLineups, lineups);
			// Update URL with new state
			updateUrlFromState();
			return;
		} else {
			// Calculate score for this lineup (fewer errors = better score)
			const score = -validation.errors.length;
			if (score > bestScore) {
				bestScore = score;
				bestLineups = structuredClone(lineups);
			}
		}
	}

	// If no perfect lineup found, use the best one we found
	if (Object.keys(bestLineups).length > 0) {
		Object.assign(generatedLineups, bestLineups);
		// Update URL with new state
		updateUrlFromState();
	} else {
		// Fallback to original simple generation if all attempts failed
		generateSimpleLineups();
		// Update URL with new state
		updateUrlFromState();
	}
}

export function clearGeneratedLineups(): void {
	Object.keys(generatedLineups).forEach((key) => delete generatedLineups[key]);
	// Update URL with new state
	updateUrlFromState();
}

// URL-based state management
export async function exportStateToUrl(): Promise<string> {
	const state = {
		roster: [...roster],
		playerCapabilities: { ...playerCapabilities },
		generatedLineups: { ...generatedLineups },
		battingOrder: [...battingOrder]
	};

	// Import the serialization functions dynamically to avoid circular dependencies
	const { encodeState } = await import('./state-serialization');
	const { validateWithSchema } = await import('./state-serialization');
	const { BaseballLineupStateSchema } = await import('./baseball-schema');

	// Validate and encode
	const validatedState = validateWithSchema(state, BaseballLineupStateSchema);
	return await encodeState(validatedState);
}

export async function importStateFromUrl(
	hash: string
): Promise<{ success: boolean; tab?: string }> {
	try {
		// Import the serialization functions dynamically
		const { decodeState } = await import('./state-serialization');
		const { validateWithSchema } = await import('./state-serialization');
		const { BaseballLineupStateSchema } = await import('./baseball-schema');

		// Extract tab parameter if present
		let tab: string | undefined;
		if (hash.includes('&tab=')) {
			const tabMatch = hash.match(/&tab=([^~]+)/);
			if (tabMatch) {
				tab = tabMatch[1];
			}
		}

		// Clean the hash to remove tab parameter if present
		// Handle both formats: #v1=data&tab=batting~checksum and #v1=data~checksum
		let cleanHash = hash;
		if (hash.includes('&tab=')) {
			// Remove tab parameter: #v1=data&tab=batting~checksum -> #v1=data~checksum
			cleanHash = hash.replace(/&tab=[^~]+/, '');
		}

		console.log('Original hash:', hash);
		console.log('Clean hash for decoding:', cleanHash);
		console.log('Extracted tab:', tab);

		// Decode and validate
		const decodedData = await decodeState(cleanHash);
		const validatedState = validateWithSchema(decodedData, BaseballLineupStateSchema);

		// Update state
		roster.splice(0, roster.length, ...validatedState.roster);
		Object.assign(playerCapabilities, validatedState.playerCapabilities);
		Object.assign(generatedLineups, validatedState.generatedLineups);
		battingOrder.splice(0, battingOrder.length, ...(validatedState.battingOrder || []));

		console.log('State loaded from URL - Batting order:', $state.snapshot(battingOrder));

		// Note: No longer saving to localStorage - state is managed via URL

		return { success: true, tab };
	} catch (error) {
		console.error('Failed to import state from URL:', error);
		return { success: false };
	}
}

export async function estimateUrlSize(): Promise<number> {
	const state = {
		roster: [...roster],
		playerCapabilities: { ...playerCapabilities },
		generatedLineups: { ...generatedLineups },
		battingOrder: [...battingOrder]
	};

	const { estimateSize } = await import('./state-serialization');
	return await estimateSize(state);
}

// Auto-update URL when state changes
async function updateUrlFromState(): Promise<void> {
	if (typeof window === 'undefined') return;

	try {
		const urlFragment = await exportStateToUrl();

		// Check if current URL has a tab parameter and preserve it
		const currentHash = window.location.hash;
		let finalUrl = urlFragment;

		if (currentHash.includes('&tab=')) {
			// Extract the last tab parameter (in case there are multiple)
			const tabMatches = currentHash.match(/&tab=([^~]+)/g);
			if (tabMatches && tabMatches.length > 0) {
				// Get the last tab parameter
				const lastTabMatch = tabMatches[tabMatches.length - 1];
				const tab = lastTabMatch.replace('&tab=', '');
				const statePart = urlFragment.split('~')[0];
				const checksumPart = urlFragment.split('~')[1];
				finalUrl = `${statePart}&tab=${tab}~${checksumPart}`;
			}
		}

		// Update URL using browser history API (SvelteKit compatible)
		if (typeof window !== 'undefined') {
			replaceState(resolve(('#' + finalUrl) as '/'), {});
		}
	} catch (error) {
		console.error('Failed to update URL from state:', error);
	}
}

// Initialization function
export async function initializeBaseballLineup(): Promise<void> {
	// Check for URL state first (priority over localStorage)
	if (typeof window !== 'undefined') {
		const hash = window.location.hash;
		if (hash && hash.includes('#v1=')) {
			// Try to load state from URL first
			try {
				const result = await importStateFromUrl(hash);
				if (result.success) {
					console.log('Loaded state from URL');
					// Set the tab if it was specified in the URL
					if (result.tab && typeof window !== 'undefined') {
						// Dispatch a custom event to notify the page component about the tab
						window.dispatchEvent(
							new CustomEvent('urlStateLoaded', { detail: { tab: result.tab } })
						);
					} else {
						// No tab specified, dispatch event to clear loading state
						window.dispatchEvent(new CustomEvent('urlStateLoaded', { detail: { tab: null } }));
					}
					// Don't randomize batting order when loading from URL - it's already set
				} else {
					console.warn('Failed to load state from URL');
					// Dispatch event to clear loading state and set default tab
					if (typeof window !== 'undefined') {
						window.dispatchEvent(new CustomEvent('urlStateLoaded', { detail: { tab: null } }));
					}
					// No fallback - just initialize with empty state
				}
			} catch (error) {
				console.error('Error loading state from URL:', error);
				// Dispatch event to clear loading state and set default tab
				if (typeof window !== 'undefined') {
					window.dispatchEvent(new CustomEvent('urlStateLoaded', { detail: { tab: null } }));
				}
			}
			return; // Exit early if we're loading from URL
		}
	}

	// Initialize batting order if we have players but no batting order
	if (roster.length > 0 && battingOrder.length === 0) {
		randomizeBattingOrder();
	}
}
