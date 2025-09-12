<script lang="ts">
	import { calculateAnalyticsData, getAttendingPlayers } from '$lib/baseball-lineup-logic.svelte';

	interface Props {
		generatedLineups: Record<string, string[]>;
	}

	const { generatedLineups }: Props = $props();

	// Calculate analytics data
	const analyticsData = $derived.by(() => {
		if (Object.keys(generatedLineups).length === 0) {
			return null;
		}
		return calculateAnalyticsData(generatedLineups);
	});
</script>

<!-- Print-Friendly Analytics -->
<div class="analytics-print hidden print:block">
	{#if analyticsData}
		<div class="analytics-header">
			<h2>Player Statistics & Fairness Report</h2>
			<div class="summary-stats">
				<div class="stat-item">
					<span class="stat-label">Fairness Score:</span>
					<span class="stat-value">{analyticsData.summary.fairnessScore}%</span>
				</div>
				<div class="stat-item">
					<span class="stat-label">Total Players:</span>
					<span class="stat-value">{analyticsData.summary.totalPlayers}</span>
				</div>
				<div class="stat-item">
					<span class="stat-label">Avg Field Time:</span>
					<span class="stat-value">{analyticsData.summary.averageFieldTime.toFixed(1)} innings</span
					>
				</div>
				<div class="stat-item">
					<span class="stat-label">Avg Bench Time:</span>
					<span class="stat-value">{analyticsData.summary.averageBenchTime.toFixed(1)} innings</span
					>
				</div>
			</div>
		</div>

		<div class="player-breakdown-table">
			<table class="w-full border-collapse">
				<thead>
					<tr class="border-b border-black">
						<th class="p-2 text-left">Player</th>
						<th class="p-2 text-center">Status</th>
						<th class="p-2 text-center">Field (In/Out)</th>
						<th class="p-2 text-center">Bench</th>
						<th class="p-2 text-center">Total</th>
						<th class="p-2 text-left">Positions Played</th>
					</tr>
				</thead>
				<tbody>
					{#each (analyticsData.playerFrequencies || []).sort( (a, b) => a.player.localeCompare(b.player) ) as playerData (playerData.player)}
						{@const isAttending = getAttendingPlayers().includes(playerData.player)}
						<tr class="border-b border-gray-300">
							<td class="p-2 font-bold">{playerData.player}</td>
							<td class="p-2 text-center">
								{#if isAttending}
									<span class="status-present">Present</span>
								{:else}
									<span class="status-absent">Absent</span>
								{/if}
							</td>
							<td class="p-2 text-center">
								{#if isAttending}
									{playerData.fieldInnings} ({playerData.infieldInnings}/{playerData.outfieldInnings})
								{:else}
									-
								{/if}
							</td>
							<td class="p-2 text-center">
								{#if isAttending}
									{playerData.benchInnings}
								{:else}
									-
								{/if}
							</td>
							<td class="p-2 text-center">
								{#if isAttending}
									{playerData.totalInnings}
								{:else}
									-
								{/if}
							</td>
							<td class="p-2">
								{#if isAttending}
									{Object.entries(playerData.positionBreakdown)
										.filter(([, count]) => count > 0)
										.map(([position, count]) => `${position} (${count})`)
										.join(', ') || 'None'}
								{:else}
									-
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<p>No analytics data available for print.</p>
	{/if}
</div>

<style>
	/* Print Styles for Analytics */
	@media print {
		.analytics-print {
			page-break-inside: avoid;
			margin-bottom: 1em;
		}

		.analytics-print .analytics-header {
			margin-bottom: 1em;
		}

		.analytics-print .analytics-header h2 {
			font-size: 16pt;
			font-weight: bold;
			margin: 0 0 8pt 0;
			color: #000;
		}

		.analytics-print .summary-stats {
			display: flex;
			flex-wrap: wrap;
			gap: 12pt;
			margin-bottom: 8pt;
		}

		.analytics-print .stat-item {
			display: flex;
			flex-direction: column;
			align-items: center;
			padding: 4pt;
			border: 1pt solid #ccc;
			border-radius: 4pt;
			min-width: 60pt;
		}

		.analytics-print .stat-label {
			font-size: 8pt;
			color: #666;
			text-align: center;
		}

		.analytics-print .stat-value {
			font-size: 12pt;
			font-weight: bold;
			color: #000;
			text-align: center;
		}

		.analytics-print .player-breakdown-table {
			margin-bottom: 1em;
		}

		.analytics-print table {
			width: 100%;
			border-collapse: collapse;
		}

		.analytics-print th,
		.analytics-print td {
			border: 1pt solid black;
			padding: 3pt;
			text-align: left;
		}

		.analytics-print th {
			font-weight: bold;
			text-align: center;
		}

		.analytics-print .status-present {
			padding: 1pt 4pt;
			border-radius: 2pt;
			font-size: 8pt;
			font-weight: bold;
		}

		.analytics-print .status-absent {
			padding: 1pt 4pt;
			border-radius: 2pt;
			font-size: 8pt;
			font-weight: bold;
		}
	}
</style>
