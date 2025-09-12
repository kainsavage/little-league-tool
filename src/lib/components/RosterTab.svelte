<script lang="ts">
	import { addPlayer, removePlayer, updatePlayerName } from '$lib/baseball-lineup-logic.svelte';

	// Props
	let { roster = [] }: { roster?: string[] } = $props();

	// Local state
	let newPlayerName = $state('');
	let editingPlayer = $state<string | null>(null);
	let editingName = $state('');

	// Computed: sorted roster for display
	let sortedRoster = $derived([...roster].sort((a, b) => a.localeCompare(b)));

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
</script>

<!-- Roster Tab -->
<div class="space-y-6 print:hidden">
	<div class="flex items-center justify-between">
		<h2 class="text-2xl font-semibold text-[var(--color-text)]">Team Roster</h2>
		<p class="text-md font-semibold text-[var(--color-text)]">
			{roster.length} player{roster.length !== 1 ? 's' : ''}
		</p>
	</div>

	<!-- Current Roster -->
	<div class="rounded-lg bg-[var(--color-bg-accent)] p-4">
		{#if roster.length === 0}
			<p class="text-[var(--color-text-muted)] italic">
				No players added yet. Add your first player above!
			</p>
		{:else}
			<div class="space-y-2">
				{#each sortedRoster as player (player)}
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
			<li>• Your roster is automatically saved to the URL for easy sharing</li>
			<li>
				• Once you have players, use the other tabs to manage batting order and defensive
				positioning
			</li>
		</ul>
	</div>
</div>
