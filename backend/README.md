# DataRefine Serverless ETL Pipeline 🚀

The DataRefine Serverless ETL Pipeline is an event-driven, parallel data processing architecture built on AWS Lambda. It handles the heavy lifting of parsing, analyzing, and cleaning datasets uploaded by users, allowing the DataRefine frontend to remain lightning-fast.

## Architecture

When a user uploads a dataset via the Next.js frontend, the file is securely stored in an AWS S3 bucket. This triggers an S3 Event Notification, passing the payload into an SQS Queue, and finally invoking our AWS Lambda ETL pipeline.

1. **Upload**: User uploads a file directly to the S3 Input Bucket using a pre-signed URL.
2. **Trigger**: An S3 event is placed into the `ConversionQueue` (SQS).
3. **Execution**: The `DataRefineETLFunction` (Lambda) processes the file:
   - Evaluates data quality (null values, missing data).
   - Computes statistical insights.
   - Triggers the AI Auditor (Groq Llama 3.1) to generate a strategic data summary.
4. **Storage**: The processed insights and metadata are saved securely into MongoDB, mapped exclusively to the uploading user's `userId`.

## Tech Stack

- **Serverless Framework:** AWS SAM (Serverless Application Model)
- **Compute:** AWS Lambda (Node.js 20.x)
- **Storage:** Amazon S3
- **Messaging:** Amazon SQS & SNS
- **Database:** MongoDB
- **AI Integration:** Groq (Llama 3.1 70B) for data health analysis

## Deployment

This backend is designed to be easily deployed using the AWS SAM CLI.

### Prerequisites
- AWS CLI configured
- AWS SAM CLI installed
- Docker (for local building)

### Build & Deploy
1. Build the application:
   ```bash
   sam build
   ```
2. Deploy to AWS:
   ```bash
   sam deploy --guided
   ```
   *Make sure to provide your `MongoDBUri` and `GroqApiKey` when prompted by the SAM CLI.*

## Local Development
To test the Lambda function locally:
```bash
sam local invoke DataRefineETLFunction -e events/event.json
```
