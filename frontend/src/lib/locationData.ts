/**
 * Indian Coastal Regions — static lookup table
 * Each entry maps a city/region name to a bounding box at city-level granularity.
 * bbox format: [south, west, north, east] in degrees.
 */

export interface RegionEntry {
    name: string;
    state: string;
    bbox: [number, number, number, number]; // [south, west, north, east]
}

export const INDIAN_COASTAL_REGIONS: RegionEntry[] = [
    // ─── Gujarat ───
    { name: 'Mumbai', state: 'Maharashtra', bbox: [18.85, 72.75, 19.28, 73.05] },
    { name: 'Kutch', state: 'Gujarat', bbox: [22.50, 68.50, 24.00, 71.00] },
    { name: 'Jamnagar', state: 'Gujarat', bbox: [22.20, 69.80, 22.70, 70.30] },
    { name: 'Porbandar', state: 'Gujarat', bbox: [21.50, 69.50, 21.80, 69.80] },
    { name: 'Dwarka', state: 'Gujarat', bbox: [22.15, 68.85, 22.50, 69.20] },
    { name: 'Surat', state: 'Gujarat', bbox: [21.05, 72.70, 21.30, 73.00] },
    { name: 'Bhavnagar', state: 'Gujarat', bbox: [21.65, 72.05, 21.90, 72.30] },
    { name: 'Mandvi', state: 'Gujarat', bbox: [22.70, 69.25, 22.95, 69.50] },
    { name: 'Okha', state: 'Gujarat', bbox: [22.40, 68.90, 22.60, 69.20] },

    // ─── Maharashtra ───
    { name: 'Ratnagiri', state: 'Maharashtra', bbox: [16.85, 73.15, 17.15, 73.45] },
    { name: 'Sindhudurg', state: 'Maharashtra', bbox: [15.90, 73.45, 16.40, 73.75] },

    // ─── Goa ───
    { name: 'Goa', state: 'Goa', bbox: [15.15, 73.65, 15.65, 74.00] },
    { name: 'Calangute', state: 'Goa', bbox: [15.50, 73.70, 15.60, 73.80] },

    // ─── Karnataka ───
    { name: 'Mangalore', state: 'Karnataka', bbox: [12.80, 74.75, 13.05, 75.00] },
    { name: 'Udupi', state: 'Karnataka', bbox: [13.25, 74.60, 13.50, 74.85] },
    { name: 'Karwar', state: 'Karnataka', bbox: [14.75, 74.05, 14.95, 74.25] },

    // ─── Kerala ───
    { name: 'Kochi', state: 'Kerala', bbox: [9.80, 76.15, 10.10, 76.40] },
    { name: 'Thiruvananthapuram', state: 'Kerala', bbox: [8.40, 76.85, 8.65, 77.10] },
    { name: 'Kovalam', state: 'Kerala', bbox: [8.35, 76.90, 8.50, 77.05] },
    { name: 'Alappuzha', state: 'Kerala', bbox: [9.40, 76.25, 9.60, 76.45] },
    { name: 'Chellanam', state: 'Kerala', bbox: [9.80, 76.20, 9.95, 76.35] },
    { name: 'Kozhikode', state: 'Kerala', bbox: [11.15, 75.70, 11.40, 75.95] },

    // ─── Tamil Nadu ───
    { name: 'Chennai', state: 'Tamil Nadu', bbox: [12.85, 80.10, 13.25, 80.35] },
    { name: 'Pondicherry', state: 'Tamil Nadu', bbox: [11.85, 79.70, 12.05, 79.90] },
    { name: 'Nagapattinam', state: 'Tamil Nadu', bbox: [10.65, 79.75, 10.85, 79.95] },
    { name: 'Tuticorin', state: 'Tamil Nadu', bbox: [8.70, 78.05, 8.90, 78.25] },
    { name: 'Rameswaram', state: 'Tamil Nadu', bbox: [9.22, 79.25, 9.35, 79.45] },
    { name: 'Mahabalipuram', state: 'Tamil Nadu', bbox: [12.55, 80.10, 12.70, 80.25] },
    { name: 'Kanyakumari', state: 'Tamil Nadu', bbox: [8.00, 77.45, 8.15, 77.60] },

    // ─── Andhra Pradesh ───
    { name: 'Visakhapatnam', state: 'Andhra Pradesh', bbox: [17.55, 83.10, 17.85, 83.40] },
    { name: 'Kakinada', state: 'Andhra Pradesh', bbox: [16.90, 82.15, 17.10, 82.35] },
    { name: 'Machilipatnam', state: 'Andhra Pradesh', bbox: [16.10, 81.05, 16.30, 81.25] },
    { name: 'Nellore', state: 'Andhra Pradesh', bbox: [14.30, 79.90, 14.55, 80.10] },

    // ─── Odisha ───
    { name: 'Puri', state: 'Odisha', bbox: [19.70, 85.70, 19.95, 85.95] },
    { name: 'Paradip', state: 'Odisha', bbox: [20.20, 86.45, 20.45, 86.75] },
    { name: 'Bhubaneswar', state: 'Odisha', bbox: [20.15, 85.70, 20.45, 86.00] },
    { name: 'Gopalpur', state: 'Odisha', bbox: [19.20, 84.85, 19.40, 85.05] },

    // ─── West Bengal ───
    { name: 'Kolkata', state: 'West Bengal', bbox: [22.40, 88.20, 22.70, 88.50] },
    { name: 'Digha', state: 'West Bengal', bbox: [21.55, 87.40, 21.75, 87.65] },
    { name: 'Sundarbans', state: 'West Bengal', bbox: [21.50, 88.00, 22.10, 89.10] },
    { name: 'Sagar Island', state: 'West Bengal', bbox: [21.55, 88.00, 21.80, 88.20] },

    // ─── Andaman & Nicobar ───
    { name: 'Port Blair', state: 'Andaman & Nicobar', bbox: [11.55, 92.60, 11.80, 92.85] },
    { name: 'Havelock', state: 'Andaman & Nicobar', bbox: [11.90, 92.85, 12.10, 93.05] },
    { name: 'Car Nicobar', state: 'Andaman & Nicobar', bbox: [9.05, 92.65, 9.30, 92.90] },

    // ─── Lakshadweep ───
    { name: 'Kavaratti', state: 'Lakshadweep', bbox: [10.50, 72.55, 10.65, 72.70] },

    // ─── State-wide coastal regions ───
    { name: 'Gujarat Coast', state: 'Gujarat', bbox: [20.00, 68.30, 24.00, 73.00] },
    { name: 'Maharashtra Coast', state: 'Maharashtra', bbox: [15.70, 72.60, 20.00, 74.00] },
    { name: 'Karnataka Coast', state: 'Karnataka', bbox: [12.70, 74.00, 15.00, 75.00] },
    { name: 'Kerala Coast', state: 'Kerala', bbox: [8.20, 75.50, 12.80, 77.20] },
    { name: 'Tamil Nadu Coast', state: 'Tamil Nadu', bbox: [8.00, 77.40, 13.50, 80.50] },
    { name: 'Andhra Pradesh Coast', state: 'Andhra Pradesh', bbox: [14.00, 79.80, 18.00, 83.50] },
    { name: 'Odisha Coast', state: 'Odisha', bbox: [19.00, 84.50, 21.50, 87.50] },
    { name: 'West Bengal Coast', state: 'West Bengal', bbox: [21.40, 86.50, 22.50, 89.20] },
];

/**
 * Find a region by name (case-insensitive fuzzy match).
 * Returns the best match or null.
 */
export function findRegion(query: string): RegionEntry | null {
    if (!query || query.trim().length === 0) return null;

    const q = query.trim().toLowerCase();

    // Exact match first
    const exact = INDIAN_COASTAL_REGIONS.find(
        r => r.name.toLowerCase() === q || r.state.toLowerCase() === q
    );
    if (exact) return exact;

    // Starts-with match
    const startsWith = INDIAN_COASTAL_REGIONS.find(
        r => r.name.toLowerCase().startsWith(q) || r.state.toLowerCase().startsWith(q)
    );
    if (startsWith) return startsWith;

    // Contains match
    const contains = INDIAN_COASTAL_REGIONS.find(
        r => r.name.toLowerCase().includes(q) || r.state.toLowerCase().includes(q)
    );
    return contains || null;
}

/**
 * Search regions — returns all matches for autocomplete.
 */
export function searchRegions(query: string, maxResults = 8): RegionEntry[] {
    if (!query || query.trim().length === 0) return [];

    const q = query.trim().toLowerCase();

    return INDIAN_COASTAL_REGIONS
        .filter(r =>
            r.name.toLowerCase().includes(q) ||
            r.state.toLowerCase().includes(q)
        )
        .slice(0, maxResults);
}

/**
 * Check if a point (lat, lng) falls within a bounding box (with optional margin).
 */
export function isPointInBbox(
    lat: number,
    lng: number,
    bbox: [number, number, number, number],
    margin = 0.5
): boolean {
    const [south, west, north, east] = bbox;
    return (
        lat >= south - margin &&
        lat <= north + margin &&
        lng >= west - margin &&
        lng <= east + margin
    );
}
