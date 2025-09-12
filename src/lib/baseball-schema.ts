/**
 * Baseball Lineup Data Schema
 *
 * Zod schemas for validating baseball lineup data structure.
 * This ensures data integrity when encoding/decoding state.
 */

import { z } from 'zod';

// Schema for individual player capabilities
export const PlayerCapabilitiesSchema = z.record(z.string(), z.array(z.string()));

// Schema for generated lineups (position -> array of players for each inning)
export const GeneratedLineupsSchema = z.record(z.string(), z.array(z.string()));

// Schema for game metadata
export const GameMetadataSchema = z.object({
	gameDate: z.string().optional(),
	gameTime: z.string().optional(),
	homeTeam: z.string().optional(),
	awayTeam: z.string().optional(),
	isHomeTeam: z.boolean().optional(),
	field: z.string().optional()
});

// Schema for the complete baseball lineup state
export const BaseballLineupStateSchema = z.object({
	roster: z.array(z.string()).min(1, 'Roster must have at least one player'),
	playerCapabilities: PlayerCapabilitiesSchema,
	generatedLineups: GeneratedLineupsSchema,
	battingOrder: z.array(z.string()).optional(),
	playerAttendance: z.record(z.string(), z.boolean()).optional(),
	gameMetadata: GameMetadataSchema.optional()
});

// Type inference from schema
export type BaseballLineupState = z.infer<typeof BaseballLineupStateSchema>;
export type PlayerCapabilities = z.infer<typeof PlayerCapabilitiesSchema>;
export type GeneratedLineups = z.infer<typeof GeneratedLineupsSchema>;
export type GameMetadata = z.infer<typeof GameMetadataSchema>;
export type PlayerAttendance = z.infer<typeof BaseballLineupStateSchema>['playerAttendance'];

// Validation helper function
export function validateBaseballState(data: unknown): BaseballLineupState {
	return BaseballLineupStateSchema.parse(data);
}

// Empty but valid state for use as a base object
export const emptyBaseballState: BaseballLineupState = {
	roster: [],
	playerCapabilities: {},
	generatedLineups: {},
	battingOrder: [],
	playerAttendance: {},
	gameMetadata: {
		gameDate: '',
		gameTime: '',
		homeTeam: '',
		awayTeam: '',
		isHomeTeam: true,
		field: ''
	}
};

// Example of a minimal valid state
export const exampleBaseballState: BaseballLineupState = {
	roster: [
		'John',
		'Jane',
		'Bob',
		'Alice',
		'Charlie',
		'Diana',
		'Eve',
		'Frank',
		'Grace',
		'Henry',
		'Ivy',
		'Jack'
	],
	playerCapabilities: {
		John: ['Pitcher', '1st Base'],
		Jane: ['Catcher', '3rd Base'],
		Bob: ['Shortstop', '2nd Base'],
		Alice: ['Left Field', 'Center Field'],
		Charlie: ['Right Field', '1st Base'],
		Diana: ['Pitcher', 'Right Field'],
		Eve: ['Catcher', 'Left Field'],
		Frank: ['3rd Base', 'Shortstop'],
		Grace: ['2nd Base', 'Center Field'],
		Henry: ['1st Base', 'Left Field'],
		Ivy: ['Center Field', 'Right Field'],
		Jack: ['Pitcher', 'Catcher']
	},
	generatedLineups: {
		Pitcher: ['John', 'Diana', 'Jack', 'John', 'Diana', 'Jack'],
		Catcher: ['Jane', 'Eve', 'Jack', 'Jane', 'Eve', 'Jack'],
		'1st Base': ['John', 'Charlie', 'Henry', 'John', 'Charlie', 'Henry'],
		'2nd Base': ['Bob', 'Grace', 'Bob', 'Grace', 'Bob', 'Grace'],
		'3rd Base': ['Jane', 'Frank', 'Jane', 'Frank', 'Jane', 'Frank'],
		Shortstop: ['Bob', 'Frank', 'Bob', 'Frank', 'Bob', 'Frank'],
		'Left Field': ['Alice', 'Eve', 'Alice', 'Eve', 'Alice', 'Eve'],
		'Center Field': ['Alice', 'Grace', 'Ivy', 'Alice', 'Grace', 'Ivy'],
		'Right Field': ['Charlie', 'Diana', 'Ivy', 'Charlie', 'Diana', 'Ivy'],
		'Sitting 1': ['Henry', 'Henry', 'Henry', 'Henry', 'Henry', 'Henry'],
		'Sitting 2': ['Jack', 'Jack', 'Jack', 'Jack', 'Jack', 'Jack'],
		'Sitting 3': ['', '', '', '', '', '']
	},
	battingOrder: [
		'John',
		'Jane',
		'Bob',
		'Alice',
		'Charlie',
		'Diana',
		'Eve',
		'Frank',
		'Grace',
		'Henry',
		'Ivy',
		'Jack'
	],
	playerAttendance: {
		John: true,
		Jane: true,
		Bob: true,
		Alice: true,
		Charlie: true,
		Diana: true,
		Eve: true,
		Frank: true,
		Grace: true,
		Henry: true,
		Ivy: true,
		Jack: true
	},
	gameMetadata: {
		gameDate: '',
		gameTime: '',
		homeTeam: '',
		awayTeam: '',
		isHomeTeam: true,
		field: ''
	}
};
