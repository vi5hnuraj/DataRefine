# 📊 DataRefine - The Ultimate AI Dashboard Generator

Welcome to **DataRefine**, a full-stack platform designed to transform raw datasets into stunning, interactive, and AI-driven analytical dashboards in seconds.

DataRefine seamlessly combines a beautiful **Next.js frontend** with a powerful **AWS Serverless ETL backend** to deliver a scalable, enterprise-grade data visualization experience.

## System Architecture

DataRefine is separated into two primary microservices that work in harmony:

1. **The Frontend Client (`/frontend`)**
   - A highly responsive Next.js 15 application utilizing Tailwind CSS and Radix UI.
   - Handles user authentication (NextAuth), UI rendering, dataset history, and AI dashboard preview generation.
   - Provides users with real-time updates as their data is analyzed in the cloud.

2. **The Serverless ETL Pipeline (`/backend`)**
   - An event-driven architecture built with AWS SAM, Lambda, SQS, and S3.
   - When a dataset is uploaded via the frontend, the backend pipeline automatically kicks into gear, asynchronously parsing massive files, calculating data quality heuristics, and leveraging Groq's ultra-fast LLMs to generate executive data summaries.
   - Processed metadata is stored in MongoDB, ensuring strict privacy based on User ID mapping.

## Quick Start

### 1. Launch the Frontend
Navigate into the `frontend` directory to start the web application:
```bash
cd frontend
npm install
npm run dev
```
*(Make sure to copy `.env.example` to `.env` and provide your MongoDB URI).*

### 2. Deploy the Backend
Navigate into the `backend` directory to launch the serverless pipeline:
```bash
cd backend
sam build
sam deploy --guided
```
*(You will need AWS CLI and SAM CLI configured).*

## License

This project is built from scratch and is completely open-source. Feel free to fork, modify, and extend DataRefine for your own data workflows!


