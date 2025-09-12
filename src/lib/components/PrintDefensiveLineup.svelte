<script lang="ts">
	import { getNonAttendingPlayers } from '$lib/baseball-lineup-logic.svelte';

	interface Props {
		generatedLineups: Record<string, string[]>;
	}

	const { generatedLineups }: Props = $props();

	// Get non-attending players for display
	const nonAttendingPlayers = $derived(getNonAttendingPlayers());

	// Define the order for defensive positions (Pitcher first, Catcher second)
	const defensivePositionOrder = $derived([
		'Pitcher',
		'Catcher',
		'1st Base',
		'2nd Base',
		'3rd Base',
		'Shortstop',
		'Left Field',
		'Center Field',
		'Right Field'
	]);

	// Get sitting positions in order
	const sittingPositions = $derived(
		Object.keys(generatedLineups)
			.filter((key) => key.startsWith('Sitting'))
			.sort((a, b) => {
				const aNum = parseInt(a.replace('Sitting ', ''));
				const bNum = parseInt(b.replace('Sitting ', ''));
				return aNum - bNum;
			})
	);
</script>

<!-- Print-Friendly Defensive Lineup -->
<div class="defensive-lineup-print hidden print:block">
	{#if Object.keys(generatedLineups).length > 0}
		<div class="overflow-x-auto">
			<table class="w-full border-collapse">
				<thead>
					<tr class="border-b border-black">
						<th class="p-2 text-left">Position</th>
						{#each Array(6) as _, inning (inning)}
							<th class="p-2 text-center {_}">Inning {inning + 1}</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					<!-- Defensive positions in order -->
					{#each defensivePositionOrder as position (position)}
						{#if generatedLineups[position]}
							<tr class="border-b border-gray-300">
								<td class="p-2 font-bold">{position}</td>
								{#each generatedLineups[position] || [] as player, inning (inning)}
									<td class="p-2">
										{#if player}
											{player}
										{:else}
											-
										{/if}
									</td>
								{/each}
							</tr>
						{/if}
					{/each}
					<!-- Sitting positions in order -->
					{#each sittingPositions as sittingKey (sittingKey)}
						<tr class="sitting-row border-b border-gray-300">
							<td class="p-2 font-bold">{sittingKey}</td>
							{#each generatedLineups[sittingKey] || [] as player, inning (inning)}
								<td class="p-2">
									{#if player}
										{player}
									{:else}
										-
									{/if}
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Non-Attending Players Section for Print -->
		{#if nonAttendingPlayers.length > 0}
			<div class="non-attending-section">
				<h3>Absent: <span class="absent-players">{nonAttendingPlayers.join(', ')}</span></h3>
			</div>
		{/if}
	{:else}
		<p>No defensive lineups generated for print.</p>
	{/if}
</div>

<style>
	/* Print Styles for Defensive Lineup */
	@media print {
		.defensive-lineup-print {
			page-break-inside: avoid;
			margin-bottom: 1em;
		}

		.defensive-lineup-print table {
			width: 100%;
			border-collapse: collapse;
			margin-bottom: 1em;
		}

		.defensive-lineup-print th,
		.defensive-lineup-print td {
			border: 1pt solid black;
			padding: 3pt;
			text-align: center;
		}

		.defensive-lineup-print .sitting-row {
			background: #f8f8f8 !important;
			font-style: italic;
		}

		.defensive-lineup-print .non-attending-section {
			margin-top: 10pt;
			padding-top: 8pt;
		}

		.defensive-lineup-print .non-attending-section h3 {
			font-size: 12pt;
			font-weight: bold;
			margin: 0;
			color: #333;
		}

		.defensive-lineup-print .absent-players {
			font-weight: normal;
			color: #666;
		}
	}
</style>
