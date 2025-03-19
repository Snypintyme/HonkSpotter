from pydantic import BaseModel

class GooseSighting(BaseModel):
    name: str
    notes: str
    coords: str
    image: str

