<script lang="ts">
	import { goto } from '$app/navigation';

	// Props
	let {
		activeTab = $bindable('roster'),
		roster = [],
		isGeneratingUrl = false,
		showShareModal = $bindable(false)
	}: {
		activeTab?: string;
		roster?: string[];
		isGeneratingUrl?: boolean;
		showShareModal?: boolean;
	} = $props();

	// Hash parameter handling
	async function updateHashFromTab(tab: string) {
		if (typeof window !== 'undefined') {
			const currentHash = window.location.hash;
			// Check if current hash contains state data
			if (currentHash.includes('#v1=')) {
				// Preserve state data and replace tab parameter
				const statePart = currentHash.split('~')[0]; // Get the state part before checksum
				const checksumPart = currentHash.split('~')[1]; // Get the checksum part

				// Remove existing tab parameters from state part
				const cleanStatePart = statePart.replace(/&tab=[^~]+/g, '');

				const newHash = `${cleanStatePart}&tab=${tab}~${checksumPart}`;
				await goto(`${window.location.pathname}${newHash}`, { replaceState: true, noScroll: true });
			} else {
				// No state data, just set the tab
				await goto(`${window.location.pathname}#${tab}`, { replaceState: true, noScroll: true });
			}
		}
		// Update the active tab immediately since hashchange event might not fire
		activeTab = tab;
	}

	// Share button click handler
	function handleShareClick() {
		showShareModal = true;
	}
</script>

<!-- Tab Navigation -->
<div
	class="mb-6 flex items-center justify-between border-b border-[var(--color-border)] print:hidden"
>
	<div class="flex">
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
	<div class="flex gap-2">
		<button
			class="flex items-center gap-2 rounded bg-[var(--color-primary)] px-4 py-2 text-white transition-colors hover:bg-[var(--color-primary-dark)]"
			onclick={handleShareClick}
			disabled={isGeneratingUrl || roster.length === 0}
		>
			{#if isGeneratingUrl}
				<svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
					></circle>
					<path
						class="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					></path>
				</svg>
				Generating...
			{:else}
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
					/>
				</svg>
				Share
			{/if}
		</button>
		<button
			class="flex items-center gap-2 rounded bg-[var(--color-secondary)] px-4 py-2 text-white transition-colors hover:bg-[var(--color-secondary-dark)]"
			onclick={() => window.print()}
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
				/>
			</svg>
			Print
		</button>
	</div>
</div>
