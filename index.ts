import type {
  APIGatewayProxyResult,
  Callback,
  Context,
  SQSEvent,
} from "aws-lambda";
const DISCORD_WEBHOOK_URL =
  // "https://discord.com/api/webhooks/1253350657864241246/SZRmeagS_yoD5Pw7E-eid5i-OPWJ2LPW1HZuOUygA6bxWbkfuw8IBpQo9DEgB7a6KwFH";

  "https://discord.com/api/webhooks/1147482808126820383/Y31zfbdTUilSfRedOBvFXP9K-1Or6R_LMHush4utahxPJybc7OrvDprxgcO-kDn8RiUj";

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

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Namaste, world!" }),
    };
  } catch (error) {
    console.error("Error processing SQS messages:", error);
    throw error;
  }
};

const sendLogToDiscord = async (content: string) => {
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
