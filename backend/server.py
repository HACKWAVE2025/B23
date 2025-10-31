from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class Site(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    location: str
    coordinates: dict
    year_built: int
    description: str
    thumbnail_url: str
    current_image_url: str
    facts_count: int = 0
    unesco_status: Optional[str] = None
    current_status: str = "Ruins"

class TimelineEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    site_id: str
    year: str
    title: str
    description: str
    event_type: str

class Fact(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    site_id: str
    title: str
    description: str
    icon_type: str = "info"

class Annotation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    site_id: str
    user_name: str
    user_avatar: Optional[str] = None
    badge: Optional[str] = None
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    likes: int = 0

class AnnotationCreate(BaseModel):
    site_id: str
    user_name: str
    content: str

class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    site_id: Optional[str] = None
    user_message: str
    ai_response: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ChatRequest(BaseModel):
    session_id: str
    site_id: Optional[str] = None
    message: str

class ChatResponse(BaseModel):
    response: str
    session_id: str


# Routes
@api_router.get("/")
async def root():
    return {"message": "TimeLeap API v1.0"}


@api_router.get("/sites", response_model=List[Site])
async def get_all_sites():
    """Get all historical sites"""
    sites = await db.sites.find().to_list(100)
    return [Site(**site) for site in sites]


@api_router.get("/sites/{site_id}", response_model=Site)
async def get_site(site_id: str):
    """Get specific site details"""
    site = await db.sites.find_one({"id": site_id})
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    return Site(**site)


@api_router.get("/sites/{site_id}/timeline", response_model=List[TimelineEvent])
async def get_site_timeline(site_id: str):
    """Get timeline events for a specific site"""
    events = await db.timeline_events.find({"site_id": site_id}).to_list(100)
    return [TimelineEvent(**event) for event in events]


@api_router.get("/sites/{site_id}/facts", response_model=List[Fact])
async def get_site_facts(site_id: str):
    """Get facts for a specific site"""
    facts = await db.facts.find({"site_id": site_id}).to_list(100)
    return [Fact(**fact) for fact in facts]


@api_router.get("/sites/{site_id}/annotations", response_model=List[Annotation])
async def get_site_annotations(site_id: str):
    """Get annotations for a specific site"""
    annotations = await db.annotations.find({"site_id": site_id}).sort("timestamp", -1).to_list(100)
    return [Annotation(**annotation) for annotation in annotations]


@api_router.post("/sites/{site_id}/annotations", response_model=Annotation)
async def create_annotation(site_id: str, annotation_data: AnnotationCreate):
    """Create a new annotation"""
    annotation = Annotation(
        site_id=site_id,
        user_name=annotation_data.user_name,
        content=annotation_data.content
    )
    await db.annotations.insert_one(annotation.dict())
    return annotation


@api_router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest):
    """Chat with AI about historical monuments using Gemini"""
    try:
        # Get site context if site_id provided
        site_context = ""
        if request.site_id:
            site = await db.sites.find_one({"id": request.site_id})
            if site:
                site_context = f"\nCurrent monument context: {site['name']} at {site['location']}, built in {site['year_built']}. {site['description']}"
        
        # Initialize Gemini chat with historical context
        chat = LlmChat(
            api_key=os.environ['EMERGENT_LLM_KEY'],
            session_id=request.session_id,
            system_message=f"You are a knowledgeable historian and archaeologist specializing in ancient monuments and historical sites. Provide detailed, accurate, and engaging information about historical monuments, their architecture, cultural significance, and historical context.{site_context}"
        ).with_model("gemini", "gemini-2.0-flash")
        
        # Send message to Gemini
        user_message = UserMessage(text=request.message)
        response = await chat.send_message(user_message)
        
        # Store chat history
        chat_record = ChatMessage(
            session_id=request.session_id,
            site_id=request.site_id,
            user_message=request.message,
            ai_response=response
        )
        await db.chat_history.insert_one(chat_record.dict())
        
        return ChatResponse(response=response, session_id=request.session_id)
    
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chat service error: {str(e)}")


@api_router.get("/chat/history/{session_id}", response_model=List[ChatMessage])
async def get_chat_history(session_id: str):
    """Get chat history for a session"""
    history = await db.chat_history.find({"session_id": session_id}).sort("timestamp", 1).to_list(100)
    return [ChatMessage(**msg) for msg in history]


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


# Seed initial data on startup
@app.on_event("startup")
async def seed_data():
    """Seed initial data if database is empty"""
    existing_sites = await db.sites.count_documents({})
    if existing_sites == 0:
        # Seed Hampi site
        hampi_site = Site(
            id="hampi_virupaksha",
            name="Virupaksha Temple",
            location="Hampi, Karnataka, India",
            coordinates={"lat": 15.335, "lng": 76.462},
            year_built=1442,
            description="The Virupaksha Temple at Hampi is a magnificent example of Vijayanagara architecture. Built in 1442 CE, it stands as a testament to the grandeur of the Vijayanagara Empire. The temple complex features intricate stone carvings, towering gopurams, and sacred water features.",
            thumbnail_url="https://images.unsplash.com/photo-1684830234907-566d87378287?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwxfHxIYW1waSUyMHJ1aW5zfGVufDB8fHx8MTc2MTkwNDQxN3ww&ixlib=rb-4.1.0&q=85",
            current_image_url="https://images.unsplash.com/photo-1633942161781-6b59b979d763?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwzfHxIYW1waSUyMHJ1aW5zfGVufDB8fHx8MTc2MTkwNDQxN3ww&ixlib=rb-4.1.0&q=85",
            facts_count=8,
            unesco_status="World Heritage Site (1986)",
            current_status="Active Conservation"
        )
        await db.sites.insert_one(hampi_site.dict())
        
        # Seed Nalanda site
        nalanda_site = Site(
            id="nalanda_university",
            name="Nalanda University Ruins",
            location="Nalanda, Bihar, India",
            coordinates={"lat": 25.135, "lng": 85.444},
            year_built=427,
            description="Nalanda was an ancient center of higher learning from 427 CE to 1197 CE. One of the world's first residential universities, it attracted scholars from across Asia.",
            thumbnail_url="https://images.unsplash.com/photo-1572461274864-191affced839?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwyfHxIYW1waSUyMHJ1aW5zfGVufDB8fHx8MTc2MTkwNDQxN3ww&ixlib=rb-4.1.0&q=85",
            current_image_url="https://images.unsplash.com/photo-1572461274864-191affced839?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwyfHxIYW1waSUyMHJ1aW5zfGVufDB8fHx8MTc2MTkwNDQxN3ww&ixlib=rb-4.1.0&q=85",
            facts_count=6,
            unesco_status="World Heritage Site (2016)",
            current_status="Archaeological Site"
        )
        await db.sites.insert_one(nalanda_site.dict())
        
        # Seed Golconda site
        golconda_site = Site(
            id="golconda_fort",
            name="Golconda Fort",
            location="Hyderabad, Telangana, India",
            coordinates={"lat": 17.383, "lng": 78.401},
            year_built=1518,
            description="Golconda Fort was the capital of the medieval sultanate of the Qutb Shahi dynasty. Famous for its acoustic system and diamond trade.",
            thumbnail_url="https://images.unsplash.com/photo-1623473882999-2f33d6fc1d09?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwxfHxhbmNpZW50JTIwdGVtcGxlfGVufDB8fHx8MTc2MTkwNDQyNHww&ixlib=rb-4.1.0&q=85",
            current_image_url="https://images.unsplash.com/photo-1623473882999-2f33d6fc1d09?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwxfHxhbmNpZW50JTIwdGVtcGxlfGVufDB8fHx8MTc2MTkwNDQyNHww&ixlib=rb-4.1.0&q=85",
            facts_count=7,
            unesco_status="UNESCO Tentative List",
            current_status="Protected Monument"
        )
        await db.sites.insert_one(golconda_site.dict())
        
        # Seed timeline for Hampi
        timeline_events = [
            TimelineEvent(id=str(uuid.uuid4()), site_id="hampi_virupaksha", year="1336", title="Vijayanagara Empire Founded", description="The Vijayanagara Empire was established, marking the beginning of a golden era", event_type="founding"),
            TimelineEvent(id=str(uuid.uuid4()), site_id="hampi_virupaksha", year="1442", title="Virupaksha Temple Reconstructed", description="Major reconstruction and expansion of the temple complex", event_type="construction"),
            TimelineEvent(id=str(uuid.uuid4()), site_id="hampi_virupaksha", year="1500s", title="Capital at Peak: 500,000 Residents", description="Hampi reaches its zenith as one of the world's largest cities", event_type="prosperity"),
            TimelineEvent(id=str(uuid.uuid4()), site_id="hampi_virupaksha", year="1565", title="Battle of Talikota (Destruction Begins)", description="Devastating defeat leads to the city's abandonment and ruin", event_type="conflict"),
            TimelineEvent(id=str(uuid.uuid4()), site_id="hampi_virupaksha", year="1600s-1800s", title="Gradual Ruin and Abandonment", description="Centuries of neglect and natural weathering", event_type="decline"),
            TimelineEvent(id=str(uuid.uuid4()), site_id="hampi_virupaksha", year="1856", title="Rediscovered by British Surveyor", description="Colin Mackenzie documents the ruins for the first time", event_type="discovery"),
            TimelineEvent(id=str(uuid.uuid4()), site_id="hampi_virupaksha", year="1976", title="Declared Protected Monuments Zone", description="Indian government begins conservation efforts", event_type="conservation"),
            TimelineEvent(id=str(uuid.uuid4()), site_id="hampi_virupaksha", year="1986", title="UNESCO World Heritage Site", description="International recognition and protection status", event_type="recognition"),
            TimelineEvent(id=str(uuid.uuid4()), site_id="hampi_virupaksha", year="2024", title="Ongoing Restoration", description="Active conservation and archaeological research continues", event_type="present")
        ]
        for event in timeline_events:
            await db.timeline_events.insert_one(event.dict())
        
        # Seed facts for Hampi
        facts = [
            Fact(id=str(uuid.uuid4()), site_id="hampi_virupaksha", title="Consecrated in 1442 CE", description="The temple was formally consecrated during the reign of Devaraya II", icon_type="calendar"),
            Fact(id=str(uuid.uuid4()), site_id="hampi_virupaksha", title="500+ Years of Continuous Worship", description="The temple remains an active place of Hindu worship despite the ruins", icon_type="worship"),
            Fact(id=str(uuid.uuid4()), site_id="hampi_virupaksha", title="Intricate Stone Carvings", description="Every surface features detailed sculptures depicting mythological scenes", icon_type="art"),
            Fact(id=str(uuid.uuid4()), site_id="hampi_virupaksha", title="10,000+ Architectural Features", description="The complex contains thousands of carved pillars, sculptures, and structures", icon_type="architecture"),
            Fact(id=str(uuid.uuid4()), site_id="hampi_virupaksha", title="Sacred Pilgrimage Site", description="Attracts millions of Hindu pilgrims annually from across the world", icon_type="pilgrimage"),
            Fact(id=str(uuid.uuid4()), site_id="hampi_virupaksha", title="Survived 3 Major Wars", description="The temple withstood multiple conflicts including the Battle of Talikota", icon_type="history"),
            Fact(id=str(uuid.uuid4()), site_id="hampi_virupaksha", title="50m Tall Gopuram Tower", description="The main entrance tower stands as a landmark visible for kilometers", icon_type="structure"),
            Fact(id=str(uuid.uuid4()), site_id="hampi_virupaksha", title="Underground Water Channels", description="Advanced hydraulic systems supplied water throughout the complex", icon_type="engineering")
        ]
        for fact in facts:
            await db.facts.insert_one(fact.dict())
        
        # Seed sample annotations
        annotations = [
            Annotation(id=str(uuid.uuid4()), site_id="hampi_virupaksha", user_name="Dr. Rajesh Kumar", badge="Verified Historian", content="The acoustic engineering of this temple is remarkable. The clapping sound at the entrance echoes precisely seven times throughout the hall.", likes=24, timestamp=datetime(2024, 11, 15, 10, 30)),
            Annotation(id=str(uuid.uuid4()), site_id="hampi_virupaksha", user_name="Prof. Sarah Chen", badge="Archaeologist", content="Recent excavations revealed a previously unknown water filtration system beneath the temple complex. The engineering sophistication is astounding.", likes=18, timestamp=datetime(2024, 11, 20, 14, 45)),
            Annotation(id=str(uuid.uuid4()), site_id="hampi_virupaksha", user_name="Arjun Menon", content="Visited during sunrise - the golden light hitting the gopuram is absolutely breathtaking. The restoration work is progressing beautifully.", likes=12, timestamp=datetime(2024, 12, 1, 8, 15))
        ]
        for annotation in annotations:
            await db.annotations.insert_one(annotation.dict())
        
        logger.info("Initial data seeded successfully")