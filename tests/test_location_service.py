import pytest
from app.services.location import LocationService

def test_calculate_distance():
    # Example coordinates: SP to RJ (roughly 350-400km)
    # Actually let's use small known distance.
    # 0,0 to 0,1 longitude is ~111.3km
    dist = LocationService.calculate_distance(0, 0, 0, 1)
    assert 111000 < dist < 112000

    # Distance to itself should be 0
    assert LocationService.calculate_distance(-23.550520, -46.633308, -23.550520, -46.633308) == 0.0

def test_get_geohash():
    gh = LocationService.get_geohash(42.6, -5.6, precision=5)
    assert gh == "ezs42"

def test_get_bounding_geohashes():
    # For a radius of 5000m (5km), we want geohashes that cover this area.
    # The bounding hashes should return 9 neighbors at precision 4 to safely cover it.
    hashes = LocationService.get_bounding_geohashes(42.6, -5.6, radius_m=5000)

    assert isinstance(hashes, list)
    assert len(hashes) == 9
    # Center geohash at precision 4 for (42.6, -5.6)
    gh_4 = LocationService.get_geohash(42.6, -5.6, precision=4)
    assert gh_4 in hashes # The center itself should be in it
