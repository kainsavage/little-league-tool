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
export const playerAttendance = $state<Record<string, boolean>>({});
export const gameMetadata = $state<{
	gameDate: string;
	gameTime: string;
	homeTeam: string;
	awayTeam: string;
	isHomeTeam: boolean;
	field: string;
}>({
	gameDate: '',
	gameTime: '',
	homeTeam: '',
	awayTeam: '',
	isHomeTeam: true,
	field: ''
});

// Initial state tracking for reset functionality
const initialRoster = $state<string[]>([]);
const initialBattingOrder = $state<string[]>([]);
const initialGeneratedLineups = $state<Record<string, string[]>>({});
const initialPlayerCapabilities = $state<Record<string, string[]>>({});
const initialPlayerAttendance = $state<Record<string, boolean>>({});
const initialGameMetadata = $state<{
	gameDate: string;
	gameTime: string;
	homeTeam: string;
	awayTeam: string;
	isHomeTeam: boolean;
	field: string;
}>({
	gameDate: '',
	gameTime: '',
	homeTeam: '',
	awayTeam: '',
	isHomeTeam: true,
	field: ''
});
let hasInitialState = $state(false);

// Utility functions
export function getInfieldPositions(): string[] {
	return ['Pitcher', 'Catcher', '1st Base', '2nd Base', '3rd Base', 'Shortstop'];
}

export function isInfieldPosition(position: string): boolean {
	return getInfieldPositions().includes(position);
}

// Initial state management functions
export function saveInitialState(): void {
	initialRoster.splice(0, initialRoster.length, ...roster);
	initialBattingOrder.splice(0, initialBattingOrder.length, ...battingOrder);
	Object.assign(initialGeneratedLineups, generatedLineups);
	Object.assign(initialPlayerCapabilities, playerCapabilities);
	Object.assign(initialPlayerAttendance, playerAttendance);
	Object.assign(initialGameMetadata, gameMetadata);
	hasInitialState = true;
}

export function hasStateChanged(): boolean {
	if (!hasInitialState) return false;

	// Check roster changes
	if (
		roster.length !== initialRoster.length ||
		!roster.every((player, index) => player === initialRoster[index])
	) {
		return true;
	}

	// Check batting order changes
	if (
		battingOrder.length !== initialBattingOrder.length ||
		!battingOrder.every((player, index) => player === initialBattingOrder[index])
	) {
		return true;
	}

	// Check generated lineups changes
	const currentLineupKeys = Object.keys(generatedLineups).sort();
	const initialLineupKeys = Object.keys(initialGeneratedLineups).sort();
	if (
		currentLineupKeys.length !== initialLineupKeys.length ||
		!currentLineupKeys.every((key, index) => key === initialLineupKeys[index])
	) {
		return true;
	}

	for (const key of currentLineupKeys) {
		const current = generatedLineups[key];
		const initial = initialGeneratedLineups[key];
		if (
			current.length !== initial.length ||
			!current.every((player, index) => player === initial[index])
		) {
			return true;
		}
	}

	// Check player capabilities changes
	const currentCapabilityKeys = Object.keys(playerCapabilities).sort();
	const initialCapabilityKeys = Object.keys(initialPlayerCapabilities).sort();
	if (
		currentCapabilityKeys.length !== initialCapabilityKeys.length ||
		!currentCapabilityKeys.every((key, index) => key === initialCapabilityKeys[index])
	) {
		return true;
	}

	for (const key of currentCapabilityKeys) {
		const current = playerCapabilities[key];
		const initial = initialPlayerCapabilities[key];
		if (
			current.length !== initial.length ||
			!current.every((capability, index) => capability === initial[index])
		) {
			return true;
		}
	}

	// Check player attendance changes
	const currentAttendanceKeys = Object.keys(playerAttendance).sort();
	const initialAttendanceKeys = Object.keys(initialPlayerAttendance).sort();
	if (
		currentAttendanceKeys.length !== initialAttendanceKeys.length ||
		!currentAttendanceKeys.every((key, index) => key === initialAttendanceKeys[index])
	) {
		return true;
	}

	for (const key of currentAttendanceKeys) {
		if (playerAttendance[key] !== initialPlayerAttendance[key]) {
			return true;
		}
	}

	// Check game metadata changes
	if (
		gameMetadata.gameDate !== initialGameMetadata.gameDate ||
		gameMetadata.gameTime !== initialGameMetadata.gameTime ||
		gameMetadata.homeTeam !== initialGameMetadata.homeTeam ||
		gameMetadata.awayTeam !== initialGameMetadata.awayTeam ||
		gameMetadata.isHomeTeam !== initialGameMetadata.isHomeTeam ||
		gameMetadata.field !== initialGameMetadata.field
	) {
		return true;
	}

	return false;
}

export function resetToInitialState(): void {
	if (!hasInitialState) return;

	// Reset all state to initial values
	roster.splice(0, roster.length, ...initialRoster);
	battingOrder.splice(0, battingOrder.length, ...initialBattingOrder);

	// Clear and reset generated lineups
	Object.keys(generatedLineups).forEach((key) => delete generatedLineups[key]);
	Object.assign(generatedLineups, initialGeneratedLineups);

	// Clear and reset player capabilities
	Object.keys(playerCapabilities).forEach((key) => delete playerCapabilities[key]);
	Object.assign(playerCapabilities, initialPlayerCapabilities);

	// Clear and reset player attendance
	Object.keys(playerAttendance).forEach((key) => delete playerAttendance[key]);
	Object.assign(playerAttendance, initialPlayerAttendance);

	Object.assign(gameMetadata, initialGameMetadata);

	// Update URL with reset state
	updateUrlFromState();
}

// Game Metadata Management Functions
export function updateGameMetadata(metadata: {
	gameDate?: string;
	gameTime?: string;
	homeTeam?: string;
	awayTeam?: string;
	isHomeTeam?: boolean;
	field?: string;
}): void {
	if (metadata.gameDate !== undefined) {
		gameMetadata.gameDate = metadata.gameDate;
	}
	if (metadata.gameTime !== undefined) {
		gameMetadata.gameTime = metadata.gameTime;
	}
	if (metadata.homeTeam !== undefined) {
		gameMetadata.homeTeam = metadata.homeTeam;
	}
	if (metadata.awayTeam !== undefined) {
		gameMetadata.awayTeam = metadata.awayTeam;
	}
	if (metadata.isHomeTeam !== undefined) {
		gameMetadata.isHomeTeam = metadata.isHomeTeam;
	}
	if (metadata.field !== undefined) {
		gameMetadata.field = metadata.field;
	}

	// Update URL with new state
	updateUrlFromState();
}

// Roster Management Functions
export function addPlayer(playerName: string): boolean {
	if (playerName.trim() && !roster.includes(playerName.trim())) {
		roster.push(playerName.trim());
		// Initialize attendance as true (attending) by default
		playerAttendance[playerName.trim()] = true;
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
		// Also remove from batting order, capabilities, and attendance
		removeFromBattingOrder(player);
		delete playerCapabilities[player];
		delete playerAttendance[player];
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

			// Update attendance
			if (playerAttendance[oldName] !== undefined) {
				playerAttendance[newName.trim()] = playerAttendance[oldName];
				delete playerAttendance[oldName];
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

	// Initialize attendance state for all players if not already set
	roster.forEach((player) => {
		if (playerAttendance[player] === undefined) {
			playerAttendance[player] = true; // Default to attending
		}
	});

	// Update URL with new state
	updateUrlFromState();
	console.log('Batting order randomized:', $state.snapshot(battingOrder));
}

// Attendance Management Functions
export function togglePlayerAttendance(player: string): void {
	// Ensure attendance state is initialized (should already be done by randomizeBattingOrder)
	if (playerAttendance[player] === undefined) {
		playerAttendance[player] = true; // Default to attending
	}

	// Toggle the attendance state
	playerAttendance[player] = !playerAttendance[player];

	// Clear generated lineups when attendance changes to avoid conflicts
	clearGeneratedLineups();

	// Update URL with new state
	updateUrlFromState();
}

export function isPlayerAttending(player: string): boolean {
	return playerAttendance[player] !== false; // Default to attending if not set
}

export function getAttendingPlayers(): string[] {
	return roster.filter((player) => isPlayerAttending(player));
}

export function getNonAttendingPlayers(): string[] {
	return roster.filter((player) => !isPlayerAttending(player));
}

// Get sorted batting order for display (attending players first, then non-attending)
export function getSortedBattingOrderForDisplay(): string[] {
	const attending = battingOrder.filter((player) => isPlayerAttending(player));
	const nonAttending = battingOrder.filter((player) => !isPlayerAttending(player));
	return [...attending, ...nonAttending];
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
	return getAttendingPlayers().every(
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

/**
 * Checks if a player can be assigned to a position in a specific inning, considering consecutive assignment rules
 */
export function canPlayerPlayPositionInSpecificInning(
	player: string,
	position: string,
	inning: number,
	playerStats: Record<string, PlayerStats>,
	lineups: Record<string, string[]>
): boolean {
	// First check basic rules
	if (!canPlayerPlayPositionInInning(player, position, playerStats)) {
		return false;
	}

	// For pitcher and catcher, check consecutive assignment rule
	if (position === 'Pitcher' || position === 'Catcher') {
		const positionLineup = lineups[position] || [];
		const currentCount = playerStats[player].positionCounts[position];

		// If this would be the player's first time in this position, it's always allowed
		if (currentCount === 0) {
			return true;
		}

		// If this would be the player's second+ time in this position, check consecutive rule
		if (currentCount > 0) {
			// Find the last inning where this player played this position
			let lastInningPlayed = -1;
			for (let i = 0; i < positionLineup.length; i++) {
				if (positionLineup[i] === player) {
					lastInningPlayed = i;
				}
			}

			// If there's a gap between last inning and current inning, it's not consecutive
			if (lastInningPlayed !== -1 && inning !== lastInningPlayed + 1) {
				return false;
			}
		}
	}

	return true;
}

export function calculatePlayerStats(
	lineups: Record<string, string[]>
): Record<string, PlayerStats> {
	const stats: Record<string, PlayerStats> = {};

	// Initialize stats for attending players only
	getAttendingPlayers().forEach((player) => {
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
			if (player && isPlayerAttending(player)) {
				stats[player].positionCounts[position]++;
				playersOnField.push(player);
				if (isInfieldPosition(position)) {
					stats[player].infieldInnings++;
				}
			}
		});

		// Count bench innings for attending players only
		getAttendingPlayers().forEach((player) => {
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
	getAttendingPlayers().forEach((player) => {
		if (stats[player].infieldInnings < 2) {
			errors.push(
				`${player} only played ${stats[player].infieldInnings} infield innings (minimum 2 required)`
			);
		}
	});

	// Rule 3: Players must not exceed 1 inning more on the bench than their teammates
	const benchInnings = getAttendingPlayers().map((player) => stats[player].benchInnings);
	const maxBench = Math.max(...benchInnings);
	const minBench = Math.min(...benchInnings);
	if (maxBench - minBench > 1) {
		errors.push(
			`Bench time difference too large: max ${maxBench}, min ${minBench} (max difference allowed: 1)`
		);
	}

	// New Rule: Pitcher consecutive innings validation
	const pitcherErrors = validateConsecutivePositionAssignments(lineups, 'Pitcher');
	errors.push(...pitcherErrors);

	// New Rule: Catcher consecutive innings validation
	const catcherErrors = validateConsecutivePositionAssignments(lineups, 'Catcher');
	errors.push(...catcherErrors);

	return { isValid: errors.length === 0, errors };
}

/**
 * Validates that if a player plays a position more than once, they must play it in consecutive innings
 */
export function validateConsecutivePositionAssignments(
	lineups: Record<string, string[]>,
	position: string
): string[] {
	const errors: string[] = [];

	// Get all players who played this position
	const positionLineup = lineups[position] || [];
	const playersWhoPlayedPosition: string[] = [];

	positionLineup.forEach((player) => {
		if (player && player.trim() !== '' && !playersWhoPlayedPosition.includes(player)) {
			playersWhoPlayedPosition.push(player);
		}
	});

	// Check each player who played the position
	playersWhoPlayedPosition.forEach((player) => {
		const inningsPlayed: number[] = [];

		// Find all innings where this player played this position
		positionLineup.forEach((lineupPlayer, inning) => {
			if (lineupPlayer === player) {
				inningsPlayed.push(inning);
			}
		});

		// If player played position more than once, check if innings are consecutive
		if (inningsPlayed.length > 1) {
			const sortedInnings = inningsPlayed.sort((a, b) => a - b);
			let isConsecutive = true;

			for (let i = 1; i < sortedInnings.length; i++) {
				if (sortedInnings[i] !== sortedInnings[i - 1] + 1) {
					isConsecutive = false;
					break;
				}
			}

			if (!isConsecutive) {
				errors.push(
					`${player} played ${position} in non-consecutive innings: ${sortedInnings.map((i) => i + 1).join(', ')}`
				);
			}
		}
	});

	return errors;
}

// Defensive Lineup Generation
export function generateFairSittingAssignment(): SittingAssignment | null {
	const attendingPlayers = getAttendingPlayers();
	const sittingPerInning = Math.max(0, attendingPlayers.length - 9);
	const sittingAssignment: SittingAssignment = {};

	// Initialize sitting assignment for each inning
	for (let inning = 0; inning < INNING_COUNT; inning++) {
		sittingAssignment[inning] = [];
	}

	// Track how many times each player sits
	const sittingCounts: Record<string, number> = {};
	attendingPlayers.forEach((player) => {
		sittingCounts[player] = 0;
	});

	// Calculate target sitting time
	const totalSittingSlots = sittingPerInning * INNING_COUNT;
	const targetSittingPerPlayer =
		attendingPlayers.length > 0 ? Math.floor(totalSittingSlots / attendingPlayers.length) : 0;
	const maxSittingPerPlayer = targetSittingPerPlayer + 1; // Allow 1 extra sitting

	// Distribute sitting time fairly
	for (let inning = 0; inning < INNING_COUNT; inning++) {
		// Prioritize players who need to sit more to reach target
		const playersByPriority = [...attendingPlayers].sort((a, b) => {
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

	// Initialize player stats for attending players only
	getAttendingPlayers().forEach((player) => {
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
		const availablePlayers = getAttendingPlayers().filter(
			(player) => !sittingThisInning.includes(player)
		);

		// Assign each position
		for (const position of POSITIONS) {
			// Find players who can play this position and respect league rules
			const eligiblePlayers = availablePlayers.filter((player) =>
				canPlayerPlayPositionInSpecificInning(player, position, inning, playerStats, lineups)
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
		const sittingSlots = Math.max(0, getAttendingPlayers().length - 9);
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
	const playerStats: Record<string, PlayerStats> = {};

	// Initialize each position with empty array for 6 innings
	POSITIONS.forEach((position) => {
		lineups[position] = [];
	});

	// Initialize player stats for attending players only
	getAttendingPlayers().forEach((player) => {
		playerStats[player] = {
			positionCounts: {},
			infieldInnings: 0,
			benchInnings: 0
		};
		POSITIONS.forEach((position) => {
			playerStats[player].positionCounts[position] = 0;
		});
	});

	// Generate 6 lineups (updated to respect consecutive rules)
	for (let inning = 0; inning < INNING_COUNT; inning++) {
		const availablePlayers = [...getAttendingPlayers()];

		// Assign each position
		POSITIONS.forEach((position) => {
			const eligiblePlayers = availablePlayers.filter((player) =>
				canPlayerPlayPositionInSpecificInning(player, position, inning, playerStats, lineups)
			);

			if (eligiblePlayers.length > 0) {
				const randomIndex = Math.floor(Math.random() * eligiblePlayers.length);
				const selectedPlayer = eligiblePlayers[randomIndex];
				lineups[position].push(selectedPlayer);

				// Update stats
				playerStats[selectedPlayer].positionCounts[position]++;
				if (isInfieldPosition(position)) {
					playerStats[selectedPlayer].infieldInnings++;
				}

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

			// Update bench innings
			playerStats[sittingPlayer].benchInnings++;
		});

		// Fill any remaining sitting slots with empty strings
		const sittingSlots = Math.max(0, getAttendingPlayers().length - 9);
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

export function swapPlayersInInning(
	position: string,
	inning: number,
	player1: string,
	player2: string
): void {
	// Validate inputs
	if (!generatedLineups[position] || inning < 0 || inning >= INNING_COUNT) {
		console.warn('Invalid position or inning for swap');
		return;
	}

	// Get the current lineup for this position
	const lineup = generatedLineups[position];

	// Find the indices of the players in this inning
	const player1Index = lineup.findIndex((player, index) => player === player1 && index === inning);
	const player2Index = lineup.findIndex((player, index) => player === player2 && index === inning);

	// If both players are found in the same inning, swap them
	if (player1Index !== -1 && player2Index !== -1 && player1Index === player2Index) {
		// This means both players are in the same position/inning, which shouldn't happen
		console.warn('Both players found in same position/inning - invalid swap');
		return;
	}

	// Find players in the same inning across all positions
	let player1Position = '';
	let player2Position = '';

	for (const [pos, posLineup] of Object.entries(generatedLineups)) {
		if (posLineup[inning] === player1) {
			player1Position = pos;
		}
		if (posLineup[inning] === player2) {
			player2Position = pos;
		}
	}

	// Perform the swap if both players are found in the same inning
	if (player1Position && player2Position) {
		// Swap the players
		generatedLineups[player1Position][inning] = player2;
		generatedLineups[player2Position][inning] = player1;

		// Update URL with new state
		updateUrlFromState();
	} else {
		console.warn('One or both players not found in the specified inning');
	}
}

// Analytics and Statistics Functions
export interface PlayerFrequencyData {
	player: string;
	totalInnings: number;
	fieldInnings: number;
	infieldInnings: number;
	outfieldInnings: number;
	benchInnings: number;
	positionBreakdown: Record<string, number>;
}

export interface PositionFrequencyData {
	position: string;
	totalAssignments: number;
	playerBreakdown: Record<string, number>;
}

export interface AnalyticsData {
	playerFrequencies: PlayerFrequencyData[];
	positionFrequencies: PositionFrequencyData[];
	summary: {
		totalPlayers: number;
		totalInnings: number;
		averageFieldTime: number;
		averageBenchTime: number;
		fairnessScore: number; // 0-100, higher is more fair
	};
}

export function calculateAnalyticsData(lineups: Record<string, string[]>): AnalyticsData {
	const attendingPlayers = getAttendingPlayers();
	const nonAttendingPlayers = getNonAttendingPlayers();
	const allPlayers = [...attendingPlayers, ...nonAttendingPlayers];
	const playerFrequencies: PlayerFrequencyData[] = [];
	const positionFrequencies: PositionFrequencyData[] = [];

	// Initialize player frequency data for all players
	allPlayers.forEach((player) => {
		const isAttending = attendingPlayers.includes(player);
		playerFrequencies.push({
			player,
			totalInnings: isAttending ? 0 : 0, // Non-attending players have 0 innings
			fieldInnings: isAttending ? 0 : 0,
			infieldInnings: isAttending ? 0 : 0,
			outfieldInnings: isAttending ? 0 : 0,
			benchInnings: isAttending ? 0 : 0,
			positionBreakdown: {}
		});
	});

	// Initialize position frequency data
	POSITIONS.forEach((position) => {
		positionFrequencies.push({
			position,
			totalAssignments: 0,
			playerBreakdown: {}
		});
	});

	// Calculate frequencies for each inning
	for (let inning = 0; inning < INNING_COUNT; inning++) {
		const playersOnField: string[] = [];

		// Count field positions
		POSITIONS.forEach((position) => {
			const player = lineups[position]?.[inning];
			if (player && attendingPlayers.includes(player)) {
				// Update player frequency
				const playerData = playerFrequencies.find((p) => p.player === player);
				if (playerData) {
					playerData.totalInnings++;
					playerData.fieldInnings++;
					playerData.positionBreakdown[position] =
						(playerData.positionBreakdown[position] || 0) + 1;

					// Track infield vs outfield innings
					if (isInfieldPosition(position)) {
						playerData.infieldInnings++;
					} else {
						playerData.outfieldInnings++;
					}
				}

				// Update position frequency
				const positionData = positionFrequencies.find((p) => p.position === position);
				if (positionData) {
					positionData.totalAssignments++;
					positionData.playerBreakdown[player] = (positionData.playerBreakdown[player] || 0) + 1;
				}

				playersOnField.push(player);
			}
		});

		// Count bench innings
		attendingPlayers.forEach((player) => {
			if (!playersOnField.includes(player)) {
				const playerData = playerFrequencies.find((p) => p.player === player);
				if (playerData) {
					playerData.totalInnings++;
					playerData.benchInnings++;
				}
			}
		});
	}

	// Calculate summary statistics (only for attending players)
	const totalPlayers = attendingPlayers.length;
	const totalInnings = INNING_COUNT;
	const attendingPlayerFrequencies = playerFrequencies.filter((p) =>
		attendingPlayers.includes(p.player)
	);
	const fieldTimes = attendingPlayerFrequencies.map((p) => p.fieldInnings);
	const benchTimes = attendingPlayerFrequencies.map((p) => p.benchInnings);

	const averageFieldTime = fieldTimes.reduce((sum, time) => sum + time, 0) / totalPlayers;
	const averageBenchTime = benchTimes.reduce((sum, time) => sum + time, 0) / totalPlayers;

	// Calculate fairness score (0-100)
	// Lower variance in field/bench time = higher fairness score
	const fieldTimeVariance = calculateVariance(fieldTimes);
	const benchTimeVariance = calculateVariance(benchTimes);
	const maxPossibleVariance = Math.pow(totalInnings, 2) / 4; // Theoretical maximum variance
	const fieldFairness = Math.max(0, 100 - (fieldTimeVariance / maxPossibleVariance) * 100);
	const benchFairness = Math.max(0, 100 - (benchTimeVariance / maxPossibleVariance) * 100);
	const fairnessScore = (fieldFairness + benchFairness) / 2;

	return {
		playerFrequencies,
		positionFrequencies,
		summary: {
			totalPlayers,
			totalInnings,
			averageFieldTime,
			averageBenchTime,
			fairnessScore: Math.round(fairnessScore)
		}
	};
}

function calculateVariance(values: number[]): number {
	if (values.length === 0) return 0;
	const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
	const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
	return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
}

// URL-based state management
export async function exportStateToUrl(): Promise<string> {
	const state = {
		roster: [...roster],
		playerCapabilities: { ...playerCapabilities },
		generatedLineups: { ...generatedLineups },
		battingOrder: [...battingOrder],
		playerAttendance: { ...playerAttendance },
		gameMetadata: { ...gameMetadata }
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
		Object.assign(playerAttendance, validatedState.playerAttendance || {});
		Object.assign(gameMetadata, validatedState.gameMetadata || {});

		console.log('State loaded from URL - Batting order:', $state.snapshot(battingOrder));

		// Save this as the initial state for reset functionality
		saveInitialState();

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
		battingOrder: [...battingOrder],
		playerAttendance: { ...playerAttendance },
		gameMetadata: { ...gameMetadata }
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

	// Initialize attendance for any players that don't have it set
	roster.forEach((player) => {
		if (playerAttendance[player] === undefined) {
			playerAttendance[player] = true; // Default to attending
		}
	});

	// Initialize batting order if we have players but no batting order
	if (roster.length > 0 && battingOrder.length === 0) {
		randomizeBattingOrder();
	}

	// Save initial state for reset functionality (even if empty)
	saveInitialState();
}
