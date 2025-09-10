/**
 * State Serialization Module
 *
 * Provides robust client-side encoding/decoding of application state for URL sharing.
 * Features:
 * - CBOR serialization for compact binary format
 * - DEFLATE compression with native streams and pako fallback
 * - Base64URL encoding for URL-safe transmission
 * - CRC32 checksum for integrity validation
 * - Schema validation with Zod
 * - Version tagging for future compatibility
 */

import { encode as cborEncode, decode as cborDecode } from 'cbor-x';
import { deflate, inflate } from 'pako';
import { z } from 'zod';

// Version constant for future compatibility
const SERIALIZATION_VERSION = 1;

// Minimum payload size before compression is applied
const COMPRESSION_THRESHOLD = 200;

// Feature detection for native compression streams
const hasNativeCompression = (() => {
	try {
		return typeof CompressionStream !== 'undefined' && typeof DecompressionStream !== 'undefined';
	} catch {
		return false;
	}
})();

/**
 * Calculate CRC32 checksum for data integrity
 * Simple implementation for client-side use
 */
function crc32(data: Uint8Array): number {
	const table = new Uint32Array(256);

	// Generate CRC32 table
	for (let i = 0; i < 256; i++) {
		let c = i;
		for (let j = 0; j < 8; j++) {
			c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
		}
		table[i] = c;
	}

	let crc = 0xffffffff;
	for (let i = 0; i < data.length; i++) {
		crc = table[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
	}
	return (crc ^ 0xffffffff) >>> 0;
}

/**
 * Encode bytes to base64url (URL-safe base64 without padding)
 */
function base64UrlEncode(data: Uint8Array): string {
	const base64 = btoa(String.fromCharCode(...data));
	return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Decode base64url to bytes
 */
function base64UrlDecode(str: string): Uint8Array {
	// Add padding back
	const padded = str + '='.repeat((4 - (str.length % 4)) % 4);
	const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');

	const binaryString = atob(base64);
	const bytes = new Uint8Array(binaryString.length);
	for (let i = 0; i < binaryString.length; i++) {
		bytes[i] = binaryString.charCodeAt(i);
	}
	return bytes;
}

/**
 * Compress data using native CompressionStream or pako fallback
 */
async function compressData(data: Uint8Array): Promise<Uint8Array> {
	if (data.length < COMPRESSION_THRESHOLD) {
		return data; // Skip compression for small payloads
	}

	// Temporarily disable native compression due to hanging issues
	// Use pako for all compression until we can fix the native streams
	return deflate(data);
}

/**
 * Decompress data using native DecompressionStream or pako fallback
 */
async function decompressData(data: Uint8Array): Promise<Uint8Array> {
	// Check if data looks like it's compressed by examining the header
	// Zlib/deflate data typically starts with specific byte patterns
	const isLikelyCompressed =
		data.length >= 2 &&
		((data[0] === 0x78 && (data[1] === 0x9c || data[1] === 0x01 || data[1] === 0xda)) || // zlib header
			(data[0] === 0x1f && data[1] === 0x8b)); // gzip header

	if (!isLikelyCompressed) {
		console.log('Data does not appear to be compressed, returning as-is');
		return data;
	}

	// Temporarily disable native compression due to hanging issues
	// Use pako for all decompression until we can fix the native streams
	console.log('Data appears to be compressed, using pako for decompression');
	return inflate(data);
}

/**
 * Create a deterministic object with stable key ordering
 */
function createDeterministicObject(obj: unknown): unknown {
	if (obj === null || typeof obj !== 'object') {
		return obj;
	}

	if (Array.isArray(obj)) {
		return obj.map(createDeterministicObject);
	}

	// Sort keys for deterministic ordering
	const sortedKeys = Object.keys(obj as Record<string, unknown>).sort();
	const result: Record<string, unknown> = {};

	for (const key of sortedKeys) {
		result[key] = createDeterministicObject((obj as Record<string, unknown>)[key]);
	}

	return result;
}

/**
 * Encode application state into a URL-safe string
 *
 * @param obj - The object to encode
 * @returns Promise resolving to URL fragment like "#v1=<base64url-token>~h=<checksum>"
 */
export async function encodeState<T>(obj: T): Promise<string> {
	try {
		// Create deterministic version with stable key ordering
		const deterministicObj = createDeterministicObject(obj);

		// Add version tag
		const versionedObj = {
			v: SERIALIZATION_VERSION,
			data: deterministicObj
		};

		// Serialize with CBOR
		const serialized = cborEncode(versionedObj);

		// Compress the data
		const compressed = await compressData(serialized);
		console.log(
			'Compression result - original length:',
			serialized.length,
			'compressed length:',
			compressed.length
		);

		// Encode to base64url
		const encoded = base64UrlEncode(compressed);

		// Calculate checksum
		const checksum = crc32(compressed);
		const checksumHex = checksum.toString(16);

		// Return URL fragment
		return `#v${SERIALIZATION_VERSION}=${encoded}~h=${checksumHex}`;
	} catch (error) {
		throw new Error(
			`Failed to encode state: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

/**
 * Decode URL fragment back to application state
 *
 * @param hash - The URL hash fragment to decode
 * @returns Promise resolving to the decoded object
 */
export async function decodeState<T>(hash: string): Promise<T> {
	try {
		// Remove leading # if present
		const cleanHash = hash.startsWith('#') ? hash.slice(1) : hash;

		// Parse version and data
		const versionMatch = cleanHash.match(/^v(\d+)=(.+)~h=(.+)$/);
		if (!versionMatch) {
			throw new Error('Invalid hash format. Expected format: #v1=<data>~h=<checksum>');
		}

		const [, versionStr, encodedData, checksumHex] = versionMatch;
		const version = parseInt(versionStr, 10);

		// Check version compatibility
		if (version !== SERIALIZATION_VERSION) {
			throw new Error(
				`Unsupported version: ${version}. This decoder supports version ${SERIALIZATION_VERSION}`
			);
		}

		// Decode base64url
		let compressed: Uint8Array;
		try {
			compressed = base64UrlDecode(encodedData);
			console.log('Base64URL decoded successfully, length:', compressed.length);
		} catch (error) {
			throw new Error(
				`Failed to decode base64url data: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}

		// Verify checksum
		const expectedChecksum = parseInt(checksumHex, 16);
		const actualChecksum = crc32(compressed);
		if (expectedChecksum !== actualChecksum) {
			throw new Error(
				`Checksum verification failed. Expected: ${expectedChecksum.toString(16)}, Got: ${actualChecksum.toString(16)}. Data may be corrupted or truncated.`
			);
		}

		// Decompress
		let serialized: Uint8Array;
		try {
			console.log('Attempting decompression, compressed length:', compressed.length);
			serialized = await decompressData(compressed);
			console.log('Decompression successful, decompressed length:', serialized.length);
		} catch (error) {
			// If decompression fails, try treating the data as uncompressed
			console.log('Decompression failed, trying as uncompressed data:', error);
			serialized = compressed;
		}

		// Deserialize with CBOR
		console.log('Attempting CBOR decode, serialized length:', serialized.length);
		console.log(
			'Serialized data (first 50 bytes):',
			Array.from(serialized.slice(0, 50))
				.map((b) => b.toString(16).padStart(2, '0'))
				.join(' ')
		);
		const decoded = cborDecode(serialized) as { v: number; data: T };

		// Validate structure
		if (typeof decoded !== 'object' || decoded === null) {
			throw new Error('Decoded data is not an object');
		}

		if (decoded.v !== SERIALIZATION_VERSION) {
			throw new Error(`Version mismatch: expected ${SERIALIZATION_VERSION}, got ${decoded.v}`);
		}

		return decoded.data;
	} catch (error) {
		throw new Error(
			`Failed to decode state: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

/**
 * Estimate the size of encoded state without actually encoding
 *
 * @param obj - The object to estimate size for
 * @returns Promise resolving to estimated size in bytes
 */
export async function estimateSize<T>(obj: T): Promise<number> {
	try {
		// Create deterministic version
		const deterministicObj = createDeterministicObject(obj);

		// Add version tag
		const versionedObj = {
			v: SERIALIZATION_VERSION,
			data: deterministicObj
		};

		// Serialize with CBOR
		const serialized = cborEncode(versionedObj);

		// Estimate compression ratio (rough approximation)
		const compressionRatio = serialized.length < COMPRESSION_THRESHOLD ? 1 : 0.3;
		const estimatedCompressedSize = Math.ceil(serialized.length * compressionRatio);

		// Base64url encoding increases size by ~33%
		const estimatedEncodedSize = Math.ceil((estimatedCompressedSize * 4) / 3);

		// Add overhead for version tag and checksum
		const overhead = 20; // Approximate overhead for "#v1=" and "~h=<checksum>"

		return estimatedEncodedSize + overhead;
	} catch (error) {
		throw new Error(
			`Failed to estimate size: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

/**
 * Validate decoded data against a Zod schema
 *
 * @param data - The decoded data to validate
 * @param schema - Zod schema to validate against
 * @returns The validated data
 */
export function validateWithSchema<T>(data: unknown, schema: z.ZodSchema<T>): T {
	try {
		return schema.parse(data);
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errorMessages = error.issues.map((err) => `${err.path.join('.')}: ${err.message}`);
			throw new Error(`Schema validation failed: ${errorMessages.join(', ')}`);
		}
		throw new Error(
			`Schema validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

/**
 * Utility to check if a URL is too long for sharing
 * Different platforms have different limits:
 * - Twitter: ~280 characters
 * - SMS: ~160 characters
 * - Email: ~2000 characters
 * - General web: ~2000 characters
 */
export function isUrlTooLong(url: string, maxLength: number = 2000): boolean {
	return url.length > maxLength;
}

/**
 * Get compression info for debugging
 */
export function getCompressionInfo(): {
	hasNativeCompression: boolean;
	compressionThreshold: number;
	version: number;
} {
	return {
		hasNativeCompression,
		compressionThreshold: COMPRESSION_THRESHOLD,
		version: SERIALIZATION_VERSION
	};
}
