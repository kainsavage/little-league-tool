<script lang="ts">
	import QRCode from 'qrcode';

	// Props
	let { showModal = $bindable(false), roster = [] }: { showModal?: boolean; roster?: string[] } =
		$props();

	// State
	let shareUrl = $state('');
	let isGeneratingUrl = $state(false);
	let qrCodeDataUrl = $state('');
	let isCopied = $state(false);

	// URL sharing functions
	async function generateShareUrl() {
		if (roster.length === 0) {
			alert('Please add at least one player to the roster before sharing.');
			return;
		}

		isGeneratingUrl = true;
		try {
			// Use current URL since it's already updated with state
			shareUrl = window.location.href;

			// Generate QR code
			qrCodeDataUrl = await QRCode.toDataURL(shareUrl, {
				width: 256,
				margin: 2,
				color: {
					dark: '#000000',
					light: '#FFFFFF'
				}
			});
		} catch (error) {
			console.error('Failed to generate share URL:', error);
			alert('Failed to generate share URL. Please try again.');
		} finally {
			isGeneratingUrl = false;
		}
	}

	async function copyShareUrl() {
		try {
			await navigator.clipboard.writeText(shareUrl);
			isCopied = true;
			// Reset the copied state after 2 seconds
			setTimeout(() => {
				isCopied = false;
			}, 2000);
		} catch (error) {
			console.error('Failed to copy URL:', error);
			alert('Failed to copy URL to clipboard!');
		}
	}

	function closeModal() {
		showModal = false;
		shareUrl = '';
		qrCodeDataUrl = '';
		isCopied = false;
	}

	// Generate URL when modal opens
	$effect(() => {
		if (showModal && !shareUrl) {
			generateShareUrl();
		}
	});
</script>

<!-- Share Modal -->
{#if showModal}
	<div
		class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black print:hidden"
	>
		<div class="w-full max-w-md rounded-lg bg-[var(--color-bg-secondary)] p-6 shadow-xl">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-xl font-semibold text-[var(--color-text)]">Share Lineup</h3>
				<button
					class="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
					onclick={closeModal}
					aria-label="Close share modal"
				>
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<div class="space-y-4">
				<!-- QR Code Section -->
				<div class="text-center">
					<h4 class="mb-2 text-lg font-medium text-[var(--color-text-light)]">Share Your Lineup</h4>
					<p class="mb-4 text-sm text-[var(--color-text-muted)]">
						Scan the QR code to open this lineup on another device, or copy the URL below.
					</p>

					{#if isGeneratingUrl}
						<div class="flex items-center justify-center py-8">
							<svg
								class="h-8 w-8 animate-spin text-[var(--color-primary)]"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								></circle>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
						</div>
					{:else if qrCodeDataUrl}
						<div class="mb-4 flex justify-center">
							<img
								src={qrCodeDataUrl}
								alt="QR Code for lineup URL"
								class="rounded border border-[var(--color-border)]"
							/>
						</div>
					{/if}
				</div>

				<!-- Copy Button -->
				{#if shareUrl}
					<button
						class="w-full rounded px-4 py-2 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 {isCopied
							? 'bg-green-600 hover:bg-green-700'
							: 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]'}"
						onclick={copyShareUrl}
						disabled={isCopied}
					>
						{isCopied ? 'Copied to Clipboard' : 'Copy URL'}
					</button>
				{/if}

				<!-- Info Section -->
				<div class="rounded bg-[var(--color-bg-accent)] p-3 text-sm text-[var(--color-text-muted)]">
					<p class="mb-1 font-medium text-[var(--color-text-light)]">How it works:</p>
					<ul class="space-y-1 text-xs">
						<li>• Scan the QR code with any device to open this lineup</li>
						<li>• The URL contains all your roster and lineup data</li>
						<li>• No data is sent to any server - everything is client-side</li>
						<li>• Data is automatically saved to the URL as you make changes</li>
					</ul>
				</div>
			</div>
		</div>
	</div>
{/if}
