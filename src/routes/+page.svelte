<script lang="ts">
	import {
		// State
		roster,
		battingOrder,
		generatedLineups,
		POSITIONS,

		// Roster management
		addPlayer,
		removePlayer,
		updatePlayerName,

		// Batting order management
		removeFromBattingOrder,
		randomizeBattingOrder,

		// Player capabilities
		togglePlayerCapability,
		canPlayerPlayPosition,
		allPlayersHaveCapabilities,

		// Defensive lineup generation
		generateDefensiveLineups,
		clearGeneratedLineups,
		validateLineup,

		// Initialization
		initializeBaseballLineup
	} from '$lib/baseball-lineup-logic.svelte';

	// Active tab
	let activeTab = $state('roster');

	// New player input
	let newPlayerName = $state('');

	// Editing state
	let editingPlayer = $state<string | null>(null);
	let editingName = $state('');

	// Collapsible state for Player Capabilities panel
	let capabilitiesCollapsed = $state(false);

	// Local functions for UI state management
	function handleAddPlayer() {
		if (addPlayer(newPlayerName)) {
			newPlayerName = '';
		}
	}

	function startEditing(player: string) {
		editingPlayer = player;
		editingName = player;
	}

	function saveEdit() {
		if (editingPlayer && updatePlayerName(editingPlayer, editingName)) {
			editingPlayer = null;
			editingName = '';
		}
	}

	function cancelEdit() {
		editingPlayer = null;
		editingName = '';
	}

	function handleGenerateLineups() {
		generateDefensiveLineups();
		capabilitiesCollapsed = true;
	}

	function toggleCapabilitiesPanel() {
		capabilitiesCollapsed = !capabilitiesCollapsed;
	}

	// Hash parameter handling
	function updateHashFromTab(tab: string) {
		if (typeof window !== 'undefined') {
			window.location.hash = tab;
		}
	}

	function getTabFromHash(): string {
		if (typeof window !== 'undefined') {
			const hash = window.location.hash.slice(1); // Remove the #
			const validTabs = ['roster', 'batting', 'defensive'];
			return validTabs.includes(hash) ? hash : 'roster';
		}
		return 'roster';
	}

	function handleHashChange() {
		activeTab = getTabFromHash();
	}

	// Initialize on load
	initializeBaseballLineup();

	// Set initial tab from hash
	activeTab = getTabFromHash();

	// Collapse capabilities panel by default if lineups already exist
	$effect(() => {
		if (Object.keys(generatedLineups).length > 0) {
			capabilitiesCollapsed = true;
		}
	});

	// Listen for hash changes
	$effect(() => {
		if (typeof window !== 'undefined') {
			window.addEventListener('hashchange', handleHashChange);
			return () => {
				window.removeEventListener('hashchange', handleHashChange);
			};
		}
	});
</script>

<div class="container mx-auto max-w-6xl p-6">
	<h1 class="mb-8 text-center text-3xl font-bold text-[var(--color-text)] print:hidden">
		Baseball Coaching Tool
	</h1>

	<!-- Tab Navigation -->
	<div class="mb-6 flex border-b border-[var(--color-border)] print:hidden">
		<button
			class="border-b-2 px-6 py-3 text-lg font-medium transition-colors {activeTab === 'roster'
				? 'border-[var(--color-primary)] text-[var(--color-primary)]'
				: 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-light)]'}"
			onclick={() => updateHashFromTab('roster')}
		>
			Roster
		</button>
		<button
			class="border-b-2 px-6 py-3 text-lg font-medium transition-colors {activeTab === 'batting'
				? 'border-[var(--color-primary)] text-[var(--color-primary)]'
				: 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-light)]'}"
			onclick={() => updateHashFromTab('batting')}
		>
			Batting Order
		</button>
		<button
			class="border-b-2 px-6 py-3 text-lg font-medium transition-colors {activeTab === 'defensive'
				? 'border-[var(--color-primary)] text-[var(--color-primary)]'
				: 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-light)]'}"
			onclick={() => updateHashFromTab('defensive')}
		>
			Defensive Positioning
		</button>
	</div>

	<!-- Print-Only Content (Always Available) -->
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
				</tbody>
			</table>
		{:else}
			<p class="text-[var(--color-text-muted)] italic">No players in batting order yet</p>
		{/if}
	</div>

	<!-- Print-Friendly Defensive Lineup -->
	{#if Object.keys(generatedLineups).length > 0}
		<div class="defensive-lineup-print hidden print:block">
			<h2>Defensive Lineup</h2>
			<table>
				<thead>
					<tr>
						<th class="position">Position</th>
						{#each Array.from({ length: 6 }, (_, inning) => inning) as inning (inning)}
							<th class="inning">Inning {inning + 1}</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each POSITIONS as position (position)}
						<tr>
							<td class="position">{position}</td>
							{#each generatedLineups[position] || [] as player, inning (inning)}
								<td class="inning">
									{#if player}
										{player}
									{:else}
										-
									{/if}
								</td>
							{/each}
						</tr>
					{/each}
					<!-- Sitting Players Rows -->
					{#each Array.from({ length: roster.length - 9 }, (_, index) => index) as index (index)}
						{@const sittingKey = `Sitting ${index + 1}`}
						<tr class="sitting-row">
							<td class="position">Sitting {index + 1}</td>
							{#each generatedLineups[sittingKey] || [] as sittingPlayer, inning (inning)}
								<td class="inning">
									{#if sittingPlayer}
										{sittingPlayer}
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
	{/if}

	<!-- Landscape Defensive Lineup (Print Only) -->
	{#if Object.keys(generatedLineups).length > 0}
		<div class="defensive-lineup-landscape hidden print:block">
			<h2>Defensive Lineup</h2>
			<table>
				<thead>
					<tr>
						<th class="position">Position</th>
						{#each Array.from({ length: 6 }, (_, inning) => inning) as inning (inning)}
							<th class="inning">Inning {inning + 1}</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each POSITIONS as position (position)}
						<tr>
							<td class="position">{position}</td>
							{#each generatedLineups[position] || [] as player, inning (inning)}
								<td class="inning">
									{#if player}
										{player}
									{:else}
										-
									{/if}
								</td>
							{/each}
						</tr>
					{/each}
					<!-- Sitting Players Rows -->
					{#each Array.from({ length: roster.length - 9 }, (_, index) => index) as index (index)}
						{@const sittingKey = `Sitting ${index + 1}`}
						<tr class="sitting-row">
							<td class="position">Sitting {index + 1}</td>
							{#each generatedLineups[sittingKey] || [] as sittingPlayer, inning (inning)}
								<td class="inning">
									{#if sittingPlayer}
										{sittingPlayer}
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
	{/if}

	<!-- Roster Tab -->
	{#if activeTab === 'roster'}
		<div class="space-y-6 print:hidden">
			<div class="flex items-center justify-between">
				<h2 class="text-2xl font-semibold text-[var(--color-text)]">Team Roster</h2>
				<p class="text-sm text-[var(--color-text-muted)]">
					{roster.length} player{roster.length !== 1 ? 's' : ''}
				</p>
			</div>

			<!-- Current Roster -->
			<div class="rounded-lg bg-[var(--color-bg-accent)] p-4">
				<h3 class="mb-3 text-lg font-medium text-[var(--color-text-light)]">
					Current Roster ({roster.length})
				</h3>
				{#if roster.length === 0}
					<p class="text-[var(--color-text-muted)] italic">
						No players added yet. Add your first player above!
					</p>
				{:else}
					<div class="space-y-2">
						{#each roster as player (player)}
							<div
								class="flex items-center justify-between rounded border bg-[var(--color-bg-secondary)] p-3"
							>
								{#if editingPlayer === player}
									<input
										type="text"
										bind:value={editingName}
										class="flex-1 rounded border border-[var(--color-border)] bg-white p-1 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
										onkeydown={(e) => {
											if (e.key === 'Enter') saveEdit();
											if (e.key === 'Escape') cancelEdit();
										}}
									/>
								{:else}
									<span class="font-medium text-[var(--color-text)]">{player}</span>
								{/if}
								<div class="flex gap-2">
									{#if editingPlayer === player}
										<button
											class="rounded bg-[var(--color-success)] px-3 py-1 text-sm text-white transition-colors hover:bg-[var(--color-primary-dark)]"
											onclick={saveEdit}
										>
											Save
										</button>
										<button
											class="rounded bg-[var(--color-dirt)] px-3 py-1 text-sm text-white transition-colors hover:bg-[var(--color-dirt-dark)]"
											onclick={cancelEdit}
										>
											Cancel
										</button>
									{:else}
										<button
											class="rounded bg-[var(--color-primary)] px-3 py-1 text-sm text-white transition-colors hover:bg-[var(--color-primary-dark)]"
											onclick={() => startEditing(player)}
										>
											Edit
										</button>
										<button
											class="rounded bg-[var(--color-error)] px-3 py-1 text-sm text-white transition-colors hover:bg-[var(--color-secondary-dark)]"
											onclick={() => removePlayer(player)}
										>
											Remove
										</button>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Add New Player -->
			<div class="rounded-lg bg-[var(--color-bg-accent)] p-4">
				<h3 class="mb-3 text-lg font-medium text-[var(--color-text-light)]">Add New Player</h3>
				<div class="flex gap-2">
					<input
						type="text"
						bind:value={newPlayerName}
						placeholder="Enter player name"
						class="flex-1 rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-2 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
						onkeydown={(e) => e.key === 'Enter' && handleAddPlayer()}
					/>
					<button
						class="rounded bg-[var(--color-primary)] px-4 py-2 text-white transition-colors hover:bg-[var(--color-primary-dark)]"
						onclick={handleAddPlayer}
						disabled={!newPlayerName.trim()}
					>
						Add Player
					</button>
				</div>
			</div>

			<!-- Instructions -->
			<div class="instructions rounded-lg bg-[var(--color-bg-accent)] p-4">
				<h3 class="mb-3 text-lg font-medium text-[var(--color-text-light)]">Instructions</h3>
				<ul class="space-y-2 text-sm text-[var(--color-text-muted)]">
					<li>• Add players by entering their name and clicking "Add Player"</li>
					<li>• Click "Edit" to rename a player</li>
					<li>• Click "Remove" to delete a player from the roster</li>
					<li>• Your roster is automatically saved to your browser's local storage</li>
					<li>
						• Once you have players, use the other tabs to manage batting order and defensive
						positioning
					</li>
				</ul>
			</div>
		</div>
	{/if}

	<!-- Batting Order Tab -->
	{#if activeTab === 'batting'}
		<div class="space-y-6 print:hidden">
			<div class="flex items-center justify-between">
				<h2 class="text-2xl font-semibold text-[var(--color-text)]">Batting Order</h2>
				<button
					class="rounded bg-[var(--color-error)] px-4 py-2 text-white transition-colors hover:bg-[var(--color-secondary-dark)]"
					onclick={randomizeBattingOrder}
				>
					Randomize
				</button>
			</div>

			<!-- Current Batting Order (Screen View) -->
			<div class="rounded-lg bg-[var(--color-bg-accent)] p-4 print:hidden">
				<h3 class="mb-3 text-lg font-medium text-[var(--color-text-light)]">
					Current Batting Order
				</h3>
				{#if battingOrder.length === 0}
					<p class="text-[var(--color-text-muted)] italic">No players in batting order yet</p>
				{:else}
					<div class="space-y-2">
						{#each battingOrder as player, index (player)}
							<div
								class="flex items-center justify-between rounded border bg-[var(--color-bg-secondary)] p-3"
							>
								<span class="font-medium">{index + 1}. {player}</span>
								<button
									class="text-sm text-[var(--color-error)] hover:text-[var(--color-secondary-dark)]"
									onclick={() => removeFromBattingOrder(player)}
								>
									Remove
								</button>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	{/if}

	<!-- Defensive Positioning Tab -->
	{#if activeTab === 'defensive'}
		<div class="space-y-6 print:hidden">
			<div class="flex items-center justify-between">
				<h2 class="text-2xl font-semibold text-[var(--color-text)]">Defensive Positioning</h2>
				<div class="flex gap-2">
					{#if allPlayersHaveCapabilities()}
						<button
							class="rounded bg-[var(--color-success)] px-4 py-2 text-white transition-colors hover:bg-[var(--color-primary-dark)]"
							onclick={handleGenerateLineups}
						>
							Generate Lineups
						</button>
					{/if}
					{#if Object.keys(generatedLineups).length > 0}
						<button
							class="rounded bg-[var(--color-error)] px-4 py-2 text-white transition-colors hover:bg-[var(--color-secondary-dark)]"
							onclick={clearGeneratedLineups}
						>
							Clear Lineups
						</button>
					{/if}
				</div>
			</div>

			<!-- Player Position Capabilities -->
			<div class="player-capabilities rounded-lg bg-[var(--color-bg-accent)] p-4">
				<div class="flex items-center justify-between">
					<button
						class="flex items-center gap-2 text-lg font-medium text-[var(--color-text-light)] transition-colors hover:text-[var(--color-text)]"
						onclick={toggleCapabilitiesPanel}
					>
						<svg
							class="h-5 w-5 transition-transform duration-200 {capabilitiesCollapsed
								? 'rotate-0'
								: 'rotate-90'}"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 5l7 7-7 7"
							/>
						</svg>
						Player Position Capabilities
					</button>
					{#if !allPlayersHaveCapabilities()}
						<p class="text-sm text-[var(--color-text-muted)]">
							Assign at least one position to each player to generate lineups
						</p>
					{/if}
				</div>

				{#if !capabilitiesCollapsed}
					<div class="capabilities-content transition-all duration-300 ease-in-out">
						<p class="mb-4 text-sm text-[var(--color-text-muted)]">
							Click to toggle which positions each player can play. Once all players have at least
							one position, you can generate 6 random defensive lineups.
						</p>
						<div class="overflow-x-auto">
							<table class="w-full border-collapse">
								<thead>
									<tr class="border-b border-[var(--color-border)]">
										<th class="p-2 text-left text-sm font-medium text-[var(--color-text-light)]"
											>Player</th
										>
										{#each POSITIONS as position (position)}
											<th class="p-2 text-center text-sm font-medium text-[var(--color-text-light)]"
												>{position}</th
											>
										{/each}
									</tr>
								</thead>
								<tbody>
									{#each roster as player (player)}
										<tr class="border-b border-[var(--color-border-light)]">
											<td class="p-2 font-medium text-[var(--color-text)]">{player}</td>
											{#each POSITIONS as position (position)}
												<td class="p-2 text-center">
													<button
														class="h-8 w-8 rounded border-2 transition-colors {canPlayerPlayPosition(
															player,
															position
														)
															? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
															: 'border-[var(--color-border-dark)] bg-transparent text-[var(--color-text-muted)] hover:border-[var(--color-primary)]'}"
														onclick={() => togglePlayerCapability(player, position)}
													>
														{canPlayerPlayPosition(player, position) ? '✓' : '✗'}
													</button>
												</td>
											{/each}
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				{/if}
			</div>

			<!-- Generated Lineups Results (Screen View) -->
			{#if Object.keys(generatedLineups).length > 0}
				<div class="rounded-lg bg-[var(--color-bg-accent)] p-4 print:hidden">
					<h3 class="mb-3 text-lg font-medium text-[var(--color-text-light)]">
						Generated Defensive Lineups
					</h3>
					<p class="mb-4 text-sm text-[var(--color-text-muted)]">
						Each position shows the player assigned for each of the 6 innings. The "Sitting" rows
						show which {roster.length - 9} players are not on the field for each inning.
						<br /><br />
						<strong>League Rules Applied:</strong>
						• Max 3 innings per position per player • Min 2 infield innings per player (Pitcher, Catcher,
						1st-3rd Base, Shortstop) • Max 1 inning difference in bench time between players • 4+ innings
						catching = no pitching eligibility • 2+ innings pitching = no catching eligibility
					</p>

					<!-- League Rules Validation -->
					<div class="validation-message">
						{#if !validateLineup(generatedLineups).isValid}
							{@const validation = validateLineup(generatedLineups)}
							<div
								class="mb-4 rounded-lg border border-[var(--color-warning)] bg-[var(--color-accent-light)] p-3"
							>
								<h4 class="mb-2 text-sm font-medium text-[var(--color-error)]">
									⚠️ League Rules Violations
								</h4>
								<ul class="space-y-1 text-sm text-[var(--color-secondary-dark)]">
									{#each validation.errors as error (error)}
										<li>• {error}</li>
									{/each}
								</ul>
								<p class="mt-2 text-xs text-[var(--color-error)]">
									Try generating again or adjust player position capabilities to resolve these
									issues.
								</p>
							</div>
						{:else}
							<div
								class="mb-4 rounded-lg border border-[var(--color-success)] bg-[var(--color-bg-accent)] p-3"
							>
								<h4 class="mb-2 text-sm font-medium text-[var(--color-text)]">
									✅ All League Rules Satisfied
								</h4>
								<p class="text-sm text-[var(--color-text-light)]">
									This lineup complies with all league rules including position limits, infield
									requirements, and bench time fairness.
								</p>
							</div>
						{/if}
					</div>
					<div class="overflow-x-auto">
						<table class="w-full border-collapse">
							<thead>
								<tr class="border-b border-[var(--color-border)]">
									<th class="p-2 text-left text-sm font-medium text-[var(--color-text-light)]"
										>Position</th
									>
									{#each Array(6) as _, inning (inning)}
										<th
											class="p-2 text-center text-sm font-medium text-[var(--color-text-light)] {_}"
										>
											Inning {inning + 1}
										</th>
									{/each}
								</tr>
							</thead>
							<tbody>
								{#each POSITIONS as position (position)}
									<tr class="border-b border-[var(--color-border-light)]">
										<td class="p-2 font-medium text-[var(--color-text)]">{position}</td>
										{#each generatedLineups[position] || [] as player, inning (inning)}
											<td class="p-2 text-center text-sm">
												{#if player}
													<span class="rounded bg-[var(--color-primary)] px-2 py-1 text-white">
														{player}
													</span>
												{:else}
													<span class="text-[var(--color-text-muted)] italic">-</span>
												{/if}
											</td>
										{/each}
									</tr>
								{/each}
								<!-- Sitting Players Rows -->
								{#each Array.from({ length: roster.length - 9 }, (_, index) => index) as index (index)}
									{@const sittingKey = `Sitting ${index + 1}`}
									<tr
										class="border-b border-[var(--color-border-light)] bg-[var(--color-bg-secondary)]"
									>
										<td class="p-2 font-medium text-[var(--color-text)]">Sitting {index + 1}</td>
										{#each generatedLineups[sittingKey] || [] as sittingPlayer, inning (inning)}
											<td class="p-2 text-center text-sm">
												{#if sittingPlayer}
													<span class="rounded bg-[var(--color-dirt)] px-2 py-1 text-white">
														{sittingPlayer}
													</span>
												{:else}
													<span class="text-[var(--color-text-muted)] italic">-</span>
												{/if}
											</td>
										{/each}
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	/* Print Styles */
	@media print {
		/* Reset colors for print */
		* {
			color: black !important;
			background: white !important;
			border-color: black !important;
		}

		/* Page setup */
		:global(body) {
			font-family: Arial, sans-serif;
			font-size: 12pt;
			line-height: 1.2;
		}

		.container {
			max-width: none !important;
			padding: 0 !important;
			margin: 0 !important;
		}

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

		/* Defensive Lineup Table */
		.defensive-lineup-print {
			page-break-inside: avoid;
		}

		.defensive-lineup-print h2 {
			font-size: 16pt;
			font-weight: bold;
			margin-bottom: 10pt;
			text-align: center;
		}

		.defensive-lineup-print table {
			width: 100%;
			border-collapse: collapse;
			font-size: 9pt;
		}

		.defensive-lineup-print th {
			border: 1pt solid black;
			padding: 3pt;
			text-align: center;
			font-weight: bold;
			background: #f0f0f0 !important;
		}

		.defensive-lineup-print td {
			border: 1pt solid black;
			padding: 3pt;
			text-align: center;
		}

		.defensive-lineup-print .position {
			text-align: left;
			font-weight: bold;
			width: 15%;
		}

		.defensive-lineup-print .inning {
			width: 14.16%;
		}

		.defensive-lineup-print .sitting-row {
			background: #f8f8f8 !important;
			font-style: italic;
		}

		/* Defensive Lineup Landscape Page */
		.defensive-lineup-landscape {
			page-break-before: always;
		}

		@page {
			size: landscape;
			margin: 0.5in;
		}

		/* Hide the defensive lineup in the main print view */
		.defensive-lineup-print {
			display: none !important;
		}

		/* Show the landscape version */
		.defensive-lineup-landscape {
			display: block !important;
		}

		/* Landscape Defensive Lineup Styles */
		.defensive-lineup-landscape {
			page-break-inside: avoid;
			width: 100%;
		}

		.defensive-lineup-landscape h2 {
			font-size: 18pt;
			font-weight: bold;
			margin-bottom: 15pt;
			text-align: center;
		}

		.defensive-lineup-landscape table {
			width: 100%;
			border-collapse: collapse;
			font-size: 11pt;
		}

		.defensive-lineup-landscape th {
			border: 1pt solid black;
			padding: 4pt;
			text-align: center;
			font-weight: bold;
			background: #f0f0f0 !important;
		}

		.defensive-lineup-landscape td {
			border: 1pt solid black;
			padding: 4pt;
			text-align: center;
		}

		.defensive-lineup-landscape .position {
			text-align: left;
			font-weight: bold;
			width: 12%;
		}

		.defensive-lineup-landscape .inning {
			width: 14.66%;
		}

		.defensive-lineup-landscape .sitting-row {
			background: #f8f8f8 !important;
			font-style: italic;
		}
	}
</style>
