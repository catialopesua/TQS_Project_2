# BitSwap —  Product Specification Document


## Product summary

BitSwap is a videogame rental marketplace that connect renters who want to save money and have short-term access to videogames and item owners who want to monetize from renting their videogames.
The platform provides search, booking, payment and dashboards tailored for renters, owners and administrators.

## Features and requirements

Core features — highest priority:

- Renter services: search & filter, detailed game pages, booking for dates, simulated payments, renter dashboard for active/past rentals.
- Owner services: register & list games, manage availability/pricing, approve/reject bookings, owner dashboard with rentals & revenue.
- User management: register, login, role-based access (renter / owner / admin).
- Admin backoffice: manage users/listings, monitor suspicious activity, platform KPIs and basic moderation tools.

Extended features — lower priority:

- Recommendations engine (AI-powered)
- Real-time messaging between renters & owners
- Push / email notifications 
- Photo-based QA checklists

Technology stack:

- Frontend: *To be decided*
- Backend: *To be decided*
- Database: *To be decided*
- Deployment:*To be decided*

## Timeline and milestones

### Iteration I0 — Start (11/11)
**Main Activities**
- Define the product concept (vision, value, and scope).
- Develop **Personas**, **Main Scenarios**, and expected **Epics**.
- Team resources setup: code repository, collaborative documents space, …
- Initialize the **product backlog** (JIRA).


### Iteration I1 — Product Foundations (18/11)
**Main Activities**
- Define the **system architecture**.
- Define initial **Software Quality Engineering (SQE)** tools & practices.
- Build the **CI pipeline (initial version)**.
- Draft the **Product Specification Report**.
- Backlog management system setup.


### Iteration I2 — Core Development (25/11)
**Main Activities**
- Implement **a couple of core user stories** with working features.
- Initialize the **API** and repository structure.
- Improve and finalize the **CI pipeline** (full-featured).
- Prepare the **QA Manual** (report).
- Set up **test management environment** and begin automation.


### Iteration I3 — Product Increment (02/12)
**Main Activities**
- Deliver a **product increment** implementing at least 2 core user stories.
- Set up the **CD pipeline**.
- Complete the **Services API**.
- Implement additional user stories involving Data access and Persistence (customers & staff)

### Iteration I4 — Product Increment (09/12)
**Main Activities**
- Stabilize the **Minimal Viable Product**.
- All deployments are available on the server.
- Complete the **Services API**.
- Relevant/representative data included in the repositories (not a “clean state”). 
- Non-functional tests and systems observability.

### Iteration I5 — Presentation (16/12)
**Main Activities**
- n/a.


## Risks and challenges

Key risks and suggested mitigations:

- Booking conflicts (technical): strong calendar validation, optimistic locking and conflict detection in the booking module.
- Payment flow failures: use sandbox testing, idempotent operations and server-side verification of webhook events.
- Fraud / low listing quality: owner verification steps, photo-based QA and admin moderation workflows.
- Scalability if adoption grows: design stateless services, containerised deployment, and CDN for assets.

Operational risks: late returns, disputes — mitigate with clear policies, deposit or hold mechanisms, and an escalation workflow.

Market risks: competition from subscription services; mitigate by focusing on niche markets (retro games, collectors, local community) and value-added UX.

## User stories

The full set of user stories used to drive development is maintained in `./UserStories.md`. Below are a few high-priority examples (extracted):

- *To be decided*
- *To be decided*
- *To be decided*
- *To be decided*

## User personas

Representative personas are kept in `../It0/Personas.md`.

- Hannah Wilson — Product Owner
- Tom Schmidt — Renter
- Ronan Connsworth — Renter
- Dawan Houtcheques — Admin

## Functional Requirements

FR1 - **User Registration & Authentication:** Users must be able to register, log in, and log out securely. Role-based access should differentiate **Renter**, **Owner**, and **Admin** accounts.  

FR2 - **Renter: Search & Discovery:** Renters must be able to search for videogames using keywords, filters (price, rating, platform, genre), and view recommended games based on preferences and rental history.  

FR3 - **Renter: Booking & Rental Periods:** Renters must be able to book videogames for specific rental periods, view rental history, and track active rentals via the **Renter Dashboard**.  

FR4 - **Owner: Item Registration & Management:** Owners must be able to register new videogames, upload images and descriptions, set availability, and update or deactivate listings as needed.  

FR5 - **Owner: Booking Management:** Owners must be able to view incoming booking requests, approve or reject them, and manage current and past rentals via the **Owner Dashboard**.  

FR6 - **Platform Backoffice (Admin):** Admins must be able to view key metrics including active users, listings, booking trends, transaction value, and platform performance. Basic analytics and reporting must be available.  

FR7 - **Payment Integration:** The platform must support payment processing via sandboxed services (Stripe Test Mode, PayPal Sandbox). Payment confirmation should update rental status automatically.  

FR8 - **Advanced Search & Recommendations (Extended):** AI-powered recommendations must suggest games based on user behavior and rental history. Advanced filters should allow multi-criteria searches (price range, rating, distance, features).  

FR9 - **Dashboards & Visualizations (Extended):** Owners should have visualizations showing revenue trends, item popularity, occupancy rates, and geographic demand via a map interface.  

FR10 - **Messaging & Notifications (Extended):** In-app messaging between renters and owners must be available. Automated notifications (booking confirmations, reminders, updates) via email or SMS must be supported.  

FR11 - **Quality Assurance System (Extended):** Pre- and post-rental condition checklists with photos must be implemented. Maintenance tracking, service history, and quality scoring based on condition reports and reviews should be available for owners.  

FR12 - **Profile & Preferences Management:** Users must be able to edit profiles, manage preferences, and update payment methods or personal information securely.  

FR13 - **Search History & Favorites (Extended):** Renters should be able to save favorite games and view their search history to facilitate repeat rentals.  

FR14 - **Notifications for Admin Actions (Extended):** Admins must receive alerts for suspicious activities, failed payments, or system anomalies for timely action.  


## Non-functional Requirements

NFR1 - **Performance:** The platform must load pages in under 2 seconds and handle up to 1,000 concurrent users without noticeable slowdown.  

NFR2 - **Scalability:** The system should support horizontal scaling for backend services and database clusters, allowing the platform to grow as user base increases.  

NFR3 - **Availability:** The platform must maintain 99.9% uptime for core services (search, booking, dashboards).

NFR4 - **Reliability:** All booking transactions and payments must be processed reliably, with error handling and retry mechanisms for failed operations.  

NFR5 - **Security:**  
- HTTPS enforced across all endpoints.  
- Role-Based Access Control (RBAC) for Renter, Owner, and Admin.  
- Protection against SQL Injection and other common vulnerabilities.  
- Audit logs for admin and owner actions.  

NFR6 - **Usability:**  
- User-friendly and intuitive UI for all roles.  
- Responsive design.

NFR7 - **Maintainability:** Codebase should be modular and well-documented, enabling quick bug fixes and feature enhancements.  

NFR8 - **Extensibility:** Architecture should allow future features like AI recommendations without major refactoring.  

NFR9 - **Logging & Monitoring:**  
- Centralized logging for backend services.  
- Real-time monitoring and alerting for errors and performance anomalies.  

## Design specifications

Key screens:

- Homepage with search bar and featured listings
- Game details page with image carousel and booking widget
- Renter dashboard (active, pending, history)
- Owner dashboard (inventory, revenue charts)
- Admin dashboard (KPIs, user/listing management)

## References & next steps

- User stories: `./UserStories.md` 
- Personas: `../It0/Personas.md` 
- System architecture: `./SystemArchitecture.md`
- CI and pipeline: `./CIPipeline.md`
- SQA and tools: `./SQETools.md`

