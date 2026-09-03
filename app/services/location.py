import math
import pygeohash as pgh
from typing import List

class LocationService:
    @staticmethod
    def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Calculate the great circle distance in meters between two points
        on the earth (specified in decimal degrees) using the haversine formula.
        """
        R = 6371e3  # Radius of earth in meters
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lon2 - lon1)

        a = math.sin(delta_phi / 2.0) ** 2 + \
            math.cos(phi1) * math.cos(phi2) * \
            math.sin(delta_lambda / 2.0) ** 2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

        return R * c

    @staticmethod
    def get_geohash(lat: float, lon: float, precision: int = 5) -> str:
        """
        Return the geohash string for the given latitude and longitude.
        """
        return pgh.encode(lat, lon, precision=precision)

    @staticmethod
    def get_bounding_geohashes(lat: float, lon: float, radius_m: float) -> List[str]:
        """
        Return a list of geohashes (the center and its 8 neighbors) that cover
        the area of the given radius around the latitude and longitude.
        This calculates an appropriate precision based on the radius.
        """
        # Determine appropriate precision
        # Approx bounding box size by geohash precision:
        # Precision 1: 5009.4km x 4992.6km
        # Precision 2: 1252.3km x 624.1km
        # Precision 3: 156.5km x 156km
        # Precision 4: 39.1km x 19.5km
        # Precision 5: 4.9km x 4.9km
        # Precision 6: 1.2km x 0.61km
        # Precision 7: 152.9m x 152.4m
        # For simplicity, if radius <= 5000, we'll use precision 5, etc.
        # But wait, in the test we hardcoded for a 5000m test we want precision 5.

        # We need the geohash cell dimension to be strictly greater than the radius
        # so that a 3x3 grid centered at the point covers the entire search circle.
        # Geohash dimensions (approx width x height at equator):
        # Precision 1: 5009.4km x 4992.6km
        # Precision 2: 1252.3km x 624.1km
        # Precision 3: 156.5km x 156km
        # Precision 4: 39.1km x 19.5km
        # Precision 5: 4.9km x 4.9km
        # Precision 6: 1.2km x 0.61km
        # Precision 7: 152.9m x 152.4m
        # For a 5000m radius, a 3x3 grid of precision 5 cells (each 4.9x4.9km) will not
        # safely cover it. The 3x3 grid is 14.7x14.7km, but if the point is at the very
        # edge of the center cell, the bounding box edge is only ~4.9km away, which is <5km.
        # So we must use precision 4 for a 5km radius.
        if radius_m <= 150:
            precision = 7
        elif radius_m <= 610:
            precision = 6
        elif radius_m <= 4900:
            precision = 5
        elif radius_m <= 19500:
            precision = 4
        elif radius_m <= 156000:
            precision = 3
        else:
            precision = 2

        center_geohash = pgh.encode(lat, lon, precision=precision)

        # Get neighbors
        # get_adjacent is only for one direction at a time, pygeohash doesn't seem to have a get_all_neighbors method
        # Let's write one using get_adjacent.
        neighbors = set([center_geohash])

        top = pgh.get_adjacent(center_geohash, direction='top')
        bottom = pgh.get_adjacent(center_geohash, direction='bottom')
        left = pgh.get_adjacent(center_geohash, direction='left')
        right = pgh.get_adjacent(center_geohash, direction='right')

        top_left = pgh.get_adjacent(top, direction='left')
        top_right = pgh.get_adjacent(top, direction='right')
        bottom_left = pgh.get_adjacent(bottom, direction='left')
        bottom_right = pgh.get_adjacent(bottom, direction='right')

        neighbors.update([top, bottom, left, right, top_left, top_right, bottom_left, bottom_right])

        return list(neighbors)
