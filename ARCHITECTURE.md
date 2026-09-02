# Architecture Blueprint - Real-Time Emergency Legal Assistance Platform

## 1. System Overview & Core Tech Stack

Our platform is a real-time system designed to connect detained individuals with nearby law offices. High availability, low latency, and robust security are critical. The core tech stack is:

*   **Backend Framework:** FastAPI (Python 3.11) - Selected for its high performance, native async support, and automatic OpenAPI documentation generation.
*   **Database:** Firebase Firestore - A NoSQL document database providing real-time synchronization, high scalability, and seamless integration with Google Cloud.
*   **Compute:** Google Cloud Run (Region: `southamerica-east1`) - Fully managed serverless execution environment, ideal for containerized stateless applications, offering auto-scaling (including scale-to-zero) and high availability in the Brazilian region to minimize latency.
*   **CI/CD:** GitHub Actions - Automates the build, test, and deployment pipelines to Cloud Run, utilizing the `GCP_SA_KEY` secret for secure GCP authentication.

## 2. Layered Architecture

To ensure separation of concerns, testability, and future scalability, the FastAPI application follows a strictly layered architecture. We must avoid coupling HTTP request handling directly with database operations.

The application (`app/`) is divided into three primary layers:

1.  **API Routers (Controllers):** `app/routers/`
    *   **Responsibility:** Handle incoming HTTP requests, validate input using Pydantic models (from `app/models.py` or schemas), route the request to the appropriate service, and return HTTP responses.
    *   **Rule:** Should contain zero business logic or direct database queries.

2.  **Business Logic Services:** `app/services/`
    *   **Responsibility:** Contain the core business rules of the application (e.g., finding the nearest lawyer, validating case eligibility). They orchestrate operations by calling repositories or external APIs.
    *   **Rule:** Independent of the HTTP transport layer and database implementation details.

3.  **Data Access Repositories:** `app/repositories/`
    *   **Responsibility:** Abstract all interactions with Firebase Firestore. They encapsulate the specific database queries and data mapping.
    *   **Rule:** Services call repositories to fetch or save data. If we ever migrate away from Firestore, only the repository layer needs to change.

## 3. Concurrency Control (Atomic State Transitions)

A critical scenario is when multiple law offices attempt to accept the same emergency case simultaneously. We must prevent race conditions where a case is assigned to multiple lawyers.

*   **Solution:** Firestore Transactions.
*   **Implementation:** When a lawyer attempts to accept a case, the backend must execute a transaction that:
    1.  Reads the current state of the case document.
    2.  Verifies the status is strictly `PENDING` (or similar unassigned state).
    3.  If `PENDING`, updates the state to `ACCEPTED` and sets the `assigned_lawyer_id`.
    4.  If the state is already `ACCEPTED` (meaning another lawyer got it first in a concurrent request), the transaction is aborted, and an appropriate error (e.g., HTTP 409 Conflict) is returned to the client.
*   **Benefits:** Guarantees atomicity. Firestore handles the pessimistic concurrency control natively, ensuring the read-modify-write cycle is safe against concurrent modifications.

## 4. Asynchronous Processing (Gemini OCR Integration)

Processing documents (e.g., identity cards, police reports) using Gemini OCR can be time-consuming. Performing this synchronously within an HTTP request will block the server, leading to timeouts and a degraded user experience.

*   **Solution:** Cloud Tasks (or a dedicated background worker system like Celery/PubSub) combined with FastAPI Background Tasks for lightweight operations. Given the serverless Cloud Run environment, **Google Cloud Tasks** is the recommended robust approach.
*   **Implementation Flow:**
    1.  The client uploads a document via an API endpoint.
    2.  The FastAPI router saves the document to a storage bucket (e.g., Google Cloud Storage) and immediately creates a task in a Cloud Tasks queue, pointing to a webhook endpoint in our API (e.g., `/internal/process-ocr`).
    3.  The router returns an HTTP 202 (Accepted) response to the client with a job ID, indicating processing has started.
    4.  Cloud Tasks asynchronously calls the `/internal/process-ocr` endpoint with the necessary payload.
    5.  This internal endpoint (secured via OIDC tokens or internal networking) executes the Gemini OCR extraction.
    6.  Once complete, the result is saved to Firestore, and optionally, a real-time notification (via Firebase Realtime Database or FCM) is pushed to the client.

## 5. Compliance & Security Highlights

Operating in the legal tech space in Brazil requires strict adherence to privacy and professional regulations.

*   **LGPD (Lei Geral de Proteção de Dados) Compliance:**
    *   **Data Minimization:** Only collect necessary personal data.
    *   **Encryption at Rest & in Transit:** Firestore provides encryption at rest by default. Cloud Run enforces HTTPS for encryption in transit.
    *   **PII Field Encryption:** For highly sensitive fields (e.g., specific case details or personal identification numbers), we will implement application-level encryption before storing data in Firestore, ensuring even database administrators cannot read plain text PII.
    *   **Audit Logging:** Implement comprehensive audit logs (using Cloud Logging) for all access to sensitive data and critical state changes.
*   **OAB (Ordem dos Advogados do Brasil) SaaS Structural Alignment:**
    *   **No Intermediation Fees:** The platform must strictly act as a technological bridge and not charge "finder's fees" per case, adhering to OAB ethical guidelines against the mercantilization of law. The SaaS model should be subscription-based.
    *   **Data Sovereignty:** By deploying exclusively in `southamerica-east1` (São Paulo), we ensure data remains within Brazilian jurisdiction, simplifying legal compliance.
    *   **Access Control:** Strict Role-Based Access Control (RBAC) ensuring only verified, registered lawyers with active OAB numbers can access case details.
