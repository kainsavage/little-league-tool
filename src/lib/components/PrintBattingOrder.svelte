<script lang="ts">
	interface Props {
		battingOrder: string[];
	}

	const { battingOrder }: Props = $props();
</script>

<!-- Print-Friendly Batting Order Box Score -->
<div class="batting-box-score hidden print:block">
	<h2>Batting Order & Box Score</h2>
	{#if battingOrder.length > 0}
		<table>
			<thead>
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
				{#each battingOrder as player, index (player)}
					<tr>
						<td class="player-name">{index + 1}. {player}</td>
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
					<td class="player-name">Runs</td>
					<td class="at-bat"></td>
					<td class="at-bat"></td>
					<td class="at-bat"></td>
					<td class="at-bat"></td>
					<td class="at-bat"></td>
					<td class="at-bat"></td>
				</tr>
			</tbody>
		</table>
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

		.batting-box-score h2 {
			font-size: 16pt;
			font-weight: bold;
			margin-bottom: 10pt;
			text-align: center;
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
			font-weight: bold;
			width: 20%;
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
