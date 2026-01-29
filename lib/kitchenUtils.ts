/**
 * Checks if the kitchen is currently open based on admin control.
 * Defaults to true if no value is set in localStorage.
 */
export async function isKitchenOpen(): Promise<boolean> {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_URL || ''}/api/settings?key=kitchen_status`, { cache: 'no-store' });
        if (res.ok) {
            const data = await res.json();
            return data.value === 'open';
        }
    } catch (e) {
        // Fallback
    }
    return true;
}

/**
 * Admin function to toggle kitchen status.
 */
export function setKitchenStatus(status: 'open' | 'closed') {
    if (typeof window !== 'undefined') {
        localStorage.setItem('chitko-kitchen-status', status);
        // Trigger storage event for other tabs to react
        window.dispatchEvent(new Event('storage'));
    }
}

export function getKitchenHoursString(): string {
    return "Status controlled by Admin";
}
