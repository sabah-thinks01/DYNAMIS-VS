from app.rules.role_model_check import evaluate_role_model

def test_role_model_check_elevated_risk():
    """Test boundary where local density > district median"""
    result = evaluate_role_model(density_count=5, district_median=3.0)
    
    assert "Elevated" in result["title"]
    assert "exceeds the district median" in result["story"]
    assert "Differentiation is critical" in result["keyTakeaway"]

def test_role_model_check_at_median():
    """Test boundary where local density == district median"""
    result = evaluate_role_model(density_count=3, district_median=3.0)
    
    assert "Favorable" in result["title"]
    assert "is within or below" in result["story"]

def test_role_model_check_below_median():
    """Test boundary where local density < district median"""
    result = evaluate_role_model(density_count=1, district_median=4.5)
    
    assert "Favorable" in result["title"]
    assert "is within or below" in result["story"]
