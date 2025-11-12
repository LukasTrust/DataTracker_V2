"""
Test script for flexible number parsing functionality.
Tests the new parse_flexible_float function.
"""

import sys
sys.path.insert(0, '/home/lukas/VS-Code/DataTracker_V2')

from backend.utils import parse_flexible_float


def test_parse_flexible_float():
    """Test the flexible float parsing function."""
    
    test_cases = [
        # (input, expected_output, description)
        ("1.50", 1.5, "English format with dot"),
        ("1,50", 1.5, "German format with comma"),
        ("1234.56", 1234.56, "Larger number with dot"),
        ("1234,56", 1234.56, "Larger number with comma"),
        (" 42.00 ", 42.0, "With whitespace and dot"),
        (" 42,00 ", 42.0, "With whitespace and comma"),
        ("0.99", 0.99, "Decimal less than 1 with dot"),
        ("0,99", 0.99, "Decimal less than 1 with comma"),
        ("100", 100.0, "Integer without decimal"),
        ("0", 0.0, "Zero"),
        ("0.0", 0.0, "Zero with decimal dot"),
        ("0,0", 0.0, "Zero with decimal comma"),
    ]
    
    print("Testing parse_flexible_float function:")
    print("=" * 60)
    
    passed = 0
    failed = 0
    
    for input_val, expected, description in test_cases:
        try:
            result = parse_flexible_float(input_val)
            if result == expected:
                print(f"✓ PASS: {description}")
                print(f"  Input: '{input_val}' -> Output: {result}")
                passed += 1
            else:
                print(f"✗ FAIL: {description}")
                print(f"  Input: '{input_val}' -> Expected: {expected}, Got: {result}")
                failed += 1
        except Exception as e:
            print(f"✗ ERROR: {description}")
            print(f"  Input: '{input_val}' -> Exception: {e}")
            failed += 1
        print()
    
    # Test error cases
    print("\nTesting error cases:")
    print("=" * 60)
    
    error_cases = [
        ("", "Empty string"),
        ("   ", "Only whitespace"),
        ("abc", "Invalid characters"),
        (None, "None value"),
        ("12.34.56", "Multiple dots"),
    ]
    
    for input_val, description in error_cases:
        try:
            result = parse_flexible_float(input_val)
            print(f"✗ FAIL: {description} should raise ValueError")
            print(f"  Input: '{input_val}' -> Got: {result}")
            failed += 1
        except ValueError as e:
            print(f"✓ PASS: {description} raised ValueError")
            print(f"  Input: '{input_val}' -> Error: {e}")
            passed += 1
        except Exception as e:
            print(f"✗ FAIL: {description} raised wrong exception")
            print(f"  Input: '{input_val}' -> Exception: {type(e).__name__}: {e}")
            failed += 1
        print()
    
    # Summary
    print("\n" + "=" * 60)
    print(f"Test Summary: {passed} passed, {failed} failed")
    print("=" * 60)
    
    return failed == 0


if __name__ == "__main__":
    success = test_parse_flexible_float()
    sys.exit(0 if success else 1)
