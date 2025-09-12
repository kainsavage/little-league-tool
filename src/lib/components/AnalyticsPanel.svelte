<script lang="ts">
	import { calculateAnalyticsData, getAttendingPlayers } from '$lib/baseball-lineup-logic.svelte';

	// Props
	let {
		generatedLineups = {}
	}: {
		generatedLineups?: Record<string, string[]>;
	} = $props();

	// Calculate analytics data
	const analyticsData = $derived.by(() => {
		if (Object.keys(generatedLineups).length === 0) {
			return null;
		}
		return calculateAnalyticsData(generatedLineups);
	});

	// Helper function to get color for fairness score
	function getFairnessColor(score: number): string {
		if (score >= 80) return 'var(--color-success)';
		if (score >= 60) return 'var(--color-warning)';
		return 'var(--color-error)';
	}

	// Helper function to get fairness label
	function getFairnessLabel(score: number): string {
		if (score >= 80) return 'Excellent';
		if (score >= 60) return 'Good';
		if (score >= 40) return 'Fair';
		return 'Needs Improvement';
	}
</script>

{#if analyticsData}
	<div class="analytics-panel rounded-lg bg-[var(--color-bg-accent)] p-4 print:hidden">
		<h3 class="mb-4 text-lg font-medium text-[var(--color-text-light)]">
			📊 Lineup Analytics & Fairness Report
		</h3>

		<!-- Summary Statistics -->
		<div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
			<div class="rounded-lg bg-[var(--color-bg-secondary)] p-3">
				<div class="text-2xl font-bold text-[var(--color-primary)]">
					{analyticsData?.summary.fairnessScore}%
				</div>
				<div class="text-sm text-[var(--color-text-muted)]">Fairness Score</div>
				<div
					class="text-xs"
					style="color: {getFairnessColor(analyticsData?.summary.fairnessScore || 0)}"
				>
					{getFairnessLabel(analyticsData?.summary.fairnessScore || 0)}
				</div>
			</div>

			<div class="rounded-lg bg-[var(--color-bg-secondary)] p-3">
				<div class="text-2xl font-bold text-[var(--color-text)]">
					{analyticsData?.summary.averageFieldTime.toFixed(1)}
				</div>
				<div class="text-sm text-[var(--color-text-muted)]">Avg Field Time</div>
				<div class="text-xs text-[var(--color-text-light)]">innings per player</div>
			</div>

			<div class="rounded-lg bg-[var(--color-bg-secondary)] p-3">
				<div class="text-2xl font-bold text-[var(--color-text)]">
					{analyticsData?.summary.averageBenchTime.toFixed(1)}
				</div>
				<div class="text-sm text-[var(--color-text-muted)]">Avg Bench Time</div>
				<div class="text-xs text-[var(--color-text-light)]">innings per player</div>
			</div>

			<div class="rounded-lg bg-[var(--color-bg-secondary)] p-3">
				<div class="text-2xl font-bold text-[var(--color-text)]">
					{analyticsData?.summary.totalPlayers}
				</div>
				<div class="text-sm text-[var(--color-text-muted)]">Total Players</div>
				<div class="text-xs text-[var(--color-text-light)]">attending</div>
			</div>
		</div>

		<!-- Charts Section -->
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
			<!-- Player Field Time Chart -->
			<div class="rounded-lg bg-[var(--color-bg-secondary)] p-4">
				<h4 class="text-md mb-3 font-medium text-[var(--color-text-light)]">
					Player Field Time Distribution
				</h4>
				<p class="mb-3 text-xs text-[var(--color-text-muted)]">
					Shows how many innings each attending player spends on the field. More even distribution =
					better fairness.
				</p>

				<div class="space-y-2">
					{#each (analyticsData?.playerFrequencies || [])
						.filter((p) => getAttendingPlayers().includes(p.player))
						.sort((a, b) => a.player.localeCompare(b.player)) as playerData (playerData.player)}
						<div class="flex items-center gap-3">
							<div class="w-20 truncate text-sm font-medium text-[var(--color-text)]">
								{playerData.player}
							</div>
							<div class="flex-1">
								<div class="flex items-center gap-2">
									<div class="h-4 flex-1 rounded-full bg-[var(--color-border)]">
										<div
											class="h-4 rounded-full bg-[var(--color-primary)] transition-all duration-300"
											style="width: {(playerData.fieldInnings /
												(analyticsData?.summary.totalInnings || 1)) *
												100}%"
										></div>
									</div>
									<div class="w-8 text-right text-sm font-medium text-[var(--color-text)]">
										{playerData.fieldInnings}
									</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Position Rotation Chart -->
			<div class="rounded-lg bg-[var(--color-bg-secondary)] p-4">
				<h4 class="text-md mb-3 font-medium text-[var(--color-text-light)]">
					Position Rotation Analysis
				</h4>
				<p class="mb-3 text-xs text-[var(--color-text-muted)]">
					Shows how many different players play each position. More rotation = better player
					development.
				</p>

				<div class="space-y-2">
					{#each analyticsData?.positionFrequencies || [] as positionData (positionData.position)}
						<div class="flex items-center gap-3">
							<div class="w-20 truncate text-sm font-medium text-[var(--color-text)]">
								{positionData.position}
							</div>
							<div class="flex-1">
								<div class="flex items-center gap-2">
									<div class="h-4 flex-1 rounded-full bg-[var(--color-border)]">
										<div
											class="h-4 rounded-full bg-[var(--color-secondary)] transition-all duration-300"
											style="width: {(Object.keys(positionData.playerBreakdown).length /
												(analyticsData?.summary.totalPlayers || 1)) *
												100}%"
										></div>
									</div>
									<div class="w-8 text-right text-sm font-medium text-[var(--color-text)]">
										{Object.keys(positionData.playerBreakdown).length}
									</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<!-- Detailed Player Breakdown -->
		<div class="mt-6 rounded-lg bg-[var(--color-bg-secondary)] p-4">
			<h4 class="text-md mb-3 font-medium text-[var(--color-text-light)]">
				Detailed Player Breakdown
			</h4>
			<p class="mb-3 text-xs text-[var(--color-text-muted)]">
				Complete breakdown of each player's playing time and position assignments.
			</p>

			<div class="overflow-x-auto">
				<table class="w-full border-collapse text-sm">
					<thead>
						<tr class="border-b border-[var(--color-border)]">
							<th class="p-2 text-left text-xs font-medium text-[var(--color-text-light)]"
								>Player</th
							>
							<th class="p-2 text-center text-xs font-medium text-[var(--color-text-light)]"
								>Status</th
							>
							<th class="p-2 text-center text-xs font-medium text-[var(--color-text-light)]"
								>Field (In/Out)</th
							>
							<th class="p-2 text-center text-xs font-medium text-[var(--color-text-light)]"
								>Bench</th
							>
							<th class="p-2 text-center text-xs font-medium text-[var(--color-text-light)]"
								>Total</th
							>
							<th class="p-2 text-left text-xs font-medium text-[var(--color-text-light)]"
								>Positions Played</th
							>
						</tr>
					</thead>
					<tbody>
						{#each (analyticsData?.playerFrequencies || []).sort( (a, b) => a.player.localeCompare(b.player) ) as playerData (playerData.player)}
							{@const isAttending = getAttendingPlayers().includes(playerData.player)}
							<tr class="border-b border-[var(--color-border-light)]">
								<td class="p-2 font-medium text-[var(--color-text)]">{playerData.player}</td>
								<td class="p-2 text-center">
									{#if isAttending}
										<span class="rounded bg-[var(--color-success)] px-2 py-1 text-xs text-white">
											Present
										</span>
									{:else}
										<span class="rounded bg-[var(--color-error)] px-2 py-1 text-xs text-white">
											Absent
										</span>
									{/if}
								</td>
								<td class="p-2 text-center font-medium text-[var(--color-primary)]">
									{#if isAttending}
										{playerData.fieldInnings} ({playerData.infieldInnings}/{playerData.outfieldInnings})
									{:else}
										<span class="text-[var(--color-text-muted)]">-</span>
									{/if}
								</td>
								<td class="p-2 text-center font-medium text-[var(--color-dirt)]">
									{#if isAttending}
										{playerData.benchInnings}
									{:else}
										<span class="text-[var(--color-text-muted)]">-</span>
									{/if}
								</td>
								<td class="p-2 text-center font-medium text-[var(--color-text)]">
									{#if isAttending}
										{playerData.totalInnings}
									{:else}
										<span class="text-[var(--color-text-muted)]">-</span>
									{/if}
								</td>
								<td class="p-2 text-[var(--color-text-muted)]">
									{#if isAttending}
										{Object.entries(playerData.positionBreakdown)
											.filter(([, count]) => count > 0)
											.map(([position, count]) => `${position} (${count})`)
											.join(', ') || 'None'}
									{:else}
										<span class="text-[var(--color-text-muted)]">-</span>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<!-- Fairness Guidelines -->
		<div
			class="mt-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-accent)] p-3"
		>
			<h5 class="mb-2 text-sm font-medium text-[var(--color-text-light)]">
				📋 Fairness Guidelines
			</h5>
			<ul class="space-y-1 text-xs text-[var(--color-text-muted)]">
				<li>
					• <strong>Field Time:</strong> All players should get similar field time (within 1-2 innings)
				</li>
				<li>
					• <strong>Position Rotation:</strong> Players should experience different positions when possible
				</li>
				<li>
					• <strong>Bench Time:</strong> Sitting time should be distributed fairly among all players
				</li>
				<li>
					• <strong>Fairness Score:</strong> 80%+ is excellent, 60-79% is good, below 60% needs improvement
				</li>
			</ul>
		</div>
	</div>
{/if}
