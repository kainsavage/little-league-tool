<script lang="ts">
	interface Props {
		generatedLineups: Record<string, string[]>;
	}

	const { generatedLineups }: Props = $props();
</script>

<!-- Print-Friendly Defensive Lineup -->
<div class="defensive-lineup-print hidden print:block">
	<h2>Defensive Lineups</h2>
	{#if Object.keys(generatedLineups).length > 0}
		<div class="overflow-x-auto">
			<table class="w-full border-collapse">
				<thead>
					<tr class="border-b border-black">
						<th class="p-2 text-left">Position</th>
						{#each Array(6) as _, inning (inning)}
							<th class="p-2 text-center">Inning {inning + 1}</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each Object.keys(generatedLineups) as key (key)}
						<tr class="border-b border-gray-300 {key.startsWith('Sitting') ? 'sitting-row' : ''}">
							<td class="p-2 font-bold">{key}</td>
							{#each generatedLineups[key] || [] as player, inning (inning)}
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
	}
</style>
