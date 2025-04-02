import uuid
import random
import datetime
from faker import Faker
from app import db, create_app
from app.models.user import User
from app.models.sightings import Sighting

# Initialize Faker
fake = Faker()
Faker.seed(42)  # For reproducible results


def seed_database():
    """Seed the database with fake data"""
    app = create_app()
    with app.app_context():
        # Clear existing data
        Sighting.query.delete()
        User.query.delete()

        # Create 3 users
        users = create_users()

        # Create goose sightings distributed across users
        create_goose_sightings(users)

        print("Database seeded successfully!")


def create_users():
    """Create 3 test users"""
    users = []

    # Create test1, test2, test3 users
    for i in range(1, 4):
        user = User(
            id=uuid.uuid4(),
            email=f"test{i}@test.com",
            username=f"test{i}",
            description=f"Test user {i} who loves documenting the geese of Kitchener-Waterloo.",
            profile_picture="",
            is_banned=False,
        )
        user.set_password("password123")

        db.session.add(user)
        users.append(user)

    db.session.commit()
    print(f"Created {len(users)} users")
    return users


def create_goose_sightings(users):
    """Create funny goose sightings in the Kitchener-Waterloo area distributed across users"""
    # Kitchener-Waterloo area locations with actual coordinates
    kw_locations = [
        {"name": "Waterloo Park", "lat": 43.4647, "lng": -80.5281},
        {"name": "Victoria Park", "lat": 43.4486, "lng": -80.4940},
        {"name": "Laurel Creek Conservation Area", "lat": 43.4789, "lng": -80.5583},
        {"name": "Grand River (Kitchener)", "lat": 43.4259, "lng": -80.4369},
        {"name": "RIM Park", "lat": 43.5075, "lng": -80.4778},
        {"name": "Columbia Lake", "lat": 43.4747, "lng": -80.5526},
        {"name": "University of Waterloo", "lat": 43.4723, "lng": -80.5449},
        {"name": "Wilfrid Laurier University", "lat": 43.4738, "lng": -80.5275},
        {"name": "Uptown Waterloo", "lat": 43.4649, "lng": -80.5225},
        {"name": "Downtown Kitchener", "lat": 43.4516, "lng": -80.4925},
        {"name": "Bechtel Park", "lat": 43.4975, "lng": -80.4828},
        {"name": "McLennan Park", "lat": 43.4228, "lng": -80.4647},
        {"name": "Breithaupt Park", "lat": 43.4542, "lng": -80.5067},
        {"name": "Huron Natural Area", "lat": 43.3983, "lng": -80.4942},
        {"name": "Kiwanis Park", "lat": 43.4378, "lng": -80.4647},
        {"name": "Conestoga Mall", "lat": 43.5001, "lng": -80.5284},
        {"name": "Fairview Park Mall", "lat": 43.4267, "lng": -80.4428},
        {"name": "Waterloo Town Square", "lat": 43.4639, "lng": -80.5200},
        {"name": "St. Jacobs Farmers' Market", "lat": 43.5144, "lng": -80.5562},
        {"name": "Kitchener City Hall", "lat": 43.4517, "lng": -80.4925},
    ]

    # Funny goose sighting titles
    goose_titles = [
        "Honk if you dare! Angry goose guarding the bridge",
        "Goose Gang taking over the playground",
        "The Goose is Loose! Running after students",
        "Goose with an attitude problem at Victoria Park",
        "Majestic Cobra Chicken spotted near UW campus",
        "Goose family blocking traffic - nobody dares to honk",
        "Goose staring into my soul at Waterloo Park",
        "Entitled goose demanding bread tax from picnickers",
        "Goose asserting dominance over a terrified jogger",
        "Ninja goose appeared out of nowhere and hissed at me",
        "Formal gathering of geese plotting world domination",
        "Goose stealing sandwich from unsuspecting student",
        "Goose and goslings crossing road like they own it",
        "Goose with surprisingly good manners at the pond",
        "Absolute unit of a goose intimidating everyone",
        "Goose sitting on bench like a human",
        "Goose photobombed my graduation pictures",
        "Goose chasing cyclist down the trail",
        "Goose standing perfectly still... menacingly",
        "Two geese having what looked like a serious argument",
    ]

    # Funny goose notes
    goose_notes = [
        "I swear this goose made direct eye contact with me for a full minute before slowly walking away.",
        "The goose was honking so loudly it set off a car alarm nearby.",
        "This goose seemed to be giving directions to the other geese. Definitely the leader.",
        "I've seen this same goose three days in a row. I think it's following me.",
        "The goose was completely unbothered by the crowd of people trying to walk around it.",
        "This goose chased a grown man all the way to his car. Hilarious until it turned on me.",
        "Pretty sure this goose is the reincarnation of my angry former math professor.",
        "The goose was standing on one leg for so long I was genuinely impressed.",
        "This goose had the audacity to hiss at me when I was 20 feet away on MY usual bench.",
        "The goose family had what appeared to be a perfectly organized line formation.",
        "This goose was peacefully coexisting with ducks. Rare diplomatic moment.",
        "The goose was guarding a piece of bread like it was made of gold.",
        "I've named this particular goose 'The Mayor' because it seems to patrol the same area daily.",
        "The goose was swimming in perfect circles, possibly performing some kind of ritual.",
        "This goose somehow managed to look disappointed in my life choices.",
        "The goose had collected a small pile of shiny objects next to it. Goose treasure?",
        "This goose honked to the rhythm of the music playing on my phone. Talented!",
        "The goose was sleeping standing up, which was both impressive and slightly creepy.",
        "This goose appeared to be teaching its goslings how to properly intimidate humans.",
        "The goose was posing perfectly still next to the park sign like an official greeter.",
    ]

    # Create 20 goose sightings distributed across users
    for i in range(20):
        # Get a random location or use index if available
        location = (
            kw_locations[i] if i < len(kw_locations) else random.choice(kw_locations)
        )

        # Add a small random offset to make locations slightly different
        # Even if at the same general area (within ~100m)
        lat_offset = random.uniform(-0.001, 0.001)
        lng_offset = random.uniform(-0.001, 0.001)

        latitude = location["lat"] + lat_offset
        longitude = location["lng"] + lng_offset

        # Format coordinates as string
        coords = f"{latitude},{longitude}"

        # Create a sighting with a random title and notes
        title = (
            goose_titles[i]
            if i < len(goose_titles)
            else f"Goose sighting at {location['name']}"
        )
        notes = goose_notes[i] if i < len(goose_notes) else fake.paragraph()

        # Distribute sightings evenly among users
        user = users[i % len(users)]

        sighting = Sighting(
            id=uuid.uuid4(),
            name=title,
            notes=notes,
            coords=coords,
            image=f"https://wildlife-bucket.s3.amazonaws.com/goose-sightings/{i+1}.jpg",
            user_id=user.id,
            created_date=fake.date_time_between(start_date="-1y", end_date="now"),
        )

        db.session.add(sighting)
        print(f"Created goose sighting: {sighting.name} for user {user.username}")

    db.session.commit()


if __name__ == "__main__":
    seed_database()
