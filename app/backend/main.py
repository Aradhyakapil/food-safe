import logging
from fastapi import FastAPI, HTTPException, Depends, File, UploadFile, Form, Header
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from datetime import datetime
import os
from supabase import create_client, Client
import shutil
import aiofiles
from fastapi.security import OAuth2PasswordBearer

# Import your models (ensure these are defined in your project)
from app.backend.models import (
    User, Business, Inspection, HygieneRating, LabReport, Certification, 
    TeamMember, FacilityPhoto, Review, ManufacturingDetails, BatchProductionDetails, 
    RawMaterialSupplier, PackagingCompliance
)

# Import the auth router from your auth module
from app.backend import auth

# Create the FastAPI app
app = FastAPI()

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# (Optional) Create a Supabase client if needed for business routes.
supabase: Client = create_client(
    "https://fpeivhlljqryxemvdmvm.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwZWl2aGxsanFyeXhlbXZkbXZtIiwicm9sZSIsImlhdCI6MTczODMwMjg5MiwiZXhwIjoyMDUzODc4ODkyfQ.c5MNo3xhtA-hEzJa02nW23c6-opzVZZRcN7fKCRtIM8"
)

# Helper function to upload a file to Supabase storage and get its URL
async def upload_file(file: UploadFile, file_name: str) -> str:
    try:
        # Create uploads directory if it doesn't exist
        upload_dir = "uploads"
        os.makedirs(upload_dir, exist_ok=True)

        file_path = os.path.join(upload_dir, file_name)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Upload file to Supabase storage
        with open(file_path, "rb") as f:
            supabase.storage.from_("food-safety-files").upload(f"uploads/{file_name}", f)

        # Get public URL
        file_url = supabase.storage.from_("food-safety-files").get_public_url(file_name)
        
        # Remove local file
        os.remove(file_path)
        
        return file_url
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ------------------- Include Auth Router -------------------
# This will mount your auth endpoints at /auth (e.g. /auth/signup, /auth/login, etc.)
app.include_router(auth.router, prefix="/auth")

# ------------------- Business and Other Routes -------------------
@app.post("/business/onboard")
async def onboard_business(
    business_name: str = Form(...),
    address: str = Form(...),
    phone: str = Form(...),
    email: str = Form(...),
    license_number: str = Form(...),
    business_type: str = Form(...),
    fssai_license: str = Form(...),
    owner_name: str = Form(...),
    trade_license: str = Form(...),
    gst_number: str = Form(...),
    fire_safety_cert: str = Form(...),
    liquor_license: Optional[str] = Form(None),
    music_license: Optional[str] = Form(None),
    business_logo: UploadFile = File(...),
    owner_photo: UploadFile = File(...),
    team_member_names: str = Form(...),
    team_member_roles: str = Form(...),
    team_member_photos: List[UploadFile] = File(...),
    facility_photo_area_names: str = Form(...),
    facility_photos: List[UploadFile] = File(...),
    current_user: User = Depends(auth.get_current_user)
):
    try:
        logger.info(f"Received onboarding request for business: {business_name}")
        logger.info(f"Current user: {current_user}")

        # Validate input data
        if not business_name or not address or not phone or not email or not fssai_license:
            raise HTTPException(status_code=400, detail="Missing required fields")

        # 1. Upload Business Logo and Owner Photo
        logo_name = f"business_{fssai_license}_logo.{business_logo.filename.split('.')[-1]}"
        owner_photo_name = f"business_{fssai_license}_owner.{owner_photo.filename.split('.')[-1]}"
        logo_url = await upload_file(business_logo, logo_name)
        owner_photo_url = await upload_file(owner_photo, owner_photo_name)

        # 2. Create business entry
        business_data = {
            "name": business_name,
            "address": address,
            "phone": phone,
            "email": email,
            "license_number": license_number,
            "business_type": business_type,
            "owner_id": current_user.id,
            "owner_name": owner_name,
            "owner_photo_url": owner_photo_url,
            "logo_url": logo_url,
            "trade_license": trade_license,
            "gst_number": gst_number,
            "fire_safety_cert": fire_safety_cert,
            "liquor_license": liquor_license,
            "music_license": music_license,
        }
        new_business = await supabase.table("businesses").insert(business_data).execute()
        if not new_business.data:
            raise HTTPException(status_code=500, detail="Failed to create business")
        business_id = new_business.data[0]['id']

        # 3. Handle team members
        team_names = team_member_names.split(",")
        team_roles = team_member_roles.split(",")

        if len(team_names) != len(team_roles) or len(team_names) != len(team_member_photos):
            raise HTTPException(status_code=400, detail="Mismatched team member data.")

        for i in range(len(team_names)):
            photo_name = f"business_{business_id}_team_{i}.{team_member_photos[i].filename.split('.')[-1]}"
            photo_url = await upload_file(team_member_photos[i], photo_name)
            team_member_data = {
                "business_id": business_id,
                "name": team_names[i].strip(),
                "role": team_roles[i].strip(),
                "photo_url": photo_url,
            }
            team_member_insert = await supabase.table("team_members").insert(team_member_data).execute()
            if not team_member_insert.data:
                raise HTTPException(status_code=500, detail=f"Failed to insert team member {i}")

        # 4. Handle facility photos
        facility_photo_area_names_list = facility_photo_area_names.split(",")
        if len(facility_photos) != len(facility_photo_area_names_list):
            raise HTTPException(status_code=400, detail="Mismatched number of facility photos and area names.")

        for i, facility_photo in enumerate(facility_photos):
            photo_name = f"business_{business_id}_facility_{i}.{facility_photo.filename.split('.')[-1]}"
            photo_url = await upload_file(facility_photo, photo_name)
            facility_photo_data = {
                "business_id": business_id,
                "area_name": facility_photo_area_names_list[i].strip(),
                "photo_url": photo_url,
            }
            facility_photo_insert = await supabase.table("facility_photos").insert(facility_photo_data).execute()
            if not facility_photo_insert.data:
                raise HTTPException(status_code=500, detail=f"Failed to insert facility photo {i}")

        logger.info(f"Business onboarding successful for: {business_name}")
        return {"message": "Business onboarded successfully", "business_id": business_id}

    except HTTPException as http_ex:
        logger.error(f"HTTP Exception during onboarding: {http_ex.detail}")
        raise http_ex
    except Exception as e:
        logger.error(f"Unexpected error during onboarding: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

# ... [Keep the rest of your business, inspection, lab report, certification, etc. routes unchanged] ...

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
