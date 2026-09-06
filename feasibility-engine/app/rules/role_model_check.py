def evaluate_role_model(density_count: int, district_median: float) -> dict:
    """
    Threshold rule evaluating imitation risk.
    This is a pure deterministic function, deliberately NOT an AI call,
    so its logic is easily auditable.
    
    TODO: Wire up 'district_median' to a real district-level registry 
    (e.g., SCA-reported data or open government registry) when available.
    """
    
    if density_count > district_median:
        return {
            "title": "Role Model Reality Check (Elevated Imitation Risk)",
            "story": f"Local competitor density ({density_count}) exceeds the district median ({district_median}). Many entrepreneurs start this business out of imitation.",
            "keyTakeaway": "Differentiation is critical. Ensure a unique value proposition (e.g., direct-to-consumer sales, lower margins) rather than relying on unmet demand.",
            "monthlyTurnover": "₹85,000 / month (Stagnant due to competition)"
        }
    else:
        return {
            "title": "Role Model Reality Check (Favorable Market)",
            "story": f"Local competitor density ({density_count}) is within or below the district median ({district_median}). The market shows healthy absorption capacity.",
            "keyTakeaway": "Focus on rapid customer acquisition. First-mover or early-entrant advantages are still available in this sector.",
            "monthlyTurnover": "₹1,45,000 / month (Healthy demand)"
        }
