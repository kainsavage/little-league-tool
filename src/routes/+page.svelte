<script lang="ts">
	import {
		// State
		roster,
		battingOrder,
		generatedLineups,

		// Initialization
		initializeBaseballLineup
	} from '$lib/baseball-lineup-logic.svelte';

	// Components
	import TabNavigation from '$lib/components/TabNavigation.svelte';
	import RosterTab from '$lib/components/RosterTab.svelte';
	import BattingOrderTab from '$lib/components/BattingOrderTab.svelte';
	import DefensiveTab from '$lib/components/DefensiveTab.svelte';
	import ShareModal from '$lib/components/ShareModal.svelte';
	import PrintBattingOrder from '$lib/components/PrintBattingOrder.svelte';
	import PrintDefensiveLineup from '$lib/components/PrintDefensiveLineup.svelte';

	// Active tab
	let activeTab = $state('roster');

	// Loading state for URL decoding
	let isLoadingUrlState = $state(true);

	// URL sharing state
	let showShareModal = $state(false);
	let isGeneratingUrl = $state(false);

	function getTabFromHash(): string {
		if (typeof window !== 'undefined') {
			const hash = window.location.hash.slice(1); // Remove the #

			// Check if hash contains state data with tab parameter
			if (hash.includes('v1=') && hash.includes('&tab=')) {
				// Get all tab parameters and take the last one
				const tabMatches = hash.match(/&tab=([^~]+)/g);
				if (tabMatches && tabMatches.length > 0) {
					const lastTabMatch = tabMatches[tabMatches.length - 1];
					const tab = lastTabMatch.replace('&tab=', '');
					const validTabs = ['roster', 'batting', 'defensive'];
					return validTabs.includes(tab) ? tab : 'roster';
				}
			}

			// Check for simple tab hash
			const validTabs = ['roster', 'batting', 'defensive'];
			return validTabs.includes(hash) ? hash : 'roster';
		}
		return 'roster';
	}

	function handleHashChange() {
		activeTab = getTabFromHash();
	}

	// Initialize on load
	async function initializeApp() {
		// Always start with loading state true
		// Check if we have URL state to decode
		if (typeof window !== 'undefined' && window.location.hash.includes('#v1=')) {
			// Loading state already true, don't set tab yet - wait for URL decoding
		} else {
			// No URL state, but still need to wait for initialization to complete
			// Set tab from hash but keep loading until initialization is done
			activeTab = getTabFromHash();
		}

		// Initialize the baseball lineup logic and wait for it to complete
		await initializeBaseballLineup();

		// Clear loading state after initialization is complete
		isLoadingUrlState = false;
	}

	// Start initialization
	initializeApp();

	// Listen for URL state loading completion
	if (typeof window !== 'undefined') {
		window.addEventListener('urlStateLoaded', (event: Event) => {
			const customEvent = event as CustomEvent;
			const { tab } = customEvent.detail;

			// Clear loading state
			isLoadingUrlState = false;

			// Set the tab if specified, otherwise use default
			if (tab && ['roster', 'batting', 'defensive'].includes(tab)) {
				activeTab = tab;
			} else {
				activeTab = getTabFromHash();
			}
		});
	}

	// Collapse capabilities panel by default if lineups already exist
	$effect(() => {
		if (Object.keys(generatedLineups).length > 0) {
			// This will be handled by the DefensiveTab component
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

	<!-- Loading spinner for URL state decoding -->
	{#if isLoadingUrlState}
		<div class="flex items-center justify-center py-12">
			<div class="flex flex-col items-center space-y-4">
				<div
					class="h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--color-primary)]"
				></div>
				<p class="text-[var(--color-text-muted)]">Loading state...</p>
			</div>
		</div>
	{:else}
		<!-- Tab Navigation -->
		<TabNavigation bind:activeTab {roster} {isGeneratingUrl} bind:showShareModal />

		<!-- Print-Only Content (Always Available) -->
		<PrintBattingOrder {battingOrder} />
		<PrintDefensiveLineup {generatedLineups} />

		<!-- Tab Content -->
		{#if activeTab === 'roster'}
			<RosterTab {roster} />
		{/if}

		{#if activeTab === 'batting'}
			<BattingOrderTab {battingOrder} />
		{/if}

		{#if activeTab === 'defensive'}
			<DefensiveTab {roster} {generatedLineups} />
		{/if}
	{/if}

	<!-- Share Modal -->
	<ShareModal bind:showModal={showShareModal} {roster} />
</div>

<style>
	/* Print Styles */
	@media print {
		/* Reset colors for print */
		* {
			color: black !important;
			background: white !important;
		}

		@page {
			size: landscape;
			margin: 0.5in;
		}

		/* Container adjustments for print */
		.container {
			max-width: none !important;
			padding: 0 !important;
			margin: 0 !important;
		}

		h1 {
			color: black !important;
			margin-top: 1em;
			margin-bottom: 0.5em;
		}
	}
</style>
