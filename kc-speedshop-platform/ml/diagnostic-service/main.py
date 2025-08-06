"""
KC Speedshop ML Diagnostic Service
FastAPI-based service for automotive diagnostics with X.AI integration
"""

import os
import json
import asyncio
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
import httpx
import numpy as np
import pandas as pd
import tensorflow as tf
from sklearn.preprocessing import StandardScaler
import uvicorn

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Pydantic models
class DiagnosticRequest(BaseModel):
    vehicle_id: str = Field(..., description="Unique vehicle identifier")
    vin: str = Field(..., description="Vehicle Identification Number")
    obd_data: Dict[str, Any] = Field(..., description="OBD2 diagnostic data")
    symptoms: List[str] = Field(default=[], description="Reported symptoms")
    make: str = Field(..., description="Vehicle make")
    model: str = Field(..., description="Vehicle model")
    year: int = Field(..., ge=1980, le=2030, description="Vehicle year")
    mileage: Optional[int] = Field(None, description="Vehicle mileage")

class DiagnosticResult(BaseModel):
    vehicle_id: str
    diagnosis_id: str
    timestamp: datetime
    primary_issues: List[Dict[str, Any]]
    recommendations: List[Dict[str, Any]]
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    estimated_cost: Optional[Dict[str, float]] = None
    urgency_level: str = Field(..., regex="^(low|medium|high|critical)$")
    ai_analysis: Optional[str] = None
    next_maintenance: Optional[datetime] = None

class HealthCheck(BaseModel):
    status: str
    timestamp: datetime
    version: str
    uptime: float

# Global variables for ML models
ml_models = {}
scaler = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize and cleanup resources"""
    # Startup
    logger.info("Starting ML Diagnostic Service...")
    await load_ml_models()
    yield
    # Shutdown
    logger.info("Shutting down ML Diagnostic Service...")

# Initialize FastAPI app
app = FastAPI(
    title="KC Speedshop ML Diagnostic Service",
    description="Advanced automotive diagnostic service with AI-powered analysis",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Security
security = HTTPBearer()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Trusted host middleware
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"])

class DiagnosticServiceManager:
    """Main service manager for ML diagnostics"""
    
    def __init__(self):
        self.xai_api_key = os.getenv("XAI_API_KEY")
        self.rapidapi_key = os.getenv("RAPIDAPI_KEY")
        self.hedera_client = None
        self.startup_time = datetime.utcnow()
        
        if not self.xai_api_key:
            logger.warning("XAI_API_KEY not configured - AI analysis will be limited")
        if not self.rapidapi_key:
            logger.warning("RAPIDAPI_KEY not configured - external data sources unavailable")
    
    async def initialize_hedera_client(self):
        """Initialize Hedera blockchain client for data verification"""
        try:
            # Hedera client initialization would go here
            logger.info("Hedera client initialized")
        except Exception as e:
            logger.error(f"Failed to initialize Hedera client: {e}")
    
    async def analyze_obd_data(self, obd_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze OBD2 data using ML models"""
        try:
            # Convert OBD data to features for ML model
            features = self._extract_features_from_obd(obd_data)
            
            # Predict using loaded ML model
            if 'engine_diagnostics' in ml_models and scaler:
                scaled_features = scaler.transform([features])
                prediction = ml_models['engine_diagnostics'].predict(scaled_features)[0]
                confidence = float(np.max(ml_models['engine_diagnostics'].predict_proba(scaled_features)))
                
                return {
                    'prediction': prediction,
                    'confidence': confidence,
                    'features_analyzed': len(features)
                }
            else:
                # Fallback analysis
                return self._basic_obd_analysis(obd_data)
                
        except Exception as e:
            logger.error(f"Error analyzing OBD data: {e}")
            return self._basic_obd_analysis(obd_data)
    
    def _extract_features_from_obd(self, obd_data: Dict[str, Any]) -> List[float]:
        """Extract numerical features from OBD data"""
        features = []
        
        # Standard OBD-II PIDs
        feature_mappings = {
            'engine_rpm': 'RPM',
            'vehicle_speed': 'SPEED',
            'throttle_position': 'THROTTLE_POS',
            'engine_load': 'ENGINE_LOAD',
            'coolant_temp': 'COOLANT_TEMP',
            'intake_temp': 'INTAKE_TEMP',
            'fuel_pressure': 'FUEL_PRESSURE',
            'maf_airflow': 'MAF',
            'o2_sensor': 'O2_SENSOR'
        }
        
        for key, obd_key in feature_mappings.items():
            value = obd_data.get(obd_key, 0)
            if isinstance(value, (int, float)):
                features.append(float(value))
            else:
                features.append(0.0)
        
        # Ensure we have a fixed number of features
        while len(features) < 20:
            features.append(0.0)
        
        return features[:20]  # Limit to 20 features
    
    def _basic_obd_analysis(self, obd_data: Dict[str, Any]) -> Dict[str, Any]:
        """Basic rule-based OBD analysis as fallback"""
        issues = []
        confidence = 0.7
        
        # Check for common issues
        if obd_data.get('COOLANT_TEMP', 0) > 100:
            issues.append("Engine overheating detected")
        
        if obd_data.get('RPM', 0) > 6000:
            issues.append("High RPM detected")
        
        if obd_data.get('ENGINE_LOAD', 0) > 90:
            issues.append("High engine load")
        
        dtc_codes = obd_data.get('DTC_CODES', [])
        if dtc_codes:
            issues.extend([f"Diagnostic code: {code}" for code in dtc_codes])
        
        return {
            'prediction': 'maintenance_required' if issues else 'normal',
            'confidence': confidence,
            'issues': issues
        }
    
    async def get_xai_analysis(self, diagnostic_data: Dict[str, Any]) -> Optional[str]:
        """Get AI analysis from X.AI Grok"""
        if not self.xai_api_key:
            return None
        
        try:
            prompt = f"""
            Analyze this automotive diagnostic data and provide expert insights:
            
            Vehicle: {diagnostic_data.get('make')} {diagnostic_data.get('model')} {diagnostic_data.get('year')}
            OBD Data: {json.dumps(diagnostic_data.get('obd_data', {}), indent=2)}
            Symptoms: {', '.join(diagnostic_data.get('symptoms', []))}
            
            Please provide:
            1. Likely root causes
            2. Recommended actions
            3. Urgency assessment
            4. Cost estimation range
            """
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.x.ai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.xai_api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "grok-beta",
                        "messages": [
                            {"role": "system", "content": "You are an expert automotive diagnostic technician with 20+ years of experience."},
                            {"role": "user", "content": prompt}
                        ],
                        "max_tokens": 1000,
                        "temperature": 0.3
                    },
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return result['choices'][0]['message']['content']
                else:
                    logger.error(f"X.AI API error: {response.status_code}")
                    return None
                    
        except Exception as e:
            logger.error(f"Error getting X.AI analysis: {e}")
            return None

# Service manager instance
diagnostic_manager = DiagnosticServiceManager()

async def load_ml_models():
    """Load pre-trained ML models"""
    global ml_models, scaler
    
    try:
        # Load models (placeholder - in production, load actual trained models)
        logger.info("Loading ML models...")
        
        # Create a simple model for demonstration
        model = tf.keras.Sequential([
            tf.keras.layers.Dense(64, activation='relu', input_shape=(20,)),
            tf.keras.layers.Dropout(0.3),
            tf.keras.layers.Dense(32, activation='relu'),
            tf.keras.layers.Dense(3, activation='softmax')  # normal, maintenance, critical
        ])
        
        model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
        ml_models['engine_diagnostics'] = model
        
        # Initialize scaler
        scaler = StandardScaler()
        # Fit with dummy data (in production, use real training data)
        dummy_data = np.random.normal(0, 1, (100, 20))
        scaler.fit(dummy_data)
        
        logger.info(f"Loaded {len(ml_models)} ML models successfully")
        
    except Exception as e:
        logger.error(f"Error loading ML models: {e}")

async def verify_auth_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token (placeholder implementation)"""
    # In production, implement proper JWT verification
    if credentials.scheme != "Bearer":
        raise HTTPException(status_code=401, detail="Invalid authentication scheme")
    
    # For now, accept any token
    return credentials.credentials

@app.get("/health", response_model=HealthCheck)
async def health_check():
    """Health check endpoint"""
    uptime = (datetime.utcnow() - diagnostic_manager.startup_time).total_seconds()
    
    return HealthCheck(
        status="healthy",
        timestamp=datetime.utcnow(),
        version="1.0.0",
        uptime=uptime
    )

@app.post("/diagnostic/analyze", response_model=DiagnosticResult)
async def analyze_vehicle(
    request: DiagnosticRequest,
    background_tasks: BackgroundTasks,
    token: str = Depends(verify_auth_token)
):
    """Perform comprehensive vehicle diagnostic analysis"""
    try:
        logger.info(f"Starting diagnostic analysis for vehicle {request.vehicle_id}")
        
        # Generate unique diagnosis ID
        diagnosis_id = f"diag_{request.vehicle_id}_{int(datetime.utcnow().timestamp())}"
        
        # Analyze OBD data
        obd_analysis = await diagnostic_manager.analyze_obd_data(request.obd_data)
        
        # Get AI analysis
        ai_analysis = await diagnostic_manager.get_xai_analysis({
            'make': request.make,
            'model': request.model,
            'year': request.year,
            'obd_data': request.obd_data,
            'symptoms': request.symptoms
        })
        
        # Determine issues and recommendations
        primary_issues = []
        recommendations = []
        urgency_level = "low"
        
        if obd_analysis.get('prediction') == 'critical':
            urgency_level = "critical"
            primary_issues.append({
                'type': 'engine_failure',
                'description': 'Critical engine condition detected',
                'confidence': obd_analysis.get('confidence', 0.8)
            })
            recommendations.append({
                'action': 'immediate_inspection',
                'description': 'Schedule immediate professional inspection',
                'priority': 'high'
            })
        elif obd_analysis.get('prediction') == 'maintenance_required':
            urgency_level = "medium"
            primary_issues.append({
                'type': 'maintenance_due',
                'description': 'Vehicle requires maintenance',
                'confidence': obd_analysis.get('confidence', 0.7)
            })
            recommendations.append({
                'action': 'schedule_maintenance',
                'description': 'Schedule routine maintenance',
                'priority': 'medium'
            })
        
        # Calculate estimated costs (placeholder)
        estimated_cost = {
            'min': 100.0,
            'max': 500.0,
            'currency': 'USD'
        }
        
        # Calculate next maintenance
        next_maintenance = datetime.utcnow() + timedelta(days=90)
        
        result = DiagnosticResult(
            vehicle_id=request.vehicle_id,
            diagnosis_id=diagnosis_id,
            timestamp=datetime.utcnow(),
            primary_issues=primary_issues,
            recommendations=recommendations,
            confidence_score=obd_analysis.get('confidence', 0.75),
            estimated_cost=estimated_cost,
            urgency_level=urgency_level,
            ai_analysis=ai_analysis,
            next_maintenance=next_maintenance
        )
        
        # Schedule background task to store results
        background_tasks.add_task(store_diagnostic_result, result)
        
        logger.info(f"Diagnostic analysis completed for vehicle {request.vehicle_id}")
        return result
        
    except Exception as e:
        logger.error(f"Error during diagnostic analysis: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during analysis")

@app.get("/diagnostic/{diagnosis_id}")
async def get_diagnostic_result(
    diagnosis_id: str,
    token: str = Depends(verify_auth_token)
):
    """Retrieve diagnostic result by ID"""
    # Placeholder implementation - in production, retrieve from database
    return {"message": f"Diagnostic result for {diagnosis_id} would be retrieved from database"}

@app.get("/models/status")
async def get_model_status(token: str = Depends(verify_auth_token)):
    """Get status of loaded ML models"""
    return {
        "models_loaded": list(ml_models.keys()),
        "scaler_initialized": scaler is not None,
        "total_models": len(ml_models)
    }

async def store_diagnostic_result(result: DiagnosticResult):
    """Store diagnostic result (background task)"""
    try:
        # In production, store to database and blockchain
        logger.info(f"Storing diagnostic result {result.diagnosis_id}")
        
        # Placeholder for database storage
        # await database.store_diagnostic(result)
        
        # Placeholder for blockchain storage
        # await hedera_service.store_diagnostic_hash(result)
        
    except Exception as e:
        logger.error(f"Error storing diagnostic result: {e}")

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info",
        reload=True
    )