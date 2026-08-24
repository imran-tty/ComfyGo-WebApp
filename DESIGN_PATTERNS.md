================================================================================
                        COMFYGO BACKEND - DESIGN PATTERNS
                         Travel & Tourism Management System
                         FastAPI + SQLAlchemy + PostgreSQL
================================================================================


1. DEPENDENCY INJECTION PATTERN
─────────────────────────────────────────────────────────────────────────────────
Location : app/core/deps.py, app/core/database.py, all routers
Framework: FastAPI's built-in Depends() system

FastAPI's dependency injection container is the backbone of the entire backend.
Every endpoint receives its dependencies (database sessions, authenticated users,
role checks) injected automatically rather than creating them manually.

    # Database session injected into every endpoint
    async def login(..., db: AsyncSession = Depends(get_db)):

    # Authenticated user injected via token
    async def get_profile(user: dict = Depends(require_user), ...):

    # Role-specific guard injected
    async def admin_stats(user: dict = Depends(require_admin), ...):

Dependencies form a chain:
    get_db()              -> yields an async DB session
    get_current_user_optional() -> depends on get_db + HTTPBearer
    require_user()        -> depends on get_current_user_optional
    require_admin()       -> depends on require_user

Benefits:
    - Endpoints are decoupled from auth logic and DB setup
    - Easy to override for testing (app.dependency_overrides)
    - Single source of truth for cross-cutting concerns


2. UNIT OF WORK PATTERN
─────────────────────────────────────────────────────────────────────────────────
Location : app/core/database.py  (get_db function)

The get_db() dependency manages a database session that acts as a Unit of Work.
It groups multiple operations into a single transaction that commits on success
or rolls back on failure.

    async def get_db():
        async with async_session() as session:
            try:
                yield session          # endpoint runs here, may call flush()
                await session.commit() # single commit after endpoint returns
            except Exception:
                await session.rollback()  # undo everything on error
                raise

Flow per request:
    1. Session opened
    2. Endpoint executes, may call db.add() / db.flush()
    3. If endpoint returns normally -> session.commit()
    4. If endpoint raises exception -> session.rollback()

Benefits:
    - All DB changes in a request are atomic
    - No partial writes on error
    - Endpoints don't need to manage transactions manually


3. REPOSITORY / DATA ACCESS PATTERN
─────────────────────────────────────────────────────────────────────────────────
Location : app/routers/auth.py, tourist.py, guide.py, manager.py, admin.py

Each router module acts as a domain-specific data access layer. Rather than
a formal Repository class, queries are encapsulated within endpoint functions
using SQLAlchemy's ORM query builder.

    # Auth router queries all user tables to find matching credentials
    stmt = select(User).where(User.user_email == email).limit(1)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    # Tourist router joins Booking with Payment for enriched results
    stmt = (
        select(Booking, Payment.price)
        .outerjoin(Payment, Booking.booking_id == Payment.booking_id)
        .where(Booking.user_id == user["id"])
    )

Domain separation:
    auth.py     -> authentication & registration across all user types
    tourist.py  -> tourist-specific: profile, booking, packages
    guide.py    -> guide-specific: profile, booking approval
    manager.py  -> manager-specific: profile, hotel mgmt, booking approval
    admin.py    -> admin-specific: full CRUD on all entities
    public.py   -> unauthenticated: destinations, contact, public listings


4. DATA TRANSFER OBJECT (DTO) PATTERN
─────────────────────────────────────────────────────────────────────────────────
Location : app/schemas/schemas.py

Pydantic models serve as DTOs, defining strict contracts for request bodies
and response payloads. They decouple the API surface from the ORM models.

Request DTOs (validate incoming data):
    LoginRequest           -> { email, password }
    TouristSignupRequest   -> { user_id, user_name, user_email, ... }
    GuideSignupRequest     -> { guide_nid, guide_name, guide_email, ... }
    ManagerSignupRequest   -> { manager_id, manager_name, ... }
    TransportBookingRequest -> { transport_id, travel_date }
    BookingApprovalRequest -> { booking_id }
    AdminUserCreate        -> { user_id, user_name, ... }

Response DTOs (shape outgoing data):
    TokenResponse          -> { access_token, role, user_id, user_name }
    UserResponse           -> { user_id, user_email, user_name, user_phone }
    HotelResponse          -> { hotel_registration_number, hotel_name, ... }
    BookingResponse        -> { booking_id, booking_type, ... }
    PackageResponse        -> { package_id, package_name, ... }

Benefits:
    - Input validation happens before endpoint logic
    - API responses have a stable shape regardless of DB schema changes
    - OpenAPI/Swagger docs are auto-generated from these schemas


5. ACTIVE RECORD PATTERN
─────────────────────────────────────────────────────────────────────────────────
Location : app/models/models.py

SQLAlchemy ORM models follow the Active Record pattern. Each model class
represents a database table, and instances represent rows. The instances
carry both data and the behavior to persist/load themselves.

    class User(Base):
        __tablename__ = "users"
        user_id    = Column("user_id", String(100), primary_key=True)
        user_email = Column("user_email", String(100), unique=True)
        ...

        # Instance carries data
        user = User(user_id="USR001", user_name="Rahim")

        # Instance can be persisted
        db.add(user)
        await db.flush()

        # Instance can be modified and saved
        user.user_name = "Rahim Uddin"
        # committed by get_db() after endpoint returns

Models defined: User, Hotel, Manager, Transportation, Guide, Booking,
Payment, ContactMessage, TouristSpot, Admin, Package, UserPackage


6. FACADE PATTERN
─────────────────────────────────────────────────────────────────────────────────
Location : app/main.py

The FastAPI application instance acts as a Facade, providing a single unified
entry point to the entire backend subsystem. Clients (frontend, mobile app,
third-party integrators) interact only with this facade.

    app = FastAPI(title="ComfyGo API", version="1.0.0")
    app.add_middleware(CORSMiddleware, ...)
    app.include_router(auth.router)
    app.include_router(tourist.router)
    app.include_router(guide.router)
    app.include_router(manager.router)
    app.include_router(public.router)
    app.include_router(admin.router)

The facade hides:
    - Router registration and URL mapping
    - Middleware configuration (CORS)
    - OpenAPI documentation generation
    - Dependency injection wiring


7. FACTORY PATTERN
─────────────────────────────────────────────────────────────────────────────────
Location : app/core/deps.py  (require_role function)

The require_role() function is a factory that dynamically creates
role-checking dependencies at module import time.

    async def require_role(role: str):
        """Factory that returns a dependency requiring a specific role."""
        async def _check(user: dict = Depends(require_user)) -> dict:
            if user["role"] != role:
                raise HTTPException(status_code=403, detail=f"Requires role: {role}")
            return user
        return _check

Usage:
    # Creates a one-time dependency for "guide" role
    guide_only = await require_role("guide")

    # Applied to endpoints that need specific roles
    @router.get("/guide-only-data")
    async def guide_data(user: dict = Depends(require_role("guide"))):
        ...

This avoids duplicating role-check boilerplate across endpoints.


8. STRATEGY PATTERN
─────────────────────────────────────────────────────────────────────────────────
Location : app/routers/auth.py  (login endpoint)

The login endpoint implements a Strategy pattern for credential verification.
It tries multiple authentication strategies sequentially, returning the first
successful result:

    Strategy 1: Check tourists  -> select(User).where(email == ...)
    Strategy 2: Check guides    -> select(Guide).where(email == ...)
    Strategy 3: Check managers  -> select(Manager).where(email == ...)
    Strategy 4: Check admins    -> select(Admin).where(email == ...)

Each strategy is independent. The login endpoint doesn't know which table
the user is in -- it tries all strategies and returns the matching one.
This allows adding new user types (e.g., "driver") by appending a new
strategy without modifying existing logic.


9. CHAIN OF RESPONSIBILITY PATTERN
─────────────────────────────────────────────────────────────────────────────────
Location : app/main.py, Starlette/FastAPI middleware stack

Request processing flows through a chain of middleware handlers:

    Client Request
        |
        v
    CORSMiddleware          -> handles preflight, adds CORS headers
        |
        v
    ExceptionMiddleware     -> catches exceptions, returns error responses
        |
        v
    Router                  -> matches URL, resolves dependencies
        |
        v
    Endpoint function       -> business logic executes
        |
        v
    get_db()                -> Unit of Work commit/rollback
        |
        v
    Response flows back up the chain

Each layer can handle the request or pass it to the next handler.
Middleware is configured in main.py via add_middleware().
Dependencies form their own chain (see Pattern 1).


10. TEMPLATE METHOD PATTERN
─────────────────────────────────────────────────────────────────────────────────
Location : app/routers/manager.py, app/routers/guide.py

The manager and guide routers share an identical structural template for
booking management. The algorithm skeleton is:

    1. Verify user role (manager/guide)
    2. Look up entity-specific context (manager's hotel / guide's NID)
    3. Query bookings filtered by that context
    4. Return results

    # Manager version (filters by hotel_registration_number)
    async def list_pending_bookings(user, db):
        if user["role"] != "manager": ...          # Step 1
        mgr = lookup_manager(user["id"], db)       # Step 2
        bookings = query_by_hotel(mgr.hotel_reg)   # Step 3
        return format_responses(bookings)           # Step 4

    # Guide version (filters by guide_nid)
    async def list_pending_bookings(user, db):
        if user["role"] != "guide": ...            # Step 1
        # guide_nid comes directly from user["id"] # Step 2
        bookings = query_by_guide_nid(user["id"])  # Step 3
        return format_responses(bookings)           # Step 4

The skeleton is identical; only the context lookup and filter differ.


11. ADAPTER PATTERN
─────────────────────────────────────────────────────────────────────────────────
Location : app/routers/admin.py  (list_bookings endpoint)

The admin bookings endpoint adapts the raw DB query results into a
unified response format by joining multiple tables and mapping fields:

    stmt = (
        select(Booking, Payment.price, User.user_name)
        .outerjoin(Payment, ...)
        .outerjoin(User, ...)
    )

    # Adapts (Booking, price, name) tuples -> flat dicts
    return [
        {
            "booking_id": b.booking_id,
            "price": price,
            "user_name": name,
            ...
        }
        for b, price, name in rows
    ]

This adapts the multi-table JOIN result into a flat JSON-friendly structure
that the frontend expects, without changing the underlying data model.


12. SINGLETON PATTERN
─────────────────────────────────────────────────────────────────────────────────
Location : app/core/config.py, app/core/database.py

Module-level instances serve as singletons for shared infrastructure:

    # config.py - one Settings instance for the entire app
    settings = Settings()

    # database.py - one engine and session factory
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = async_sessionmaker(engine, ...)

These are created once at import time and shared across all requests.
No request should create its own engine or config.


13. MEDALLION / CLEAN ARCHITECTURE (Layered Separation)
─────────────────────────────────────────────────────────────────────────────────
Location : Full project structure

The backend follows a layered architecture with clear separation of concerns:

    app/
    ├── core/              <-- Infrastructure layer
    │   ├── config.py      (settings, env vars)
    │   ├── database.py    (engine, session, Base)
    │   ├── security.py    (JWT, password hashing)
    │   └── deps.py        (auth dependencies)
    │
    ├── models/            <-- Data layer
    │   └── models.py      (SQLAlchemy ORM models)
    │
    ├── schemas/           <-- Contract layer
    │   └── schemas.py     (Pydantic request/response DTOs)
    │
    ├── routers/           <-- Presentation layer
    │   ├── auth.py        (authentication endpoints)
    │   ├── tourist.py     (tourist endpoints)
    │   ├── guide.py       (guide endpoints)
    │   ├── manager.py     (manager endpoints)
    │   ├── admin.py       (admin endpoints)
    │   └── public.py      (public/unauthenticated endpoints)
    │
    └── main.py            <-- Application composition root

Dependency rule: outer layers depend on inner layers, never the reverse.
  Routers depend on Schemas, Models, Core.
  Core depends on nothing else.
  Models depend on Core (Base, database).


14. HEALTH CHECK PATTERN
─────────────────────────────────────────────────────────────────────────────────
Location : app/main.py

    @app.get("/api/health")
    async def health_check():
        return {"status": "ok", "service": "ComfyGo API"}

Standard observability endpoint for load balancers, Docker health probes,
and monitoring dashboards to verify the service is alive.


15. ROLE-BASED ACCESS CONTROL (RBAC) PATTERN
─────────────────────────────────────────────────────────────────────────────────
Location : app/core/deps.py, all routers

Authentication and authorization are separated:

    Authentication (who are you?):
        JWT token decoded in get_current_user_optional()
        Token contains: { sub: entity_id, role: "tourist"|"guide"|"manager"|"admin" }

    Authorization (what can you do?):
        require_user()   -> any authenticated user
        require_admin()  -> admin role only
        Role checks in endpoints: if user["role"] != "tourist": raise 403

Four roles with distinct permissions:
    Tourist  -> profile, booking, packages
    Guide    -> profile, guide-specific booking approval
    Manager  -> profile, hotel management, hotel booking approval
    Admin    -> full CRUD on all entities, stats, charts


16. PAGINATION / FILTERING PATTERN (via Query Parameters)
─────────────────────────────────────────────────────────────────────────────────
Location : app/routers/tourist.py, app/routers/public.py

List endpoints support optional filtering via query parameters:

    @router.get("/transports")
    async def list_transports(route: str = "", db=...):
        if route:
            transports = [t for t in all if route in t.route]

    @router.get("/hotels")
    async def list_hotels(division: str = "", db=...):
        if division:
            stmt = select(Hotel).where(Hotel.hotel_division == division)

    @router.get("/guides")
    async def list_guides(guide_division: str = "", db=...):
        ...

No pagination is implemented yet (all results returned), but the filtering
infrastructure is in place.


17. SEED / FACTORY DATA PATTERN
─────────────────────────────────────────────────────────────────────────────────
Location : seed_postgres.py, seed_mysql.py

Dedicated seed scripts create reproducible test/dev data with known
credentials. This is a form of the Test Data Builder pattern:

    Users   -> USR001 (rahim@example.com / password123)
    Guides  -> NID1001 (farhan@example.com / password123)
    Managers -> MGR001 (aminul@example.com / password123)
    Admin   -> ADM001 (admin@gmail.com / ComfyGo2026)

Seed scripts also serve as living documentation of the expected schema.


================================================================================
                            SUMMARY TABLE
================================================================================

 #  Pattern                        Location                    Purpose
 ── ────────────────────────────── ─────────────────────────── ──────────────
  1  Dependency Injection           deps.py, all routers       Decouple concerns
  2  Unit of Work                   database.py (get_db)       Atomic transactions
  3  Repository (Data Access)       routers/*.py               Domain queries
  4  Data Transfer Object           schemas/schemas.py         API contracts
  5  Active Record                  models/models.py           ORM persistence
  6  Facade                         main.py                    Unified entry point
  7  Factory                        deps.py (require_role)     Dynamic deps
  8  Strategy                       auth.py (login)            Multi-table auth
  9  Chain of Responsibility        middleware stack           Request pipeline
 10  Template Method                manager.py, guide.py       Shared skeletons
 11  Adapter                        admin.py (list_bookings)   Shape transformation
 12  Singleton                      config.py, database.py     Shared infrastructure
 13  Clean / Layered Architecture   project structure          Separation of concerns
 14  Health Check                   main.py                    Observability
 15  RBAC                           deps.py, routers           Role-based auth
 16  Query Parameter Filtering      tourist.py, public.py      Data filtering
 17  Seed / Test Data Builder       seed_postgres.py           Reproducible dev data

================================================================================
