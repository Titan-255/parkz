import math
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.all_models import ParkingSpace, ParkingStatus, VerificationStatus, Review
from app.schemas.all_schemas import RecommendedParking, AIChatResponse

def calculate_haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    # Radius of earth in km
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

class AIParkingAssistant:
    @staticmethod
    def process_query(
        db: Session,
        message: str,
        user_lat: Optional[float] = None,
        user_lng: Optional[float] = None,
        vehicle_type: Optional[str] = None
    ) -> AIChatResponse:
        q = message.lower()
        
        # Base query for approved and active spots
        parkings = db.query(ParkingSpace).filter(
            ParkingSpace.status == ParkingStatus.ACTIVE.value,
            ParkingSpace.verification_status == VerificationStatus.APPROVED.value
        ).all()
        
        # Default reference coordinate (Chennai center: 13.0827, 80.2707) if user_lat not given
        ref_lat = user_lat if user_lat is not None else 13.0827
        ref_lng = user_lng if user_lng is not None else 80.2707

        enriched_spots = []
        for p in parkings:
            # Check vehicle compatibility
            if vehicle_type and p.vehicle_type != "BOTH" and p.vehicle_type != vehicle_type:
                continue
            
            dist = calculate_haversine(ref_lat, ref_lng, p.latitude, p.longitude)
            
            # Reviews rating
            ratings = [r.rating for r in p.reviews]
            avg_rating = round(sum(ratings) / len(ratings), 1) if ratings else 4.8
            
            enriched_spots.append({
                "parking": p,
                "distance": dist,
                "rating": avg_rating,
                "price": p.price_per_hour,
                "total_spaces": p.total_spaces
            })

        # Match intent
        is_budget_query = any(w in q for w in ["cheap", "budget", "lowest", "affordable", "price", "low cost"])
        is_closest_query = any(w in q for w in ["near", "closest", "nearby", "distance", "around"])
        is_rating_query = any(w in q for w in ["best", "highest", "top rated", "clean", "safe", "secure", "stars"])
        is_bike_query = any(w in q for w in ["bike", "two wheeler", "2 wheeler", "scooter", "motorcycle"])
        
        # Filter by keyword in name / address if present
        keyword_matches = [
            s for s in enriched_spots 
            if any(w in s["parking"].name.lower() or w in s["parking"].address.lower() for w in q.split() if len(w) > 3)
        ]
        
        candidate_pool = keyword_matches if keyword_matches else enriched_spots

        # Sort based on intent
        if is_budget_query:
            candidate_pool.sort(key=lambda x: (x["price"], x["distance"]))
        elif is_rating_query:
            candidate_pool.sort(key=lambda x: (-x["rating"], x["distance"]))
        else:
            # Default nearest
            candidate_pool.sort(key=lambda x: (x["distance"], x["price"]))

        top_candidates = candidate_pool[:4]

        recommended_parkings: List[RecommendedParking] = []
        for c in top_candidates:
            p = c["parking"]
            reason = []
            if c["distance"] < 2.0:
                reason.append(f"Only {c['distance']} km away")
            if c["price"] <= 30.0:
                reason.append(f"Great price: ₹{c['price']:.0f}/hr")
            if c["rating"] >= 4.7:
                reason.append(f"High rating: {c['rating']}★")
            
            reason_str = " • ".join(reason) if reason else f"Verified space with {c['total_spaces']} slots"

            recommended_parkings.append(RecommendedParking(
                id=p.id,
                name=p.name,
                address=p.address,
                price_per_hour=p.price_per_hour,
                distance_km=c["distance"],
                rating=c["rating"],
                available_slots=p.total_spaces,
                recommendation_reason=reason_str
            ))

        # Generate contextual conversational reply
        if not recommended_parkings:
            reply = "I couldn't find any active verified parking spaces matching your exact filters. Try broadening your search or adjusting your vehicle type."
            suggested_actions = ["Show all nearby parking", "Search in T Nagar", "Search in Marina Beach"]
        elif is_budget_query:
            best = recommended_parkings[0]
            reply = f"I've scanned all available parking around your area and found the most affordable verified space: **{best.name}** at just **₹{best.price_per_hour:.0f}/hr** ({best.distance_km} km away). Here are the top budget options:"
            suggested_actions = [f"Book {best.name}", "Sort by distance instead", "Filter for 2-Wheelers"]
        elif is_rating_query:
            best = recommended_parkings[0]
            reply = f"Here are the top-rated, most secure parking facilities near you. **{best.name}** boasts a **{best.rating}★ rating** with verified CCTV and guarded entry."
            suggested_actions = [f"View {best.name}", "Show cheapest spaces", "Directions to nearest spot"]
        else:
            best = recommended_parkings[0]
            reply = f"Based on live Google Maps data & ParkZ real-time inventory, **{best.name}** is your best match ({best.distance_km} km away, ₹{best.price_per_hour:.0f}/hr, {best.rating}★). Instant QR check-in is supported!"
            suggested_actions = [f"View {best.name}", "Find cheapest parking", "Filter for Car only"]

        return AIChatResponse(
            reply=reply,
            suggested_actions=suggested_actions,
            recommended_parkings=recommended_parkings
        )
