<script lang="ts">
	import {
		isPlayerAttending,
		getNonAttendingPlayers,
		gameMetadata
	} from '$lib/baseball-lineup-logic.svelte';

	interface Props {
		battingOrder: string[];
	}

	const { battingOrder }: Props = $props();

	// Get attending players from batting order and non-attending players
	const attendingPlayers = $derived(battingOrder.filter((player) => isPlayerAttending(player)));
	const nonAttendingPlayers = $derived(getNonAttendingPlayers());

	// Helper function to format date and time for display
	function formatDateTimeForDisplay(date: string, time: string): string {
		let result = '';

		if (date) {
			try {
				// Handle YYYY-MM-DD format from HTML5 date input
				// Create date in local timezone to avoid timezone issues
				const [year, month, day] = date.split('-').map(Number);
				const dateObj = new Date(year, month - 1, day); // month is 0-indexed
				result = dateObj.toLocaleDateString('en-US', {
					weekday: 'long',
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				});
			} catch {
				result = date;
			}
		}

		if (time) {
			if (result) {
				result += ' at ';
			}
			// Format time to be more readable (e.g., "2:30 PM")
			try {
				const [hours, minutes] = time.split(':');
				const hour = parseInt(hours, 10);
				const ampm = hour >= 12 ? 'PM' : 'AM';
				const displayHour = hour % 12 || 12;
				result += `${displayHour}:${minutes} ${ampm}`;
			} catch {
				result += time;
			}
		}

		return result;
	}
</script>

<!-- Print-Friendly Batting Order Box Score -->
<div class="batting-box-score hidden print:block">
	{#if battingOrder.length > 0}
		<table>
			<thead>
				<!-- Game metadata row -->
				<tr>
					<th class="game-info-center" colspan="7">
						<!-- Team names -->
						{#if gameMetadata.isHomeTeam}
							<strong>{gameMetadata.homeTeam || 'Our Team'}</strong> vs. {gameMetadata.awayTeam ||
								'Away Team'}
						{:else}
							<strong>{gameMetadata.awayTeam || 'Our Team'}</strong> @ {gameMetadata.homeTeam ||
								'Home Team'}
						{/if}
						<br />
						<!-- Date, time, and field -->
						{formatDateTimeForDisplay(gameMetadata.gameDate, gameMetadata.gameTime)}
						{#if gameMetadata.field}
							<br />{gameMetadata.field}
						{/if}
					</th>
				</tr>
				<!-- Column headers row -->
				<tr>
					<th class="player-name">Player</th>
					<th class="at-bat">1st</th>
					<th class="at-bat">2nd</th>
					<th class="at-bat">3rd</th>
					<th class="at-bat">4th</th>
					<th class="at-bat">5th</th>
					<th class="at-bat">6th</th>
				</tr>
			</thead>
			<tbody>
				{#each attendingPlayers as player (player)}
					<tr>
						<td class="player-name">{player}</td>
						<td class="at-bat">
							<div class="baseball-diamond"></div>
							<div class="count-checkboxes">
								<div class="count-row">
									<input type="checkbox" class="count-checkbox" />
									<input type="checkbox" class="count-checkbox" />
								</div>
								<div class="count-row">
									<input type="checkbox" class="count-checkbox" />
									<input type="checkbox" class="count-checkbox" />
									<input type="checkbox" class="count-checkbox" />
								</div>
							</div>
						</td>
						<td class="at-bat">
							<div class="baseball-diamond"></div>
							<div class="count-checkboxes">
								<div class="count-row">
									<input type="checkbox" class="count-checkbox" />
									<input type="checkbox" class="count-checkbox" />
								</div>
								<div class="count-row">
									<input type="checkbox" class="count-checkbox" />
									<input type="checkbox" class="count-checkbox" />
									<input type="checkbox" class="count-checkbox" />
								</div>
							</div>
						</td>
						<td class="at-bat">
							<div class="baseball-diamond"></div>
							<div class="count-checkboxes">
								<div class="count-row">
									<input type="checkbox" class="count-checkbox" />
									<input type="checkbox" class="count-checkbox" />
								</div>
								<div class="count-row">
									<input type="checkbox" class="count-checkbox" />
									<input type="checkbox" class="count-checkbox" />
									<input type="checkbox" class="count-checkbox" />
								</div>
							</div>
						</td>
						<td class="at-bat">
							<div class="baseball-diamond"></div>
							<div class="count-checkboxes">
								<div class="count-row">
									<input type="checkbox" class="count-checkbox" />
									<input type="checkbox" class="count-checkbox" />
								</div>
								<div class="count-row">
									<input type="checkbox" class="count-checkbox" />
									<input type="checkbox" class="count-checkbox" />
									<input type="checkbox" class="count-checkbox" />
								</div>
							</div>
						</td>
						<td class="at-bat">
							<div class="baseball-diamond"></div>
							<div class="count-checkboxes">
								<div class="count-row">
									<input type="checkbox" class="count-checkbox" />
									<input type="checkbox" class="count-checkbox" />
								</div>
								<div class="count-row">
									<input type="checkbox" class="count-checkbox" />
									<input type="checkbox" class="count-checkbox" />
									<input type="checkbox" class="count-checkbox" />
								</div>
							</div>
						</td>
						<td class="at-bat">
							<div class="baseball-diamond"></div>
							<div class="count-checkboxes">
								<div class="count-row">
									<input type="checkbox" class="count-checkbox" />
									<input type="checkbox" class="count-checkbox" />
								</div>
								<div class="count-row">
									<input type="checkbox" class="count-checkbox" />
									<input type="checkbox" class="count-checkbox" />
									<input type="checkbox" class="count-checkbox" />
								</div>
							</div>
						</td>
					</tr>
				{/each}
				<!-- Runs Row -->
				<tr>
					<th class="player-name">Runs</th>
					<td class="at-bat"></td>
					<td class="at-bat"></td>
					<td class="at-bat"></td>
					<td class="at-bat"></td>
					<td class="at-bat"></td>
					<td class="at-bat"></td>
				</tr>
			</tbody>
		</table>

		<!-- Non-Attending Players Section for Print -->
		{#if nonAttendingPlayers.length > 0}
			<div class="non-attending-section">
				<h3>Absent: <span class="absent-players">{nonAttendingPlayers.join(', ')}</span></h3>
			</div>
		{/if}
	{:else}
		<p class="text-[var(--color-text-muted)] italic">No players in batting order yet</p>
	{/if}
</div>

<style>
	/* Print Styles for Batting Order Box Score */
	@media print {
		/* Batting Order Box Score */
		.batting-box-score {
			page-break-inside: avoid;
			margin-bottom: 20pt;
		}

		.batting-box-score table {
			width: 100%;
			border-collapse: collapse;
			font-size: 10pt;
		}

		.batting-box-score th {
			border: 1pt solid black;
			padding: 4pt;
			text-align: center;
			font-weight: bold;
			background: #f0f0f0 !important;
		}

		.batting-box-score td {
			border: 1pt solid black;
			padding: 4pt;
			text-align: center;
		}

		.batting-box-score .player-name {
			text-align: left;
			width: 20%;
		}

		.batting-box-score .game-info-center {
			text-align: center;
			width: 100%;
			font-size: 12pt;
			font-weight: bold;
		}

		.batting-box-score .non-attending-section {
			margin-top: 10pt;
			padding-top: 8pt;
		}

		.batting-box-score .non-attending-section h3 {
			font-size: 12pt;
			font-weight: bold;
			margin: 0;
			color: #333;
		}

		.batting-box-score .absent-players {
			font-weight: normal;
			color: #666;
		}

		.batting-box-score .at-bat {
			width: 13.33%;
			position: relative;
		}

		/* Count checkboxes for balls/strikes */
		.count-checkboxes {
			position: absolute;
			bottom: 1pt;
			right: 1pt;
			display: flex;
			flex-direction: column;
			gap: 2pt;
			align-items: flex-end;
		}

		.count-row {
			display: flex;
			gap: 2pt;
			justify-content: flex-end;
		}

		.count-checkbox {
			width: 8pt;
			height: 8pt;
			min-width: 8pt;
			min-height: 8pt;
			max-width: 8pt;
			max-height: 8pt;
			margin: 0;
			padding: 0;
			border: 1pt solid black;
			background: white;
			accent-color: black;
			appearance: none;
			-webkit-appearance: none;
			-moz-appearance: none;
			box-sizing: border-box;
		}

		.count-checkbox:checked {
			background: black;
		}

		/* Baseball diamond for each at-bat */
		.baseball-diamond {
			width: 20pt;
			height: 20pt;
			margin: 0 auto;
			position: relative;
		}

		.baseball-diamond::before {
			content: '';
			position: absolute;
			top: 50%;
			left: 50%;
			width: 16pt;
			height: 16pt;
			transform: translate(-50%, -50%) rotate(45deg);
			border: 1pt dotted #666;
			background: transparent;
		}
	}
</style>
