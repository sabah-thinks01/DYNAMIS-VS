import json
import google.generativeai as genai
from app.config import settings

def generate_swot_template(business_type: str, density_count: int, role_model_risk: bool) -> dict:
    """
    Template-based synthesizer fallback.
    
    CRITICAL ARCHITECTURE BOUNDARY: 
    The synthesizer (whether LLM or Template) only ever receives structured numeric/rule outputs. 
    It narrates what the rules already determined; it does NOT make decisions itself.
    """
    
    strengths = [f"Standard operational model for {business_type} is well-understood."]
    if density_count < 2:
        strengths.append("Low local competition provides early-entrant advantage.")
        
    weaknesses = ["Requires initial capital expenditure and working capital stabilization."]
    if role_model_risk:
        weaknesses.append(f"High local density ({density_count} nearby) suggests potential price wars.")
        
    opportunities = [
        "Leveraging SCA loan networks for subsidized capital.",
        "Targeting unsaturated pockets in nearby sub-districts."
    ]
    
    threats = ["Weather, seasonal, and supply-chain dependencies."]
    if role_model_risk:
        threats.append("Imitation bias: high risk of market saturation if no differentiation exists.")
        
    return {
        "strengths": strengths,
        "weaknesses": weaknesses,
        "opportunities": opportunities,
        "threats": threats
    }


def generate_swot_gemini(business_type: str, density_count: int, role_model_risk: bool) -> dict:
    """
    Real Gemini synthesis call.
    
    CRITICAL ARCHITECTURE BOUNDARY: 
    The LLM only ever receives structured numeric/rule outputs. 
    It narrates conclusions the deterministic rules already reached — it must never 
    independently judge viability, invent competitor data, or override the threshold rule's conclusion.
    """
    if not settings.GEMINI_API_KEY:
        raise ValueError("Gemini API key is missing.")
        
    genai.configure(api_key=settings.GEMINI_API_KEY)
    
    # We use a standard generative model
    model = genai.GenerativeModel('gemini-3.6-flash')
    
    prompt = f"""
    You are an expert rural business analyst. 
    Generate a SWOT (Strengths, Weaknesses, Opportunities, Threats) analysis for a proposed rural business.
    
    CRITICAL CONSTRAINTS:
    - You must output raw JSON ONLY. No markdown wrappers, no conversational text.
    - JSON schema must match exactly: {{"strengths": [], "weaknesses": [], "opportunities": [], "threats": []}}
    - Each category should have 2-3 concise bullet points as strings.
    - DO NOT invent competitor numbers. Base your analysis on the hard data provided below.
    
    HARD DATA TO NARRATE:
    - Business Type: {business_type}
    - Competitors nearby: {density_count}
    - High Role-Model / Imitation Risk flag: {role_model_risk}
    
    If Role-Model Risk flag is True, you MUST include a weakness/threat about market saturation or imitation bias.
    If Competitors nearby is low (<2), you MUST include a strength/opportunity about early-entrant advantage.
    """
    
    response = model.generate_content(
        prompt,
        generation_config=genai.GenerationConfig(
            response_mime_type="application/json"
        )
    )
    
    try:
        swot_data = json.loads(response.text)
        # Ensure correct keys
        return {
            "strengths": swot_data.get("strengths", []),
            "weaknesses": swot_data.get("weaknesses", []),
            "opportunities": swot_data.get("opportunities", []),
            "threats": swot_data.get("threats", [])
        }
    except json.JSONDecodeError:
        raise ValueError(f"Failed to decode Gemini response as JSON. Response text: {response.text}")
