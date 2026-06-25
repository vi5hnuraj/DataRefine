# DataRefine Frontend Client 🎨

<p align="center">
  <img alt="DataRefine" src="./public/logo.png" width="100" height="100">
</p>

<h1 align="center">The AI Dashboard Generator Interface</h1>

The frontend client for DataRefine provides a beautiful, modern interface where users can upload datasets, view their real-time ETL pipeline progress, and instantly generate interactive analytical dashboards.

## Features

- **Modern Architecture**: Built on Next.js 15 (App Router) and React 19.
- **Secure Authentication**: NextAuth integration with MongoDB for private dataset ownership.
- **Live Status Polling**: Real-time progress updates for the AWS Serverless ETL Pipeline.
- **Stunning UI**: Tailwind CSS combined with Radix UI primitives for a sleek, glassmorphic aesthetic.
- **Data Visualizations**: Integrated with Recharts to render beautiful dynamic dashboards.

## Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB Database

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Copy the `.env.example` file to `.env` and fill in your secrets:
   ```bash
   cp .env.example .env
   ```
   *Required variables include your `MONGODB_URI` and `NEXTAUTH_SECRET`.*

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:3000` to start building dashboards.

## Usage

Simply sign in to your account, navigate to the **Upload Data** page, and drag-and-drop a CSV dataset. The frontend will secure a pre-signed S3 URL and hand the heavy lifting off to the AWS Serverless Backend. You can track your dataset's progress live in the **History** tab!
