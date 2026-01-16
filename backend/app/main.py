from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, expenses, receipts, friends
from app.config import settings

# Create FastAPI application
app = FastAPI(
    title="Expense Splitter API",
    description="Backend API for splitting expenses among friends and family",
    version="1.0.0"
)

# CORS middleware - allows React frontend to make requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server (desktop)
        "http://localhost:5174",  # Vite dev server (alternate port)
        "http://localhost:5175",  # Vite dev server (alternate port)
        "http://localhost:5176",  # Vite dev server (alternate port)
        "http://192.168.50.120:5173",  # Vite dev server (mobile testing)
        settings.FRONTEND_URL,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(expenses.router, prefix = "/api/expenses", tags = ["Expenses"])
app.include_router(receipts.router, prefix="/api/receipts", tags=["Receipts"])
app.include_router(friends.router, prefix="/api/friends", tags=["Friends"])

# Root endpoint
@app.get("/")
def read_root():
    """API root endpoint"""
    return {
        "message": "Expense Splitter API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "running"
    }

# Health check endpoint
@app.get("/health")
def health_check():
    """Health check endpoint for monitoring"""
    return {"status": "healthy"}

# Run with: uvicorn app.main:app --reload
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

