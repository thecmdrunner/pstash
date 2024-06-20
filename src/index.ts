import { DISCORD_WEBHOOK_URL } from "@/lib/constants";
import { APIGatewayProxyResult, Callback, Context, SQSEvent } from "aws-lambda";

export const handler = async (
  event: SQSEvent,
  context: Context,
  callback: Callback
): Promise<APIGatewayProxyResult> => {
  try {
    for await (const record of event.Records) {
      const messageBody = record.body;
      console.log("Message Body:", messageBody);

      // Perform your processing logic here
      await sendLogToDiscord(messageBody);
    }

    // return `Successfully processed ${event.Records.length} messages.`;
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Hello, world!" }),
    };
  } catch (error) {
    console.error("Error processing SQS messages:", error);
    throw error;
  }
};

export const sendLogToDiscord = async (content: string) => {
  try {
    const res = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        content,
        flags: 4096,
      }),
    });

    if (!res.ok) {
      throw new Error(
        `Failed to send Discord message: ${res.status}, ${res.statusText}!`
      );
    }

    return {
      response: res,
      success: true,
    };
  } catch (err) {
    console.error(err);
    return {
      error: err,
      response: null,
      success: false,
    };
  }
};
