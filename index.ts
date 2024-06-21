import type {
  APIGatewayProxyResult,
  Callback,
  Context,
  SQSEvent,
} from "aws-lambda";

export const handler = async (
  event: SQSEvent,
  context: Context,
  callback: Callback
): Promise<APIGatewayProxyResult> => {
  try {
    // TODO: Trigger one lambda per message in the SQS queue.
    for await (const record of event.Records) {
      const messageBody = record.body;
      console.log("Message Body:", messageBody);

      const message = JSON.parse(messageBody) as {
        url: string;
        callbackUrl?: string;
        body?: string;
        deduplicationId: string;
        maxRetries: number;
        headers?: Record<string, string>;
        method: "POST" | "GET" | "PUT" | "DELETE";
        failureCallback?: string;
      };

      const LAMBDA_TIMEOUT_MS = 20_000; // 20 seconds

      // Implement processing logic here (use native `fetch`)
      const abortController = new AbortController();
      const timeout = setTimeout(() => {
        abortController.abort();
      }, LAMBDA_TIMEOUT_MS);

      const response = await fetch(message.url, {
        method: message.method,
        headers: message.headers,
        body: message.body,
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      // Handle response if needed
      console.log("Response:", await response.text());
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Namaste, world!" }),
    };
  } catch (error) {
    console.error("Error processing SQS messages:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error processing SQS messages" }),
    };
  }
};

// export const handler = async (
//   event: SQSEvent,
//   context: Context,
//   callback: Callback
// ): Promise<APIGatewayProxyResult> => {
//   try {
//     for await (const record of event.Records) {
//       const messageBody = record.body;
//       console.log("Message Body:", messageBody);

//       const message = JSON.parse(messageBody) as {
//         url: string;
//         callbackUrl?: string;
//         body?: string;
//         deduplicationId: string;
//         maxRetries: number;
//         headers?: Record<string, string>;
//         method: "POST" | "GET" | "PUT" | "DELETE";
//         failureCallback?: string;
//       };

//       // Implement processing logic here (use native `fetch`)
//       const abortController = new AbortController();
//       const timeout = setTimeout(() => {
//         abortController.abort();
//       }, 60000); // 1 minute timeout

//       try {
//         const response = await fetch(message.url, {
//           method: message.method,
//           headers: message.headers,
//           body: message.body,
//           signal: abortController.signal,
//         });

//         if (!response.ok) {
//           throw new Error(`Failed to fetch: ${response.statusText}`);
//         }

//         // Handle response if needed
//         console.log("Response:", await response.text());
//       } catch (error) {
//         console.error("Fetch error:", error);

//         // If there is a failureCallback URL, you might want to notify it here
//         if (message.failureCallback) {
//           try {
//             await fetch(message.failureCallback, {
//               method: "POST",
//               headers: { "Content-Type": "application/json" },
//               body: JSON.stringify({ error: error.message }),
//             });
//           } catch (failureCallbackError) {
//             console.error("Failure callback error:", failureCallbackError);
//           }
//         }
//       } finally {
//         clearTimeout(timeout);
//       }
//     }

//     return {
//       statusCode: 200,
//       body: JSON.stringify({ message: "Namaste, world!" }),
//     };
//   } catch (error) {
//     console.error("Error processing SQS messages:", error);
//     return {
//       statusCode: 500,
//       body: JSON.stringify({ error: "Error processing SQS messages" }),
//     };
//   }
// };
